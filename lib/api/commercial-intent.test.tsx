import { beforeEach, describe, expect, it, vi } from "vitest";
import { commercialIntent } from "./commercial-intent";

describe("commercial intention", () => {
  beforeEach(() => sessionStorage.clear());
  it("recovers the pre-send payload/key when reload interrupts a still-pending response", async () => {
    const operation = "/api/table-orders/pending/close";
    const payload = {
      paymentMethod: "CASH",
      expectedVersion: "9007199254740993",
    };
    let finish!: (value: string) => void;
    let originalKey = "";
    const request = commercialIntent(operation, payload, (key) => {
      originalKey = key;
      return new Promise<string>((resolve) => {
        finish = resolve;
      });
    });
    await Promise.resolve();
    vi.resetModules();
    const reloaded = await import("./commercial-intent");
    try {
      expect(reloaded.readUncertainIntents(operation)).toEqual([
        { operation, payload, key: originalKey },
      ]);
    } finally {
      finish("confirmed");
      await request;
    }
  });
  it("coalesces double submission before the first response", async () => {
    let finish!: (value: string) => void;
    const send = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        })
    );
    const a = commercialIntent("confirm/a", { expectedVersion: "2" }, send);
    const b = commercialIntent("confirm/a", { expectedVersion: "2" }, send);
    await Promise.resolve();
    expect(send).toHaveBeenCalledTimes(1);
    finish("confirmed");
    expect(await a).toBe("confirmed");
    expect(await b).toBe("confirmed");
  });
  it("retains a key on lost response and recovers it after module reload", async () => {
    const keys: string[] = [];
    await expect(
      commercialIntent(
        "close/a",
        { expectedVersion: "9007199254740993" },
        async (key) => {
          keys.push(key);
          throw new TypeError("lost");
        }
      )
    ).rejects.toThrow("lost");
    vi.resetModules();
    const reloaded = await import("./commercial-intent");
    await reloaded.commercialIntent(
      "close/a",
      { expectedVersion: "9007199254740993" },
      async (key) => {
        keys.push(key);
        return "closed";
      }
    );
    expect(keys[0]).toBe(keys[1]);
    expect(sessionStorage.length).toBe(0);
  });
  it("never shares a key with changed payload and creates a new operation after success", async () => {
    const keys: string[] = [];
    await expect(
      commercialIntent("void/a", { reason: "first" }, async (key) => {
        keys.push(key);
        throw new TypeError("lost");
      })
    ).rejects.toThrow();
    await commercialIntent("void/a", { reason: "changed" }, async (key) => {
      keys.push(key);
      return true;
    });
    await commercialIntent("void/a", { reason: "changed" }, async (key) => {
      keys.push(key);
      return true;
    });
    expect(new Set(keys).size).toBe(3);
  });
  it("persists before transport and does not retry automatically", async () => {
    const send = vi.fn(async (key: string) => {
      expect(Object.values(sessionStorage)).toContain(key);
      throw new TypeError("uncertain");
    });
    await expect(commercialIntent("confirm/b", {}, send)).rejects.toThrow();
    expect(send).toHaveBeenCalledTimes(1);
  });
});
