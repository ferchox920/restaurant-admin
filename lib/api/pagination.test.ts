import { describe, expect, it, vi } from "vitest";
import { ALL_OPTIONS_PAGE_LIMIT, fetchAllPages } from "@/lib/api/pagination";

describe("fetchAllPages", () => {
  it("stops before requesting another page when the query is aborted", async () => {
    const controller = new AbortController();
    const fetchPage = vi.fn(async () => {
      controller.abort();
      return Array.from({ length: ALL_OPTIONS_PAGE_LIMIT }, (_, index) => index);
    });

    await expect(fetchAllPages(fetchPage, controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
