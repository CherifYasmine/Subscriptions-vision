import { appDataDir, join } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";

const FILE_NAME = "subscriptions.json";

export async function getDbPath() {
  const dir = await appDataDir();
  try { await mkdir(dir, { recursive: true }); } catch {}
  return await join(dir, FILE_NAME);
}

export async function readDb(): Promise<string | null> {
  try {
    const path = await getDbPath();
    return await readTextFile(path);
  } catch {
    return null; // file not there yet
  }
}

export async function writeDb(content: string) {
  const path = await getDbPath();
  try {
    // backup existing file (best-effort)
    try {
      const existing = await readTextFile(path);
      const bak = path.replace(/\.json$/, ".bak.json");
      await writeTextFile(bak, existing, { create: true });
    } catch { /* ignore if no existing file */ }

    await writeTextFile(path, content, { create: true });
    return path;
  } catch (e) {
    console.error("[SubVision] writeDb error", e, "->", path);
    throw e;
  }
}
