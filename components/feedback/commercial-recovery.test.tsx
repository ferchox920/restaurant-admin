import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CommercialRecovery } from "./commercial-recovery";
import {
  commercialIntent,
  readUncertainIntents,
} from "@/lib/api/commercial-intent";

const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/lib/api/api-client", () => ({ apiClient: { post: mocks.post } }));
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
});
it("recovers a persisted uncertainty using the original payload and key after remount", async () => {
  const operation = "/api/table-orders/fixture/close";
  const payload = {
    paymentMethod: "CASH",
    expectedVersion: "9007199254740993",
  };
  let originalKey = "";
  await expect(
    commercialIntent(operation, payload, async (key) => {
      originalKey = key;
      throw new TypeError("lost response");
    })
  ).rejects.toThrow();
  const client = new QueryClient();
  const renderRecovery = () =>
    render(
      <QueryClientProvider client={client}>
        <CommercialRecovery operation={operation} />
      </QueryClientProvider>
    );
  const first = renderRecovery();
  await screen.findByText("Resultado incierto");
  first.unmount();
  renderRecovery();
  mocks.post.mockResolvedValue({ status: "CLOSED" });
  fireEvent.click(
    await screen.findByRole("button", { name: "Recuperar resultado" })
  );
  await screen.findByText(/Resultado confirmado por el backend/);
  expect(mocks.post).toHaveBeenCalledExactlyOnceWith(operation, payload, {
    headers: { "Idempotency-Key": originalKey },
  });
  expect(sessionStorage.length).toBe(0);
});
it("does not offer a different resource's uncertain operation or tampered key", async () => {
  await expect(
    commercialIntent(
      "/api/sales/tickets/other/void",
      { reason: "fixture" },
      async () => {
        throw new TypeError("lost");
      }
    )
  ).rejects.toThrow();
  expect(readUncertainIntents("/api/table-orders/fixture/close")).toEqual([]);
  const slot = Object.keys(sessionStorage).find((key) =>
    key.startsWith("restaurant:commercial-intent:")
  )!;
  sessionStorage.setItem(slot, "different-key");
  expect(readUncertainIntents("/api/sales/tickets/other/void")).toEqual([]);
});
