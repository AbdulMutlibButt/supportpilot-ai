import { randomBytes } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

export interface PrivateStorage {
  put(workspaceId: string, extension: string, data: Buffer): Promise<string>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

export class LocalPrivateStorage implements PrivateStorage {
  constructor(private root = path.resolve(process.cwd(), ".data", "uploads")) {}
  private resolve(key: string) {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error("Invalid storage key");
    return full;
  }
  async put(workspaceId: string, extension: string, data: Buffer) {
    const safeWorkspace = workspaceId.replace(/[^a-zA-Z0-9_-]/g, "");
    const ext = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!safeWorkspace || !ext) throw new Error("Invalid storage destination");
    const key = `${safeWorkspace}/${randomBytes(20).toString("hex")}.${ext}`;
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data, { flag: "wx" });
    return key;
  }
  async read(key: string) { return readFile(this.resolve(key)); }
  async delete(key: string) { await rm(this.resolve(key), { force: true }); }
}

export const privateStorage = new LocalPrivateStorage();
