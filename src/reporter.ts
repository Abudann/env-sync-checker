import chalk from "chalk";
import type { CompareResult } from "./compare.js";

interface ReportOptions {
  envPath: string;
  examplePath: string;
}

/** Format and print the comparison result to stdout. */
export function printReport(result: CompareResult, options: ReportOptions): void {
  const { missingInExample, missingInEnv, inSync } = result;
  const totalIssues = missingInExample.size + missingInEnv.size;

  console.log();
  console.log(`  ${chalk.cyan("🔍")} Comparing ${chalk.bold(options.envPath)} ${chalk.dim("↔")} ${chalk.bold(options.examplePath)}`);
  console.log();

  if (totalIssues === 0) {
    const total = inSync.size;
    console.log(`  ${chalk.green("✅")} All ${chalk.bold(String(total))} keys are in sync between ${options.envPath} and ${options.examplePath}`);
    console.log();
    return;
  }

  if (missingInExample.size > 0) {
    console.log(`  ${chalk.red("❌")} Missing in ${chalk.bold(options.examplePath)} (${missingInExample.size}):`);
    for (const key of missingInExample) {
      console.log(`     ${chalk.red("-")} ${key}`);
    }
    console.log();
  }

  if (missingInEnv.size > 0) {
    console.log(`  ${chalk.yellow("⚠️")}  Missing in ${chalk.bold(options.envPath)} (${missingInEnv.size}):`);
    for (const key of missingInEnv) {
      console.log(`     ${chalk.yellow("-")} ${key}`);
    }
    console.log();
  }

  if (inSync.size > 0) {
    console.log(`  ${chalk.green("✅")} In sync (${inSync.size} keys)`);
    console.log();
  }

  console.log(`  Summary: ${chalk.bold(String(totalIssues))} issue${totalIssues === 1 ? "" : "s"} found. Run with ${chalk.cyan("--fix")} to auto-resolve.`);
  console.log();
}
