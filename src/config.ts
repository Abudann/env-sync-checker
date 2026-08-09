import { readFileSync } from "node:fs";

export interface EnvSyncConfig {
  ignore?: string[];
}

/** 
 * Parse a config file (JSON format) and return the list of ignored keys.
 * If the file is not found, returns an empty array.
 */
export function loadConfig(configPath: string): string[] {
  try {
    const content = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(content) as EnvSyncConfig;
    return parsed.ignore || [];
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      return []; // Return empty if config doesn't exist
    }
    // Let JSON parsing errors bubble up to inform the user
    throw err;
  }
}
