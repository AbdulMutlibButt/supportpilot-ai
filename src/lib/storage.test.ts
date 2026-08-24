import { mkdtemp, readdir, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { LocalPrivateStorage } from "./storage";

let root = "";
afterEach(async () => { if (root) await rm(root, { recursive: true, force: true }); root = ""; });
describe("private local storage", () => {
  it("generates safe internal names and blocks traversal", async () => {
    root = await mkdtemp(path.join(tmpdir(), "supportpilot-storage-")); const storage = new LocalPrivateStorage(root);
    const key = await storage.put("../../workspace", "../TXT", Buffer.from("private"));
    expect(key).toMatch(/^workspace\/[a-f0-9]{40}\.txt$/); expect(await storage.read(key)).toEqual(Buffer.from("private"));
    await expect(storage.read("../secret.txt")).rejects.toThrow(/Invalid storage key/);
    await storage.delete(key); expect(await readdir(path.join(root, "workspace"))).toHaveLength(0);
  });
});
