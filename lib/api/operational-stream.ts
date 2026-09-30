type Callbacks = {
  onConnected: () => void;
  onEvent: (name: string, data: string) => void;
};

/** Read the real SSE wire with an explicit, precision-preserving replay cursor. */
export function connectOperationalStream(url: string, callbacks: Callbacks) {
  let disposed = false;
  let running = false;
  let reconnectRequested = false;
  let cursor = "";
  let delay = 1000;
  let timer: ReturnType<typeof setTimeout>;
  let controller: AbortController;
  async function connect() {
    if (disposed || running || !navigator.onLine) return;
    running = true;
    controller = new AbortController();
    try {
      const response = await fetch(url, {
        credentials: "include",
        signal: controller.signal,
        headers: cursor ? { "Last-Event-ID": cursor } : {},
      });
      if (disposed) return;
      if (response.status === 401) {
        window.dispatchEvent(new Event("restaurant:session-expired"));
        return;
      }
      if (
        !response.ok ||
        !response.headers.get("Content-Type")?.includes("text/event-stream") ||
        !response.body
      )
        throw new Error("SSE unavailable");
      delay = 1000;
      callbacks.onConnected();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (!disposed) {
          const chunk = await reader.read();
          if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true });
          buffer = buffer.replace(/\r\n/g, "\n");
          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) >= 0) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            let name = "message";
            let id: string | undefined;
            const data: string[] = [];
            for (const line of frame.split("\n")) {
              if (line.startsWith("event:")) name = line.slice(6).trimStart();
              if (line.startsWith("id:")) id = line.slice(3).trimStart();
              if (line.startsWith("data:"))
                data.push(line.slice(5).trimStart());
            }
            if (id !== undefined && /^\d+$/.test(id)) cursor = id;
            if (data.length) {
              callbacks.onEvent(name, data.join("\n"));
              window.dispatchEvent(
                new CustomEvent("restaurant:operational-event", {
                  detail: { name, cursor },
                })
              );
            }
          }
          if (buffer.length > 1024 * 1024)
            throw new Error("Oversized SSE frame");
        }
      } finally {
        await reader.cancel().catch(() => undefined);
      }
    } catch {
      /* Refetch on reconnection covers any gap; no commercial mutation is retried. */
    } finally {
      running = false;
      if (!disposed) {
        timer = setTimeout(connect, reconnectRequested ? 0 : delay);
        reconnectRequested = false;
        delay = Math.min(delay * 2, 30_000);
      }
    }
  }
  void connect();
  const online = () => {
    clearTimeout(timer);
    if (running) {
      reconnectRequested = true;
      controller.abort();
    } else void connect();
  };
  const offline = () => controller?.abort();
  window.addEventListener("offline", offline);
  window.addEventListener("online", online);
  return () => {
    disposed = true;
    clearTimeout(timer);
    controller?.abort();
    window.removeEventListener("online", online);
    window.removeEventListener("offline", offline);
  };
}
