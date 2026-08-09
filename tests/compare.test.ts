import { describe, it, expect } from "vitest";
import { compareKeys, hasMismatch } from "../src/compare.js";

describe("compareKeys", () => {
  it("should detect keys present in .env but missing from .env.example", () => {
    const envKeys = new Set(["DB_HOST", "STRIPE_API_KEY", "REDIS_URL"]);
    const exampleKeys = new Set(["DB_HOST"]);

    const result = compareKeys(envKeys, exampleKeys);

    expect(result.missingInExample).toEqual(new Set(["STRIPE_API_KEY", "REDIS_URL"]));
  });

  it("should detect keys present in .env.example but missing from .env", () => {
    const envKeys = new Set(["DB_HOST"]);
    const exampleKeys = new Set(["DB_HOST", "DEBUG_MODE", "LOG_LEVEL"]);

    const result = compareKeys(envKeys, exampleKeys);

    expect(result.missingInEnv).toEqual(new Set(["DEBUG_MODE", "LOG_LEVEL"]));
  });

  it("should detect keys that are in sync across both files", () => {
    const envKeys = new Set(["DB_HOST", "DB_PORT", "API_KEY"]);
    const exampleKeys = new Set(["DB_HOST", "DB_PORT", "API_KEY"]);

    const result = compareKeys(envKeys, exampleKeys);

    expect(result.inSync).toEqual(new Set(["DB_HOST", "DB_PORT", "API_KEY"]));
    expect(result.missingInExample.size).toBe(0);
    expect(result.missingInEnv.size).toBe(0);
  });

  it("should handle mixed results — some missing, some in sync", () => {
    const envKeys = new Set(["DB_HOST", "STRIPE_KEY", "REDIS_URL"]);
    const exampleKeys = new Set(["DB_HOST", "DEBUG_MODE"]);

    const result = compareKeys(envKeys, exampleKeys);

    expect(result.missingInExample).toEqual(new Set(["STRIPE_KEY", "REDIS_URL"]));
    expect(result.missingInEnv).toEqual(new Set(["DEBUG_MODE"]));
    expect(result.inSync).toEqual(new Set(["DB_HOST"]));
  });

  it("should handle both sets being empty", () => {
    const result = compareKeys(new Set(), new Set());

    expect(result.missingInExample.size).toBe(0);
    expect(result.missingInEnv.size).toBe(0);
    expect(result.inSync.size).toBe(0);
  });

  it("should handle empty .env with non-empty .env.example", () => {
    const envKeys = new Set<string>();
    const exampleKeys = new Set(["DB_HOST", "API_KEY"]);

    const result = compareKeys(envKeys, exampleKeys);

    expect(result.missingInExample.size).toBe(0);
    expect(result.missingInEnv).toEqual(new Set(["DB_HOST", "API_KEY"]));
    expect(result.inSync.size).toBe(0);
  });

  it("should handle non-empty .env with empty .env.example", () => {
    const envKeys = new Set(["SECRET", "TOKEN"]);
    const exampleKeys = new Set<string>();

    const result = compareKeys(envKeys, exampleKeys);

    expect(result.missingInExample).toEqual(new Set(["SECRET", "TOKEN"]));
    expect(result.missingInEnv.size).toBe(0);
    expect(result.inSync.size).toBe(0);
  });

  it("should handle large sets (100 keys)", () => {
    const shared = Array.from({ length: 80 }, (_, i) => `SHARED_KEY_${i}`);
    const envOnly = Array.from({ length: 10 }, (_, i) => `ENV_ONLY_${i}`);
    const exampleOnly = Array.from({ length: 10 }, (_, i) => `EXAMPLE_ONLY_${i}`);

    const envKeys = new Set([...shared, ...envOnly]);
    const exampleKeys = new Set([...shared, ...exampleOnly]);

    const result = compareKeys(envKeys, exampleKeys);

    expect(result.inSync.size).toBe(80);
    expect(result.missingInExample.size).toBe(10);
    expect(result.missingInEnv.size).toBe(10);
  });

  it("should ignore keys specified in ignoredKeys", () => {
    const envKeys = new Set(["DB_HOST", "API_KEY", "NODE_ENV", "PORT"]);
    const exampleKeys = new Set(["DB_HOST", "API_KEY"]);
    const ignoredKeys = ["NODE_ENV", "PORT"];

    const result = compareKeys(envKeys, exampleKeys, ignoredKeys);

    // NODE_ENV and PORT are in env but not example, but since they are ignored, 
    // missingInExample should be empty.
    expect(result.missingInExample.size).toBe(0);
    expect(result.inSync).toEqual(new Set(["DB_HOST", "API_KEY"]));
  });

  it("should ignore keys even if missing in .env", () => {
    const envKeys = new Set(["DB_HOST"]);
    const exampleKeys = new Set(["DB_HOST", "SECRET_FEATURE"]);
    const ignoredKeys = ["SECRET_FEATURE"];

    const result = compareKeys(envKeys, exampleKeys, ignoredKeys);

    expect(result.missingInEnv.size).toBe(0);
  });
});

describe("hasMismatch", () => {
  it("should return false when everything is in sync", () => {
    const result = {
      missingInExample: new Set<string>(),
      missingInEnv: new Set<string>(),
      inSync: new Set(["DB_HOST", "API_KEY"]),
    };

    expect(hasMismatch(result)).toBe(false);
  });

  it("should return true when there are keys missing from .env.example", () => {
    const result = {
      missingInExample: new Set(["STRIPE_KEY"]),
      missingInEnv: new Set<string>(),
      inSync: new Set(["DB_HOST"]),
    };

    expect(hasMismatch(result)).toBe(true);
  });

  it("should return true when there are keys missing from .env", () => {
    const result = {
      missingInExample: new Set<string>(),
      missingInEnv: new Set(["DEBUG_MODE"]),
      inSync: new Set(["DB_HOST"]),
    };

    expect(hasMismatch(result)).toBe(true);
  });

  it("should return true when both sides have missing keys", () => {
    const result = {
      missingInExample: new Set(["STRIPE_KEY"]),
      missingInEnv: new Set(["DEBUG_MODE"]),
      inSync: new Set(["DB_HOST"]),
    };

    expect(hasMismatch(result)).toBe(true);
  });

  it("should return false when all sets are empty", () => {
    const result = {
      missingInExample: new Set<string>(),
      missingInEnv: new Set<string>(),
      inSync: new Set<string>(),
    };

    expect(hasMismatch(result)).toBe(false);
  });
});
