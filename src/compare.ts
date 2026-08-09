export interface CompareResult {
  missingInExample: Set<string>;
  missingInEnv: Set<string>;
  inSync: Set<string>;
}

/** Compare two sets of env keys. Returns keys missing from each side and keys in sync. */
export function compareKeys(
  envKeys: Set<string>,
  exampleKeys: Set<string>
): CompareResult {
  const missingInExample = new Set<string>();
  const missingInEnv = new Set<string>();
  const inSync = new Set<string>();

  for (const key of envKeys) {
    if (exampleKeys.has(key)) {
      inSync.add(key);
    } else {
      missingInExample.add(key);
    }
  }

  for (const key of exampleKeys) {
    if (!envKeys.has(key)) {
      missingInEnv.add(key);
    }
  }

  return { missingInExample, missingInEnv, inSync };
}

/** Quick check if the compare result has any mismatches — used to determine exit code. */
export function hasMismatch(result: CompareResult): boolean {
  return result.missingInExample.size > 0 || result.missingInEnv.size > 0;
}
