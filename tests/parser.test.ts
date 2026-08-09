import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { parseEnvContent, parseEnvFile, FileNotFoundError } from "../src/parser.js";

const FIXTURES_DIR = join(import.meta.dirname, "__fixtures__");

function createFixture(name: string, content: string): string {
  mkdirSync(FIXTURES_DIR, { recursive: true });
  const filePath = join(FIXTURES_DIR, name);
  writeFileSync(filePath, content, "utf-8");
  return filePath;
}

function cleanFixtures(): void {
  rmSync(FIXTURES_DIR, { recursive: true, force: true });
}

describe("parseEnvContent", () => {
  it("should parse standard key-value pairs", () => {
    const content = `
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
    `;
    const keys = parseEnvContent(content);

    expect(keys).toEqual(new Set(["DB_HOST", "DB_PORT", "DB_NAME"]));
  });

  it("should ignore comment lines", () => {
    const content = `
# this is a comment
API_KEY=secret
# another comment
DEBUG=true
    `;
    const keys = parseEnvContent(content);

    expect(keys).toEqual(new Set(["API_KEY", "DEBUG"]));
  });

  it("should ignore empty lines", () => {
    const content = `
API_KEY=abc

DB_HOST=localhost


REDIS_URL=redis://localhost
    `;
    const keys = parseEnvContent(content);

    expect(keys).toEqual(new Set(["API_KEY", "DB_HOST", "REDIS_URL"]));
  });

  it("should handle single and double quoted values", () => {
    const content = `
SINGLE_QUOTED='hello world'
DOUBLE_QUOTED="hello world"
NO_QUOTE=hello
    `;
    const keys = parseEnvContent(content);

    expect(keys).toEqual(new Set(["SINGLE_QUOTED", "DOUBLE_QUOTED", "NO_QUOTE"]));
  });

  it("should handle keys with empty values", () => {
    const content = `
EMPTY_KEY=
ANOTHER_EMPTY=
HAS_VALUE=something
    `;
    const keys = parseEnvContent(content);

    expect(keys).toEqual(new Set(["EMPTY_KEY", "ANOTHER_EMPTY", "HAS_VALUE"]));
  });

  it("should handle values containing equals signs", () => {
    const content = `
BASE64_SECRET=dGhpcyBpcyBhIHNlY3JldA==
NORMAL_KEY=value
    `;
    const keys = parseEnvContent(content);

    expect(keys).toEqual(new Set(["BASE64_SECRET", "NORMAL_KEY"]));
  });

  it("should return empty set for empty content", () => {
    const keys = parseEnvContent("");
    expect(keys.size).toBe(0);
  });

  it("should return empty set for comment-only content", () => {
    const content = `
# only comments
# no keys here
# at all
    `;
    const keys = parseEnvContent(content);
    expect(keys.size).toBe(0);
  });

  it("should handle multiline quoted values", () => {
    const content = `
SIMPLE=value
MULTILINE="line1
line2
line3"
AFTER_MULTI=works
    `;
    const keys = parseEnvContent(content);

    expect(keys).toEqual(new Set(["SIMPLE", "MULTILINE", "AFTER_MULTI"]));
  });

  it("should handle inline comments after values", () => {
    const content = `
API_URL=https://api.example.com # production URL
DEBUG=false # don't enable in production
    `;
    const keys = parseEnvContent(content);

    expect(keys.has("API_URL")).toBe(true);
    expect(keys.has("DEBUG")).toBe(true);
  });

  it("should never store or expose values — only key names", () => {
    const content = `
SECRET_KEY=super_secret_value_123
PASSWORD=p@ssw0rd!
    `;
    const keys = parseEnvContent(content);

    const keysArray = [...keys];
    for (const key of keysArray) {
      expect(key).not.toContain("super_secret_value_123");
      expect(key).not.toContain("p@ssw0rd!");
    }
  });

  it("should handle export prefix", () => {
    const content = `
export NODE_ENV=production
export PORT=3000
    `;
    const keys = parseEnvContent(content);

    expect(keys.has("NODE_ENV")).toBe(true);
    expect(keys.has("PORT")).toBe(true);
  });

  it("should handle whitespace around keys and values", () => {
    const content = `
  SPACED_KEY  =  value_with_spaces  
NORMAL=value
    `;
    const keys = parseEnvContent(content);

    expect(keys.has("NORMAL")).toBe(true);
  });
});

describe("parseEnvFile", () => {
  it("should read and parse an .env file from disk", () => {
    const filePath = createFixture(".env.test", "APP_NAME=myapp\nPORT=3000\n");
    const keys = parseEnvFile(filePath);

    expect(keys).toEqual(new Set(["APP_NAME", "PORT"]));
    cleanFixtures();
  });

  it("should throw FileNotFoundError for missing files", () => {
    expect(() => parseEnvFile("/nonexistent/path/.env")).toThrow(
      FileNotFoundError
    );
  });

  it("should return empty set for empty files on disk", () => {
    const filePath = createFixture(".env.empty", "");
    const keys = parseEnvFile(filePath);

    expect(keys.size).toBe(0);
    cleanFixtures();
  });

  it("should include the file path in the error message", () => {
    const fakePath = "/tmp/nonexistent/.env";
    try {
      parseEnvFile(fakePath);
    } catch (err) {
      expect(err).toBeInstanceOf(FileNotFoundError);
      expect((err as FileNotFoundError).message).toContain(fakePath);
    }
  });
});
