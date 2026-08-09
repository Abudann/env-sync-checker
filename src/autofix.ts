import { readFileSync, appendFileSync } from "node:fs";

/**
 * Appends missing keys to the end of the .env.example file.
 * Ensures proper newline formatting before appending.
 */
export function applyAutoFix(examplePath: string, missingKeys: Set<string>): void {
  if (missingKeys.size === 0) return;

  // Read current content to check for trailing newline
  let content = "";
  try {
    content = readFileSync(examplePath, "utf-8");
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      // If the example file doesn't exist at all, we'll just start empty.
      // (Though in CLI flow, this usually throws earlier in parser)
    } else {
      throw err;
    }
  }

  let appendData = "";
  
  // If file is not empty and doesn't end with a newline, add one first
  if (content.length > 0 && !content.endsWith("\n")) {
    appendData += "\n";
  }

  for (const key of missingKeys) {
    appendData += `${key}=\n`;
  }

  appendFileSync(examplePath, appendData, "utf-8");
}
