import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { applyAutoFix } from "../src/autofix.js";

const FIXTURES_DIR = join(import.meta.dirname, "__fixtures_autofix__");

function createFixture(name: string, content: string): string {
  mkdirSync(FIXTURES_DIR, { recursive: true });
  const filePath = join(FIXTURES_DIR, name);
  writeFileSync(filePath, content, "utf-8");
  return filePath;
}

function cleanFixtures(): void {
  rmSync(FIXTURES_DIR, { recursive: true, force: true });
}

describe("applyAutoFix", () => {
  it("should append missing keys with empty values", () => {
    const filePath = createFixture(".env.example.1", "EXISTING_KEY=value\n");
    const missing = new Set(["MISSING_1", "MISSING_2"]);
    
    applyAutoFix(filePath, missing);
    
    const content = readFileSync(filePath, "utf-8");
    expect(content).toBe("EXISTING_KEY=value\nMISSING_1=\nMISSING_2=\n");
    cleanFixtures();
  });

  it("should add a newline before appending if the file doesn't end with one", () => {
    // Notice no trailing newline
    const filePath = createFixture(".env.example.2", "EXISTING_KEY=value");
    const missing = new Set(["NEW_KEY"]);
    
    applyAutoFix(filePath, missing);
    
    const content = readFileSync(filePath, "utf-8");
    expect(content).toBe("EXISTING_KEY=value\nNEW_KEY=\n");
    cleanFixtures();
  });

  it("should handle empty files properly", () => {
    const filePath = createFixture(".env.example.3", "");
    const missing = new Set(["ONLY_KEY"]);
    
    applyAutoFix(filePath, missing);
    
    const content = readFileSync(filePath, "utf-8");
    expect(content).toBe("ONLY_KEY=\n");
    cleanFixtures();
  });

  it("should do nothing if missingKeys set is empty", () => {
    const originalContent = "KEY=val\n";
    const filePath = createFixture(".env.example.4", originalContent);
    const missing = new Set<string>();
    
    applyAutoFix(filePath, missing);
    
    const content = readFileSync(filePath, "utf-8");
    expect(content).toBe(originalContent);
    cleanFixtures();
  });
});
