import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { loadConfig } from "../src/config.js";

const FIXTURES_DIR = join(import.meta.dirname, "__fixtures_config__");

function createFixture(name: string, content: string): string {
  mkdirSync(FIXTURES_DIR, { recursive: true });
  const filePath = join(FIXTURES_DIR, name);
  writeFileSync(filePath, content, "utf-8");
  return filePath;
}

function cleanFixtures(): void {
  rmSync(FIXTURES_DIR, { recursive: true, force: true });
}

describe("loadConfig", () => {
  it("should parse valid JSON config and return ignored keys", () => {
    const filePath = createFixture(".envsyncrc.valid", '{"ignore": ["NODE_ENV", "PORT"]}');
    const ignored = loadConfig(filePath);

    expect(ignored).toEqual(["NODE_ENV", "PORT"]);
    cleanFixtures();
  });

  it("should return empty array if config file doesn't exist", () => {
    const ignored = loadConfig("/nonexistent/path/.envsyncrc");
    expect(ignored).toEqual([]);
  });

  it("should return empty array if 'ignore' key is missing in JSON", () => {
    const filePath = createFixture(".envsyncrc.empty", '{"otherField": true}');
    const ignored = loadConfig(filePath);

    expect(ignored).toEqual([]);
    cleanFixtures();
  });

  it("should throw error if JSON is malformed", () => {
    const filePath = createFixture(".envsyncrc.invalid", '{"ignore": ["NODE_ENV", ');
    
    expect(() => loadConfig(filePath)).toThrow();
    cleanFixtures();
  });
});
