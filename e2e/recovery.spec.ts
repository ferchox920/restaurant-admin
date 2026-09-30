import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";

const origin = process.env.INTEGRATION_BASE_URL!;
const api = process.env.INTEGRATION_API_URL!;
const backend = createRequire(
  resolve(process.env.INTEGRATION_BACKEND_PATH!, "package.json")
);
type Db = {
  connect(): Promise<void>;
  end(): Promise<void>;
  query(
    sql: string,
    values?: unknown[]
  ): Promise<{ rows: Record<string, unknown>[] }>;
};
const Pg = backend("pg") as {
  Client: new (options: { connectionString: string }) => Db;
};
const jwt = backend("jsonwebtoken") as {
  sign(payload: object, secret: string, options: { expiresIn: number }): string;
};
const db = new Pg.Client({ connectionString: process.env.DATABASE_URL! });
test.beforeAll(() => db.connect());
test.afterAll(() => db.end());

// Session fixtures use the existing signed JWT/session store, never a mocked commercial API.
async function authenticate(context: BrowserContext) {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const jti = randomUUID();
  const email = `${userId}@example.com`;
  await db.query(
    'INSERT INTO "User" (id,email,"passwordHash","firstName","lastName",role,"updatedAt") VALUES ($1,$2,$3,$4,$5,$6::"Role",NOW())',
    [userId, email, "unused-fixture", "Recovery", "Fixture", "ADMIN"]
  );
  const token = jwt.sign(
    { sub: userId, email, role: "ADMIN", jti },
    process.env.JWT_SECRET!,
    { expiresIn: 600 }
  );
  await db.query(
    'INSERT INTO "AuthSession" (id,"jtiHash","userId","expiresAt") VALUES ($1,$2,$3,NOW()+interval \'10 minutes\')',
    [sessionId, createHash("sha256").update(jti).digest("hex"), userId]
  );
  await context.addCookies([
    {
      url: origin,
      name: "restaurant_session",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);
  return { userId, sessionId, cookie: `restaurant_session=${token}` };
}

async function post(page: Page, path: string, data: unknown, key?: string) {
  return page.request.post(`${origin}/backend/api/${path}`, {
    data,
    headers: { Origin: origin, ...(key ? { "Idempotency-Key": key } : {}) },
  });
}
async function orderFixture(page: Page, tableCode: string) {
  const table = (
    await db.query('SELECT id FROM "RestaurantTable" WHERE code=$1', [
      tableCode,
    ])
  ).rows[0].id;
  const channel = (
    await db.query('SELECT id FROM "SalesChannel" WHERE code=$1', [
      "DINING_ROOM",
    ])
  ).rows[0].id;
  const product = (
    await db.query('SELECT id FROM "Product" WHERE sku=$1', ["MVP-COKE-500"])
  ).rows[0].id;
  const opened = await post(page, `tables/${table}/orders/open`, {
    salesChannelId: channel,
  });
  expect(opened.ok()).toBe(true);
  const empty = await opened.json();
  const added = await post(page, `table-orders/${empty.id}/items`, {
    productId: product,
    quantity: 1,
    expectedVersion: empty.version,
  });
  expect(added.ok()).toBe(true);
  return (await added.json()) as {
    id: string;
    version: string;
    saleTicketId: string;
    saleTicket: { items: Array<{ id: string; quantity: string }> };
  };
}
async function panel(page: Page) {
  const region = page.getByRole("region", {
    name: "Consumos de la mesa",
    exact: true,
  });
  const sum = region.getByRole("button", {
    name: "Sumar Coca-Cola 500ml",
    exact: true,
  });
  await expect(region).toBeVisible();
  if (!(await sum.isVisible()))
    await region.getByRole("button", { name: /Consumos de la mesa/ }).click();
  await expect(sum).toBeVisible();
  return { region, sum };
}

test("UI conflict: two contexts preserve the confirmed edit and refresh stale state without repeating the mutation", async ({
  page,
  browser,
}, info) => {
  await authenticate(page.context());
  const order = await orderFixture(page, "M03");
  const second = await browser.newContext({
    baseURL: origin,
    viewport: info.project.use.viewport,
  });
  try {
    await authenticate(second);
    const stale = await second.newPage();
    // Only transport is controlled: prevent live refresh of the second context until its stale write.
    await stale.route("**/api/operations/events", (route) => route.abort());
    await Promise.all([
      page.goto(`/table-orders/${order.id}`),
      stale.goto(`/table-orders/${order.id}`),
    ]);
    const firstPanel = await panel(page);
    const stalePanel = await panel(stale);
    await expect(
      stalePanel.sum.locator("..").getByText("1", { exact: true })
    ).toBeVisible();
    const saved = page.waitForResponse(
      (r) =>
        r.request().method() === "PATCH" &&
        r.url().includes(`/table-orders/${order.id}/items/`)
    );
    await firstPanel.sum.click();
    expect((await saved).status()).toBe(200);
    await expect(
      firstPanel.sum.locator("..").getByText("2", { exact: true })
    ).toBeVisible();
    const writes: string[] = [];
    stale.on("request", (r) => {
      if (
        r.method() === "PATCH" &&
        r.url().includes(`/table-orders/${order.id}/items/`)
      )
        writes.push(r.postData()!);
    });
    const conflict = stale.waitForResponse(
      (r) =>
        r.request().method() === "PATCH" &&
        r.url().includes(`/table-orders/${order.id}/items/`)
    );
    await stalePanel.sum.click();
    expect((await conflict).status()).toBe(409);
    await expect(
      stale
        .getByRole("alert")
        .filter({ hasText: "Otra sesion modifico este recurso" })
    ).toBeVisible();
    await expect(
      stalePanel.sum.locator("..").getByText("2", { exact: true })
    ).toBeVisible();
    await stale.waitForTimeout(1250);
    expect(writes).toHaveLength(1);
    expect(JSON.parse(writes[0]).expectedVersion).toBe(order.version);
    expect(
      (
        await db.query(
          'SELECT quantity::text FROM "SaleTicketItem" WHERE id=$1',
          [order.saleTicket.items[0].id]
        )
      ).rows[0].quantity
    ).toBe("2.00");
    const current = await (
      await page.request.get(`/backend/api/table-orders/${order.id}`)
    ).json();
    expect(
      (
        await post(page, `table-orders/${order.id}/cancel`, {
          reason: "Own conflict fixture cleanup",
          expectedVersion: current.version,
        })
      ).ok()
    ).toBe(true);
  } finally {
    await second.close();
  }
});

test("UI lost response: explicit recovery after reload reuses original payload and key with one PostgreSQL effect", async ({
  page,
}) => {
  await authenticate(page.context());
  const order = await orderFixture(page, "M03");
  await page.goto(`/table-orders/${order.id}`);
  await panel(page);
  const requests: Array<{ key: string; payload: unknown }> = [];
  page.on("request", (r) => {
    if (
      r.method() === "POST" &&
      r.url().endsWith(`/table-orders/${order.id}/close`)
    )
      requests.push({
        key: r.headers()["idempotency-key"],
        payload: r.postDataJSON(),
      });
  });
  let committed!: () => void;
  const commit = new Promise<void>((resolveCommit) => {
    committed = resolveCommit;
  });
  await page.route(`**/api/table-orders/${order.id}/close`, async (route) => {
    const response = await route.fetch();
    expect(response.ok()).toBe(true);
    await route.abort("failed");
    committed();
  });
  await page.getByRole("button", { name: "Cerrar orden", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cerrar orden", exact: true })
    .click();
  await commit;
  await expect(
    page.getByText("Resultado incierto", { exact: true })
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  await page.unroute(`**/api/table-orders/${order.id}/close`);
  await page.reload();
  await expect(
    page.getByText("Resultado incierto", { exact: true })
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  const recovered = page.waitForResponse(
    (r) =>
      r.request().method() === "POST" &&
      r.url().endsWith(`/table-orders/${order.id}/close`)
  );
  await page
    .getByRole("button", { name: "Recuperar resultado", exact: true })
    .click();
  expect((await recovered).status()).toBe(200);
  await expect(
    page.getByText(/Resultado confirmado por el backend/)
  ).toBeVisible();
  await expect(
    page.getByText("Venta confirmada por backend.", { exact: false })
  ).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
  expect(
    (
      await db.query('SELECT status FROM "SaleTicket" WHERE id=$1', [
        order.saleTicketId,
      ])
    ).rows[0].status
  ).toBe("CONFIRMED");
  expect(
    (
      await db.query(
        'SELECT COUNT(*)::int AS count FROM "InventoryMovement" WHERE "referenceId"=$1 AND "movementType"=\'SALE_OUT\'',
        [order.saleTicketId]
      )
    ).rows[0].count
  ).toBe(1);
  const ticket = await (
    await page.request.get(`/backend/api/sales/tickets/${order.saleTicketId}`)
  ).json();
  expect(
    (
      await post(
        page,
        `sales/tickets/${order.saleTicketId}/void`,
        {
          reason: "Own recovery fixture cleanup",
          expectedVersion: ticket.version,
        },
        randomUUID()
      )
    ).ok()
  ).toBe(true);
});

async function stream(cookie: string) {
  const response = await fetch(`${api}/api/operations/events`, {
    headers: { cookie },
    signal: AbortSignal.timeout(15_000),
  });
  expect(response.status).toBe(200);
  return {
    closed: (async () => {
      let frames = "";
      const reader = response.body!.getReader();
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) return frames;
        frames += new TextDecoder().decode(chunk.value);
      }
    })(),
  };
}
test("UI logout revokes its cookie session and terminates an already open SSE stream", async ({
  page,
}) => {
  const fixture = await authenticate(page.context());
  await page.goto("/floor");
  await expect(
    page.getByRole("heading", { name: "Salón", exact: true })
  ).toBeVisible();
  const { closed } = await stream(fixture.cookie);
  const traffic: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/backend/api/")) traffic.push(r.url());
  });
  await page.getByLabel("Abrir menu de usuario de Recovery Fixture").click();
  const revoked = page.waitForResponse(
    (r) => r.url().endsWith("/auth/logout") && r.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  expect((await revoked).status()).toBe(204);
  const started = performance.now();
  expect(await closed).toContain("event: session.invalid");
  expect(performance.now() - started).toBeLessThanOrEqual(3000);
  await expect(page).toHaveURL(`${origin}/login?next=%2Ffloor`);
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  expect(
    (
      await db.query('SELECT "revokedAt" FROM "AuthSession" WHERE id=$1', [
        fixture.sessionId,
      ])
    ).rows[0].revokedAt
  ).not.toBeNull();
  const count = traffic.length;
  await page.waitForTimeout(2250);
  expect(traffic).toHaveLength(count);
});
test("UI session expiry recovers login and leaves no reconnect or query loop", async ({
  page,
}) => {
  const fixture = await authenticate(page.context());
  let opened!: () => void;
  const connected = new Promise<void>((resolveConnected) => {
    opened = resolveConnected;
  });
  page.on("response", (r) => {
    if (r.url().endsWith("/api/operations/events") && r.status() === 200)
      opened();
  });
  await page.goto("/floor");
  await expect(
    page.getByRole("heading", { name: "Salón", exact: true })
  ).toBeVisible();
  await connected;
  const traffic: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/backend/api/")) traffic.push(r.url());
  });
  await db.query('UPDATE "AuthSession" SET "expiresAt"=NOW() WHERE id=$1', [
    fixture.sessionId,
  ]);
  await expect(page).toHaveURL(`${origin}/login?next=%2Ffloor`);
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  const count = traffic.length;
  await page.waitForTimeout(2250);
  expect(traffic).toHaveLength(count);
  expect(
    traffic.filter((url) => url.endsWith("/operations/events"))
  ).toHaveLength(0);
});
