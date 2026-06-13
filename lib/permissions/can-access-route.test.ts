import { describe, expect, it } from "vitest";
import { canAccessRoute } from "@/lib/permissions/can-access-route";

describe("canAccessRoute", () => {
  it("allows public and utility routes", () => {
    expect(canAccessRoute("CASHIER", "/")).toBe(true);
    expect(canAccessRoute("CASHIER", "/login")).toBe(true);
    expect(canAccessRoute("CASHIER", "/forbidden")).toBe(true);
  });

  it("applies explicit sales draft override", () => {
    expect(canAccessRoute("CASHIER", "/sales/new")).toBe(true);
    expect(canAccessRoute("AUDITOR", "/sales/new")).toBe(false);
  });

  it("keeps private route permissions aligned with role navigation", () => {
    expect(canAccessRoute("AUDITOR", "/reports")).toBe(true);
    expect(canAccessRoute("AUDITOR", "/users")).toBe(false);
    expect(canAccessRoute("MANAGER", "/products/123")).toBe(true);
    expect(canAccessRoute("CASHIER", "/audit-logs")).toBe(false);
  });

  it("denies unknown routes", () => {
    expect(canAccessRoute("ADMIN", "/does-not-exist")).toBe(false);
  });
});
