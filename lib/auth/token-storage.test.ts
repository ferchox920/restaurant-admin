import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth/token-storage";

describe("token storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not access localStorage on the server", () => {
    expect(getAccessToken()).toBeNull();
    expect(() => setAccessToken("token")).not.toThrow();
    expect(() => clearAccessToken()).not.toThrow();
  });

  it("stores and clears the token when window is available", () => {
    const store = new Map<string, string>();
    const dispatchEvent = vi.fn();

    vi.stubGlobal("window", {
      localStorage: {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          store.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          store.delete(key);
        }),
      },
      dispatchEvent,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    setAccessToken("token");
    expect(getAccessToken()).toBe("token");

    clearAccessToken();
    expect(getAccessToken()).toBeNull();
    expect(dispatchEvent).toHaveBeenCalledTimes(2);
  });
});
