import { afterEach, expect, it, vi } from "vitest";
import { connectOperationalStream } from "./operational-stream";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it.each([401, 403])(
  "stops reconnecting after HTTP %s even when connectivity returns",
  async (status) => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status }));
    vi.stubGlobal("fetch", fetchMock);
    const stop = connectOperationalStream("/events", {
      onConnected: vi.fn(),
      onEvent: vi.fn(),
    });
    try {
      await vi.advanceTimersByTimeAsync(60_000);
      window.dispatchEvent(new Event("online"));
      await vi.advanceTimersByTimeAsync(60_000);
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      stop();
    }
  }
);
it("stops on session.invalid and signals login recovery once", async () => {
  vi.useFakeTimers();
  const expired = vi.fn();
  window.addEventListener("restaurant:session-expired", expired);
  const fetchMock = vi.fn().mockImplementation(() =>
    Promise.resolve(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(
                'event: session.invalid\ndata: {"reason":"session_or_permissions_changed"}\n\n'
              )
            );
            controller.close();
          },
        }),
        { headers: { "Content-Type": "text/event-stream" } }
      )
    )
  );
  vi.stubGlobal("fetch", fetchMock);
  const stop = connectOperationalStream("/events", {
    onConnected: vi.fn(),
    onEvent: vi.fn(),
  });
  try {
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(expired).toHaveBeenCalledOnce();
  } finally {
    stop();
    window.removeEventListener("restaurant:session-expired", expired);
  }
});
it("decodes fragmented real wire format and reconnects with a string cursor", async () => {
  vi.useFakeTimers();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(value) {
      controller = value;
    },
  });
  const nextBody = new ReadableStream<Uint8Array>({
    start() {
      /* remains open until cleanup */
    },
  });
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(body, { headers: { "Content-Type": "text/event-stream" } })
    )
    .mockResolvedValueOnce(
      new Response(nextBody, {
        headers: { "Content-Type": "text/event-stream" },
      })
    );
  vi.stubGlobal("fetch", fetchMock);
  const event = vi.fn();
  const stop = connectOperationalStream("/events", {
    onConnected: vi.fn(),
    onEvent: event,
  });
  controller.enqueue(
    new TextEncoder().encode("id: 9007199254740993\r\nevent: table-order.")
  );
  controller.enqueue(
    new TextEncoder().encode(
      'changed\r\ndata: {"version":"9007199254740994","related":{"saleTicketId":"a"}}\r\n\r\n'
    )
  );
  await vi.advanceTimersByTimeAsync(0);
  expect(event).toHaveBeenCalledWith(
    "table-order.changed",
    '{"version":"9007199254740994","related":{"saleTicketId":"a"}}'
  );
  controller.error(new TypeError("offline"));
  await vi.advanceTimersByTimeAsync(1000);
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    "/events",
    expect.objectContaining({
      credentials: "include",
      headers: { "Last-Event-ID": "9007199254740993" },
    })
  );
  stop();
});
it("delivers resync.required and ignores heartbeat comments", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        new TextEncoder().encode(
          ': heartbeat\n\nevent: resync.required\ndata: {"reason":"replay_limit"}\n\n'
        )
      );
      controller.close();
    },
  });
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(body, { headers: { "Content-Type": "text/event-stream" } })
      )
  );
  const event = vi.fn();
  const stop = connectOperationalStream("/events", {
    onConnected: vi.fn(),
    onEvent: event,
  });
  await vi.waitFor(() => expect(event).toHaveBeenCalledOnce());
  expect(event).toHaveBeenCalledWith(
    "resync.required",
    '{"reason":"replay_limit"}'
  );
  stop();
});
