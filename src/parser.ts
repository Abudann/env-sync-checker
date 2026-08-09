import { readFileSync } from "node:fs";
import { parse } from "dotenv";

export class FileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = "FileNotFoundError";
  }
}

/** Read an .env file and return only key names. Values are never stored or exposed. */
export function parseEnvFile(filePath: string): Set<string> {
  let content: string;

  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      throw new FileNotFoundError(filePath);
    }
    throw err;
  }

  return parseEnvContent(content);
}

/** Parse raw .env content string into a set of key names. */
export function parseEnvContent(content: string): Set<string> {
  const parsed = parse(content);
  return new Set(Object.keys(parsed));
}
