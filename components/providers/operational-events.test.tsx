import { render, cleanup, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationalEvents } from "./operational-events";
import { operationalKeys } from "@/lib/api/operational-events";
const stream = vi.hoisted(() => ({ connect: vi.fn(), stop: vi.fn() }));
vi.mock("@/lib/env", () => ({
  apiUrl: "/backend",
  realtimeEnabled: true,
  sessionMode: "cookie",
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/floor" }));
vi.mock("@/lib/api/operational-stream", () => ({
  connectOperationalStream: stream.connect,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("refetches active queries on resync and closes transport on unmount", () => {
  stream.connect.mockReturnValue(stream.stop);
  const client = new QueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const view = render(
    <QueryClientProvider client={client}>
      <OperationalEvents enabled />
    </QueryClientProvider>
  );
  expect(stream.connect.mock.calls[0][0]).toBe(
    "/backend/api/operations/events"
  );
  act(() =>
    stream.connect.mock.calls[0][1].onEvent(
      "resync.required",
      '{"reason":"replay_limit"}'
    )
  );
  for (const queryKey of operationalKeys)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey,
      refetchType: "active",
    });
  view.unmount();
  expect(stream.stop).toHaveBeenCalledOnce();
});
it("does not connect before authentication", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <OperationalEvents enabled={false} />
    </QueryClientProvider>
  );
  expect(stream.connect).not.toHaveBeenCalled();
});
