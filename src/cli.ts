import { Command } from "commander";
import chalk from "chalk";
import { parseEnvFile, FileNotFoundError } from "./parser.js";
import { compareKeys, hasMismatch } from "./compare.js";
import { printReport } from "./reporter.js";
import { loadConfig } from "./config.js";
import { applyAutoFix } from "./autofix.js";

const VERSION = "1.0.0";

const program = new Command();

program
  .name("env-sync-checker")
  .description("Compare .env and .env.example files to find missing or extra keys.")
  .version(VERSION)
  .option("--env <path>", "path to .env file", ".env")
  .option("--example <path>", "path to .env.example file", ".env.example")
  .option("--config <path>", "path to config file", ".envsyncrc")
  .option("--fix", "auto-fix missing keys in .env.example")
  .action((options: { env: string; example: string; config: string; fix?: boolean }) => {
    try {
      const ignoredKeys = loadConfig(options.config);
      const envKeys = parseEnvFile(options.env);
      const exampleKeys = parseEnvFile(options.example);
      
      const result = compareKeys(envKeys, exampleKeys, ignoredKeys);

      let autoFixed = false;
      if (options.fix && result.missingInExample.size > 0) {
        applyAutoFix(options.example, result.missingInExample);
        
        // After fixing, these keys are now in sync. We update the result so reporter knows.
        for (const key of result.missingInExample) {
          result.inSync.add(key);
        }
        result.missingInExample.clear();
        autoFixed = true;
      }

      printReport(result, {
        envPath: options.env,
        examplePath: options.example,
        ignoredKeysCount: ignoredKeys.length,
        autoFixed,
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
