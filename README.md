# env-sync-checker

Compare `.env` and `.env.example` files to catch missing or extra environment variable keys before they cause runtime errors.

[![npm version](https://img.shields.io/npm/v/env-sync-checker)](https://www.npmjs.com/package/env-sync-checker)
[![license](https://img.shields.io/npm/l/env-sync-checker)](./LICENSE)

## The Problem

You add a new env var to `.env` but forget to add it to `.env.example`. A teammate clones the repo, runs the app, and gets a cryptic error because `STRIPE_API_KEY` is undefined. Or worse — it happens in production.

`env-sync-checker` catches these mismatches instantly, either locally or in your CI pipeline.

## Installation

Run directly without installing:

```bash
npx env-sync-checker
```

Or install globally:

```bash
npm install -g env-sync-checker
```

## Usage

Run in your project root (where `.env` and `.env.example` live):

```bash
env-sync-checker
```

### When keys are out of sync

```
  🔍 Comparing .env ↔ .env.example

  ❌ Missing in .env.example (2):
     - STRIPE_API_KEY
     - REDIS_URL

  ⚠️  Missing in .env (1):
     - DEBUG_MODE

  ✅ In sync (8 keys)

  Summary: 3 issues found. Run with --fix to auto-resolve.
```

### When everything is in sync

```
  🔍 Comparing .env ↔ .env.example

  ✅ All 11 keys are in sync between .env and .env.example
```

### Auto-fixing missing keys

If you have keys in `.env` that are missing in `.env.example`, you can use the `--fix` flag to automatically append them with empty values.

Before auto-fix:
```bash
$ env-sync-checker

  🔍 Comparing .env ↔ .env.example

  ❌ Missing in .env.example (2):
     - STRIPE_API_KEY
     - REDIS_URL

  ⚠️  Missing in .env (1):
     - DEBUG_MODE

  ✅ In sync (8 keys)

  Summary: 3 issues found. Run with --fix to auto-resolve.
```

After running `env-sync-checker --fix`:
```bash
  🔍 Comparing .env ↔ .env.example

  ⚠️  Missing in .env (1):
     - DEBUG_MODE

  ✅ In sync (10 keys)

  Summary: 1 issue still found. ✨ Auto-fixed keys in .env.example.
```

### Custom file paths

```bash
env-sync-checker --env .env.staging --example .env.example
```

## Options

| Flag | Description | Default |
|---|---|---|
| `--env <path>` | Path to the `.env` file | `.env` |
| `--example <path>` | Path to the `.env.example` file | `.env.example` |
| `--config <path>` | Path to config file | `.envsyncrc` |
| `--fix` | Auto-fix missing keys in `.env.example` | — |
| `-V, --version` | Output the version number | — |
| `-h, --help` | Display help for command | — |

## Ignoring Keys with .envsyncrc

Sometimes you have keys that intentionally differ between environments (e.g., `NODE_ENV`, `PORT`) and you don't want them to trigger a mismatch error.

You can ignore these keys by creating an `.envsyncrc` file in JSON format in your project root:

```json
{
  "ignore": ["NODE_ENV", "PORT"]
}
```

By default, the tool looks for `.envsyncrc`. You can also specify a custom config path using the `--config` flag:

```bash
env-sync-checker --config ./custom/path/.envsyncrc
```

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | All keys are in sync |
| `1` | Mismatch found (missing keys on either side) |
| `2` | File not found (e.g. `.env` or `.env.example` doesn't exist) |

This makes it straightforward to use in CI — a non-zero exit code will fail the pipeline step.

## CI/CD Integration

Add this step to your GitHub Actions workflow to block PRs with missing env keys:

```yaml
- name: Check env sync
  uses: Abudann/env-sync-checker@v1
  # with:
  #   env: .env
  #   example: .env.example
  #   config: .envsyncrc
```

If any keys are out of sync, the step fails with exit code `1` and the output shows exactly which keys are missing.

## How It Works

The tool parses both files, extracts the key names, and performs a set comparison. It **never reads, stores, or outputs the values** of your environment variables — only the key names are compared. This is intentional, so your secrets don't accidentally leak into CI logs.

## Contributing

Found a bug or have a feature idea? Open an issue or submit a PR on [GitHub](https://github.com/Abudann/env-sync-checker).

## License

[MIT](./LICENSE)
