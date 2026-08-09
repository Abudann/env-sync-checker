import { Command } from "commander";
import chalk from "chalk";
import { parseEnvFile, FileNotFoundError } from "./parser.js";
import { compareKeys, hasMismatch } from "./compare.js";
import { printReport } from "./reporter.js";

const VERSION = "1.0.0";

const program = new Command();

program
  .name("env-sync-checker")
  .description("Compare .env and .env.example files to find missing or extra keys.")
  .version(VERSION)
  .option("--env <path>", "path to .env file", ".env")
  .option("--example <path>", "path to .env.example file", ".env.example")
  .action((options: { env: string; example: string }) => {
    try {
      const envKeys = parseEnvFile(options.env);
      const exampleKeys = parseEnvFile(options.example);
      const result = compareKeys(envKeys, exampleKeys);

      printReport(result, {
        envPath: options.env,
        examplePath: options.example,
      });

      process.exit(hasMismatch(result) ? 1 : 0);
    } catch (err) {
      if (err instanceof FileNotFoundError) {
        console.error(`\n  ${chalk.red("Error:")} ${err.message}\n`);
        process.exit(2);
      }
      throw err;
    }
  });

program.parse();
