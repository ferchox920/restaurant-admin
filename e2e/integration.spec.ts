import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";

const origin = process.env.INTEGRATION_BASE_URL!;
const requireBackend = createRequire(
  resolve(process.env.INTEGRATION_BACKEND_PATH!, "package.json")
);
type DbClient = {
  connect(): Promise<void>;
  end(): Promise<void>;
  query(
    sql: string,
    values?: unknown[]
  ): Promise<{ rows: Record<string, unknown>[] }>;
};
const Pg = requireBackend("pg") as {
  Client: new (config: { connectionString: string }) => DbClient;
};
const db = new Pg.Client({ connectionString: process.env.DATABASE_URL! });
test.beforeAll(async () => db.connect());
test.afterAll(async () => db.end());

async function post(
  request: APIRequestContext,
  path: string,
  data: unknown,
  key?: string
) {
  return request.post(`/backend/api/${path}`, {
    data,
    headers: { Origin: origin, ...(key ? { "Idempotency-Key": key } : {}) },
  });
}
async function login(page: Page, role = "admin") {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(`${role}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.INTEGRATION_PASSWORD!);
  await page.getByRole("button", { name: "Abrir dashboard" }).click();
  await expect(page).toHaveURL(/dashboard/);
}
async function showOrderPanel(page: Page) {
  const button = page.getByRole("button", { name: /Consumos de la mesa/ });
  await expect(button).toBeVisible();
  if (
    !(await page
      .getByRole("button", { name: "Cerrar orden", exact: true })
      .isVisible())
  )
    await button.click();
}
async function closeDialog(page: Page) {
  await showOrderPanel(page);
  await page.getByRole("button", { name: "Cerrar orden", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test("real restaurant journey, concurrency, transport recovery, SSE and permissions", async ({
  page,
  browser,
}, info) => {
  test.setTimeout(180_000);
  const request = page.request;
  await page.addInitScript(() => {
    window.addEventListener("restaurant:operational-event", (event) => {
      const detail = (event as CustomEvent).detail;
      document.documentElement.dataset.integrationCursor = detail.cursor;
      document.documentElement.dataset.integrationEvent = detail.name;
    });
  });
  let orderId = "";
  let ticketId = "";
  const projectSuffix = info.project.name.startsWith("desktop") ? "M01" : "M02";
  const product = (
    await db.query('SELECT id FROM "Product" WHERE sku = $1', ["MVP-COKE-500"])
  ).rows[0].id as string;
  const channel = (
    await db.query('SELECT id FROM "SalesChannel" WHERE code = $1', [
      "DINING_ROOM",
    ])
  ).rows[0].id as string;
  const tableId = (
    await db.query('SELECT id FROM "RestaurantTable" WHERE code = $1', [
      projectSuffix,
    ])
  ).rows[0].id as string;
  await test.step("valid login, HttpOnly secure session, reload, role navigation", async () => {
    console.log(
      "valid login, HttpOnly secure session, reload, role navigation"
    );
    await login(page);
    const cookie = (await page.context().cookies()).find(
      (c) => c.name === "restaurant_session"
    )!;
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.secure).toBe(true);
    expect(cookie.sameSite).toBe("Lax");
    expect(cookie.path).toBe("/");
    expect(await page.evaluate(() => document.cookie)).not.toContain(
      "restaurant_session"
    );
    expect(
      await page.evaluate(() =>
        localStorage.getItem("restaurant_admin_access_token")
      )
    ).toBeNull();
    await page.reload();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto("/floor");
    await expect(
      page.getByRole("heading", { name: "Salón", exact: true })
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
  await test.step("open table in browser; empty order cannot close", async () => {
    console.log("open table in browser; empty order cannot close");
    const card = page.getByRole("article", {
      name: `Mesa ${projectSuffix}`,
      exact: true,
    });
    await card.getByRole("button", { name: /abrir/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const select = dialog.getByRole("combobox");
    await select.click();
    await page.getByRole("option", { name: "Salon", exact: true }).click();
    await dialog
      .getByRole("button", { name: "Abrir orden", exact: true })
      .click();
    await expect(page).toHaveURL(/table-orders\//);
    orderId = page.url().split("/").at(-1)!;
    await showOrderPanel(page);
    await expect(
      page.getByRole("button", { name: "Cerrar orden", exact: true })
    ).toBeDisabled();
    const empty = await (
      await request.get(`/backend/api/table-orders/${orderId}`)
    ).json();
    ticketId = empty.saleTicketId;
    const rejected = await post(
      request,
      `table-orders/${orderId}/close`,
      { paymentMethod: "CASH", expectedVersion: empty.version },
      randomUUID()
    );
    expect(rejected.status()).toBe(409);
  });
  await test.step("add, edit and delete items using string resource versions", async () => {
    console.log("add, edit and delete items using string resource versions");
    const catalogToggle = page.getByRole("button", {
      name: /Seleccionar productos/,
    });
    await expect(catalogToggle).toBeVisible();
    if (
      !(await page
        .getByRole("region", { name: "Catálogo de productos" })
        .getByRole("button", { name: "Sumar Coca-Cola 500ml", exact: true })
        .isVisible())
    )
      await catalogToggle.click();
    const add = page
      .getByRole("region", { name: "Catálogo de productos" })
      .getByRole("button", { name: "Sumar Coca-Cola 500ml", exact: true });
    for (let i = 1; i <= 2; i++) {
      const response = page.waitForResponse(
        (r) =>
          r.url().includes(`/table-orders/${orderId}/items`) &&
          r.request().method() !== "GET"
      );
      await add.click();
      expect((await response).ok()).toBe(true);
    }
    await showOrderPanel(page);
    const deleted = page.waitForResponse(
      (r) =>
        r.request().method() === "DELETE" &&
        r.url().includes("expectedVersion=")
    );
    await page
      .getByRole("button", { name: "Quitar Coca-Cola 500ml", exact: true })
      .click();
    expect((await deleted).ok()).toBe(true);
    const state = await (
      await request.get(`/backend/api/table-orders/${orderId}`)
    ).json();
    expect(state.saleTicket.items).toHaveLength(0);
    const added = await post(request, `table-orders/${orderId}/items`, {
      productId: product,
      quantity: 2,
      expectedVersion: state.version,
    });
    expect(added.ok()).toBe(true);
    await page.reload();
  });
  await test.step("two sessions: stale write denied, refresh for human review", async () => {
    console.log("two sessions: stale write denied, refresh for human review");
    const second = await browser.newContext({
      storageState: await page.context().storageState(),
    });
    try {
      const old = await (
        await request.get(`/backend/api/table-orders/${orderId}`)
      ).json();
      const itemId = old.saleTicket.items[0].id;
      const changed = await second.request.patch(
        `${origin}/backend/api/table-orders/${orderId}/items/${itemId}`,
        {
          data: { quantity: 3, expectedVersion: old.version },
          headers: { Origin: origin },
        }
      );
      expect(changed.ok()).toBe(true);
      const stale = await request.patch(
        `/backend/api/table-orders/${orderId}/items/${itemId}`,
        {
          data: { quantity: 4, expectedVersion: old.version },
          headers: { Origin: origin },
        }
      );
      expect(stale.status()).toBe(409);
      expect((await stale.json()).code).toBe("STALE_VERSION");
      const current = await (
        await request.get(`/backend/api/table-orders/${orderId}`)
      ).json();
      expect(current.saleTicket.items[0].quantity).toBe("3");
      expect(typeof current.version).toBe("string");
      await page.reload();
    } finally {
      await second.close();
    }
  });
  await test.step("browser close, double click and response lost after real commit", async () => {
    console.log(
      "browser close, double click and response lost after real commit"
    );
    await closeDialog(page);
    const keys: string[] = [];
    let lostDelivered!: () => void;
    const lostDelivery = new Promise<void>((resolveDelivery) => {
      lostDelivered = resolveDelivery;
    });
    await page.route(`**/api/table-orders/${orderId}/close`, async (route) => {
      keys.push(route.request().headers()["idempotency-key"]);
      // Real backend executes; only the delivery of its response is discarded.
      const response = await route.fetch();
      expect(response.ok()).toBe(true);
      await route.abort("failed");
      lostDelivered();
    });
    const submit = page
      .getByRole("dialog")
      .getByRole("button", { name: "Cerrar orden", exact: true });
    await submit.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    await expect.poll(() => keys.length).toBe(1);
    await lostDelivery;
    await page.unroute(`**/api/table-orders/${orderId}/close`);
    const committed = await (
      await request.get(`/backend/api/table-orders/${orderId}`)
    ).json();
    expect(committed.status).toBe("CLOSED");
    expect(committed.saleTicket.status).toBe("CONFIRMED");
    const stored = await page.evaluate(() =>
      Object.entries(sessionStorage).filter(([key]) =>
        key.startsWith("restaurant:commercial-intent:")
      )
    );
    expect(stored).toHaveLength(1);
    expect(stored[0][1]).toBe(keys[0]);
    const originalPayload = JSON.parse(
      stored[0][0].slice(stored[0][0].indexOf(":{") + 1)
    );
    const recovered = await post(
      request,
      `table-orders/${orderId}/close`,
      originalPayload,
      keys[0]
    );
    expect(recovered.ok()).toBe(true);
    expect((await recovered.json()).id).toBe(orderId);
    const mismatch = await post(
      request,
      `table-orders/${orderId}/close`,
      { ...originalPayload, paymentMethod: "TRANSFER" },
      keys[0]
    );
    expect(mismatch.status()).toBe(409);
    expect((await mismatch.json()).code).toBe("IDEMPOTENCY_KEY_REUSED");
    await page.reload();
    await expect(
      page.getByText("Venta confirmada por backend.", { exact: false })
    ).toBeVisible();
  });
  await test.step("stock, SALE_OUT, free table, audit and report reflect one sale", async () => {
    console.log(
      "stock, SALE_OUT, free table, audit and report reflect one sale"
    );
    const stock = (
      await db.query(
        'SELECT "currentStock"::text AS quantity FROM "ProductStock" WHERE "productId"=$1',
        [product]
      )
    ).rows[0].quantity;
    expect(stock).toBe("17.00");
    const moves = await db.query(
      'SELECT "movementType" AS type, COUNT(*)::int AS count FROM "InventoryMovement" WHERE "referenceId"=$1 GROUP BY "movementType"',
      [ticketId]
    );
    expect(moves.rows).toEqual([{ type: "SALE_OUT", count: 1 }]);
    const audits = await (
      await request.get(
        `/backend/api/audit-logs?entityId=${ticketId}&limit=100`
      )
    ).json();
    expect(JSON.stringify(audits)).toContain("SALE_TICKET_CONFIRM");
    const report = await (
      await request.get("/backend/api/reports/sales-by-channel")
    ).json();
    expect(JSON.stringify(report)).toContain(channel);
    await page.goto("/floor");
    expect(
      (await (await request.get(`/backend/api/tables/${tableId}`)).json())
        .status
    ).toBe("AVAILABLE");
    const card = page.getByRole("article", {
      name: `Mesa ${projectSuffix}`,
      exact: true,
    });
    await expect(card.getByText("Disponible", { exact: true })).toBeVisible();
    await page.goto("/reports/sales-by-channel");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await page.screenshot({
      path: info.outputPath("report.png"),
      fullPage: true,
    });
  });
  await test.step("SSE transport reconnect sends Last-Event-ID as header", async () => {
    await page.goto("/floor");

    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.dataset.integrationCursor)
      )
      .toMatch(/^\d+$/);
    const cursor = await page.evaluate(
      () => document.documentElement.dataset.integrationCursor
    );
    let replayHeader = "";
    page.on("request", (r) => {
      if (r.url().endsWith("/api/operations/events"))
        replayHeader = r.headers()["last-event-id"] || "";
    });
    const failedStream = page.waitForEvent("requestfailed", {
      predicate: (r) => r.url().endsWith("/api/operations/events"),
    });
    await page.context().setOffline(true);
    await failedStream;
    await page.context().setOffline(false);
    await expect.poll(() => replayHeader).toBe(cursor);
  });
  await test.step("authorized void in browser restores stock once", async () => {
    console.log("authorized void in browser restores stock once");
    await page.goto(`/sales/${ticketId}`);
    await page
      .getByRole("button", { name: "Anular venta confirmada", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox")
      .fill("Verificacion ficticia de anulacion");
    await dialog
      .getByRole("button", { name: "Confirmar anulacion", exact: true })
      .click();
    await expect
      .poll(
        async () =>
          (
            await db.query('SELECT status FROM "SaleTicket" WHERE id=$1', [
              ticketId,
            ])
          ).rows[0].status
      )
      .toBe("VOIDED");
    const movement = await db.query(
      'SELECT "movementType" AS type, COUNT(*)::int AS count FROM "InventoryMovement" WHERE "referenceId"=$1 GROUP BY "movementType" ORDER BY "movementType"',
      [ticketId]
    );
    expect(movement.rows).toEqual([
      { type: "SALE_OUT", count: 1 },
      { type: "VOID_REVERSAL", count: 1 },
    ]);
    expect(
      (
        await db.query(
          'SELECT "currentStock"::text AS quantity FROM "ProductStock" WHERE "productId"=$1',
          [product]
        )
      ).rows[0].quantity
    ).toBe("20.00");
    const report = await (
      await request.get("/backend/api/reports/sales-by-channel")
    ).json();
    expect(report).toEqual([]);
  });
  await test.step("insufficient stock rejects without partial effects", async () => {
    console.log("insufficient stock rejects without partial effects");
    const ticket = await (
      await post(request, "sales/tickets", {
        salesChannelId: channel,
        paymentMethod: "CASH",
      })
    ).json();
    const withItem = await (
      await post(request, `sales/tickets/${ticket.id}/items`, {
        productId: product,
        quantity: 21,
        expectedVersion: ticket.version,
      })
    ).json();
    const rejected = await post(
      request,
      `sales/tickets/${ticket.id}/confirm`,
      { paymentMethod: "CASH", expectedVersion: withItem.version },
      randomUUID()
    );
    expect(rejected.status()).toBe(409);
    expect(
      (
        await db.query(
          'SELECT COUNT(*)::int AS count FROM "InventoryMovement" WHERE "referenceId"=$1',
          [ticket.id]
        )
      ).rows[0].count
    ).toBe(0);
    const cancelled = await post(request, `sales/tickets/${ticket.id}/cancel`, {
      reason: "Fin fixture",
      expectedVersion: withItem.version,
    });
    expect(cancelled.ok()).toBe(true);
  });
  await test.step("real SSE related payload and replay-limit resync refreshes browser state", async () => {
    console.log(
      "real SSE related payload and replay-limit resync refreshes browser state"
    );
    // Seed only operational replay history, never commercial responses or stock.
    await db.query(
      'INSERT INTO "OperationEvent" (type,"entityType","entityId",version) SELECT $1,$2,$3,9007199254740993 FROM generate_series(1,1001)',
      ["table-order.changed", "TableOrder", orderId]
    );
    let reads = 0;
    page.on("request", (r) => {
      if (r.method() === "GET" && r.url().includes("/api/tables")) reads++;
    });
    await page.goto("/floor");

    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.dataset.integrationEvent)
      )
      .toBe("resync.required");
    await expect.poll(() => reads).toBeGreaterThanOrEqual(2);
    await page.screenshot({
      path: info.outputPath("floor-resync.png"),
      fullPage: true,
    });
    // A fresh connection reproduces the actual wire signal through the proxy.
    const wire = await page.evaluate(async () => {
      const controller = new AbortController();
      const response = await fetch("/backend/api/operations/events", {
        signal: controller.signal,
      });
      const reader = response.body!.getReader();
      const chunk = await reader.read();
      controller.abort();
      return new TextDecoder().decode(chunk.value);
    });
    expect(wire).toContain("event: resync.required");
  });
  await test.step("CSRF origin enforcement, denied roles, expired session and invalid login", async () => {
    console.log(
      "CSRF origin enforcement, denied roles, expired session and invalid login"
    );
    const denied = await request.post(`/backend/api/sales/tickets`, {
      data: { salesChannelId: channel },
      headers: { Origin: "https://untrusted.example" },
    });
    expect(denied.status()).toBe(403);
    const missing = await request.post(`/backend/api/sales/tickets`, {
      data: { salesChannelId: channel },
    });
    expect(missing.status()).toBe(403);
    for (const role of ["cashier", "auditor"]) {
      const context = await browser.newContext();
      try {
        const loginResponse = await context.request.post(
          `${origin}/backend/api/auth/login`,
          {
            data: {
              email: `${role}@example.com`,
              password: process.env.INTEGRATION_PASSWORD,
            },
          }
        );
        expect(loginResponse.ok()).toBe(true);
        const restricted =
          role === "cashier" ? "reports/stock" : "sales/tickets";
        const response =
          role === "cashier"
            ? await context.request.get(`${origin}/backend/api/${restricted}`)
            : await context.request.post(
                `${origin}/backend/api/${restricted}`,
                {
                  data: { salesChannelId: channel },
                  headers: { Origin: origin },
                }
              );
        expect(response.status()).toBe(403);
        const rolePage = await context.newPage();
        await rolePage.goto(
          `${origin}/${role === "cashier" ? "reports/stock" : "users"}`
        );
        await expect(
          rolePage.getByText(/no tienes permisos/i).first()
        ).toBeVisible();
      } finally {
        await context.close();
      }
    }
    const expiredContext = await browser.newContext();
    try {
      const user = (
        await db.query('SELECT id FROM "User" WHERE email=$1', [
          "admin@example.com",
        ])
      ).rows[0].id;
      const jwt = requireBackend("jsonwebtoken") as {
        sign(payload: object, secret: string, options: object): string;
      };
      await expiredContext.addCookies([
        {
          name: "restaurant_session",
          value: jwt.sign({ sub: user }, process.env.JWT_SECRET!, {
            expiresIn: -1,
          }),
          url: origin,
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
        },
      ]);
      const expired = await expiredContext.newPage();
      await expired.goto(`${origin}/floor`);
      await expect(expired).toHaveURL(/login/);
    } finally {
      await expiredContext.close();
    }
    const invalid = await request.post("/backend/api/auth/login", {
      data: { email: "invalid@example.com", password: "invalid-password" },
      headers: { Origin: origin },
    });
    expect(invalid.status()).toBe(401);
  });
  await test.step("logout clears cookie and revokes captured session JWT", async () => {
    console.log("logout clears cookie and revokes captured session JWT");
    const cookie = (await page.context().cookies()).find(
      (c) => c.name === "restaurant_session"
    )!;
    const logout = await post(request, "auth/logout", undefined);
    expect(logout.status()).toBe(204);
    expect(
      (await page.context().cookies()).some(
        (c) => c.name === "restaurant_session"
      )
    ).toBe(false);
    const oldBearer = await request.get("/backend/api/auth/me", {
      headers: { Authorization: `Bearer ${cookie.value}` },
    });
    expect(oldBearer.status()).toBe(401);
    await page.goto("/floor");
    await expect(page).toHaveURL(/login/);
  });
});
