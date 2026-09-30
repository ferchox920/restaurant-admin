import { expect, it } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";
import { sanitizeEvidence } from "./sanitize-evidence.mjs";

it("sanitizes credentials in traces, response bodies and embedded HTML reports without altering image bytes", () => {
  const prefix = join(tmpdir(), "restaurant-sanitizer-");
  const directory = mkdtempSync(prefix);
  try {
    const image = new Uint8Array([137, 80, 78, 71, 0, 255]);
    const credential = "eyJmaXh0dXJlIjoxfQ.eyJmaXh0dXJlIjoyfQ.c2lnbmF0dXJl";
    const trace = JSON.stringify({
      storageState: { cookies: [{ value: credential }] },
      cookies: [{ name: "restaurant_session", value: credential }],
      headers: [{ name: "Cookie", value: credential }],
      postData: {
        text: JSON.stringify({ password: "Demo-" + "a".repeat(32) }),
      },
    });
    const archive = zipSync({
      "trace.network": strToU8(trace),
      "fixture.png": image,
    });
    writeFileSync(join(directory, "trace.zip"), archive);
    writeFileSync(
      join(directory, "index.html"),
      `window.playwrightReportBase64="data:application/zip;base64,${Buffer.from(archive).toString("base64")}";`
    );
    writeFileSync(
      join(directory, "report.json"),
      JSON.stringify(
        { password: "fixture-password", cookies: [{ value: credential }] },
        null,
        2
      )
    );
    sanitizeEvidence(directory, ["fixture-password"]);
    const cleaned = unzipSync(readFileSync(join(directory, "trace.zip")));
    const network = strFromU8(cleaned["trace.network"]);
    expect(network).not.toContain(credential);
    expect(network).not.toContain("Demo-" + "a".repeat(32));
    expect(JSON.parse(network).headers[0].value).toBe("[REDACTED]");
    expect(JSON.parse(network).cookies).toEqual([]);
    expect(JSON.parse(network).storageState).toBe("[REDACTED]");
    expect(cleaned["fixture.png"]).toEqual(image);
    const html = readFileSync(join(directory, "index.html"), "utf8");
    const encoded = html.match(/base64,([^"']+)/)![1];
    const embedded = strFromU8(
      unzipSync(Buffer.from(encoded, "base64"))["trace.network"]
    );
    expect(embedded).not.toContain(credential);
    expect(readFileSync(join(directory, "report.json"), "utf8")).not.toContain(
      "fixture-password"
    );
  } finally {
    if (!directory.startsWith(prefix))
      throw new Error("Unexpected temporary directory");
    rmSync(directory, { recursive: true });
  }
});
