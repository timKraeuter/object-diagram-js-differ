# AGENTS.md — Guidance for AI Coding Agents

## Project Overview

Small JavaScript library (~200 LOC) for semantic diffing of object diagram models.
Adapted from [bpmn-js-differ](https://github.com/bpmn-io/bpmn-js-differ). Pure JS (no TypeScript).
ES module project (`"type": "module"` in package.json).

Source code lives in `lib/` (not `src/`). Tests live in `spec/`.

## Build / Lint / Test Commands

```bash
# Run everything (lint → test → build) — used in CI
npm run all

# Lint only
npm run lint

# Lint with auto-fix
npm run lintFix

# Run all tests (Jasmine)
npm test

# Run a single test by name filter
npx jasmine --filter="should discover add"

# Build (Rollup → UMD, CJS, ESM bundles in dist/)
npm run build
```

CI (`.github/workflows/CI.yml`) runs `npm run all` on ubuntu-latest, Node 20.

## Project Structure

```
lib/
  index.js            # Re-exports default from diff.js
  diff.js             # Public API: diff(a, b, handler) convenience function
  differ.js           # Core diffing via jsondiffpatch + tree walk
  change-handler.js   # Categorizes changes into _added/_removed/_changed/_layoutChanged
spec/
  DifferSpec.js       # Jasmine specs using Chai assertions
  fixtures/           # XML object diagram test fixtures
  support/
    jasmine.json      # Jasmine configuration
```

## Test Framework

- **Jasmine v6** as the test runner
- **Chai** for assertions (`expect` style)
- Test files: `spec/**/*[sS]pec.?(m)js` (configured in `spec/support/jasmine.json`)
- Tests are async (return promises); use `async function` with `await`
- Test fixtures are XML files read via `readFileSync` from `spec/fixtures/`

### Test Patterns

```js
import { expect } from 'chai';
import diff from '../lib/index.js';

describe('featureName', function() {
  it('should do something', async function() {
    const result = await somethingAsync();
    expect(result._added).to.have.keys([ 'id1', 'id2' ]);
    expect(result._removed).to.eql({});
  });
});
```

- Use `function()` (not arrow functions) for `describe`/`it` blocks
- Helper functions at the bottom of the spec file after `// helpers //////////////////`

## Code Style

ESLint flat config in `eslint.config.js` extends `eslint-plugin-bpmn-io` recommended rules.
Jasmine globals are enabled for `spec/` files. `dist/` is ignored.

### Formatting Rules (enforced by ESLint)

| Rule                        | Value                                        |
|-----------------------------|----------------------------------------------|
| Indentation                 | 2 spaces                                     |
| Quotes                      | Single quotes (avoidEscape: true)            |
| Semicolons                  | Always                                       |
| Array brackets              | Spaces inside: `[ 'a', 'b' ]`               |
| Object braces               | Spaces inside: `{ key: value }`              |
| Parentheses                 | No spaces inside: `(arg1, arg2)`             |
| Space before blocks         | Always: `function() {`                       |
| Space before function paren | Never for named/anonymous, always for async arrow |
| Trailing spaces             | Not allowed                                  |
| Multi-spaces                | Not allowed                                  |
| Comments                    | Blank line before block and line comments    |
| Bitwise operators           | Disallowed (`no-bitwise`)                    |
| Unused vars                 | Error; args ignored; `_` prefix ignored      |

### Imports
- ES module syntax (`import`/`export`), never CommonJS (`require`)
- Always include `.js` extension in relative imports: `import Differ from './differ.js'`
- Destructured named imports for utilities: `import { forEach, reduce } from 'min-dash'`
- Default exports for main module entry points and constructor functions
- Named re-exports: `export { default } from './diff.js'`

### Naming Conventions

| Kind                 | Convention          | Example              |
|----------------------|---------------------|----------------------|
| Constructor function | PascalCase          | `Differ`, `ChangeHandler` |
| Regular function     | camelCase           | `diff`, `isTracked`  |
| Variables            | camelCase           | `diffpatcher`, `newValue` |
| Private/internal     | `_` prefix          | `this._added`, `this._changed` |
| Constants            | camelCase (no UPPER_SNAKE) | (none in codebase) |

### Class / Object Pattern

**Constructor functions + prototype methods** — NOT ES6 classes.
Instance state is set in the constructor; methods are assigned on prototype:

```js
export default function MyClass() {
  this._data = {};
}

MyClass.prototype.doSomething = function(arg) {
  // ...
};
```

### Other Style Rules
- Use `const` by default; `let` when reassignment is needed; never `var`
- Use `function` keyword for named functions and methods (not arrow functions)
- Arrow functions are acceptable in short inline callbacks
- Minimal error handling; no try/catch in library code; relies on consumers
- Uses `/* eslint no-cond-assign: 0 */` for intentional assignment in conditions
- Keep comments minimal; code should be self-explanatory
- Use `// helpers //////////////////` section separators in test files
- Blank line required before both block and line comments (enforced by ESLint)

## Dependencies

### Runtime
- `jsondiffpatch` — JSON structural diffing engine
- `min-dash` — Minimal lodash-like utilities (`forEach`, `reduce`, `isArray`)

### Dev
- `eslint` + `eslint-plugin-bpmn-io` — Linting
- `jasmine` — Test runner; `chai` — Assertion library
- `rollup` — Bundler (UMD, CJS, ESM outputs)
- `object-diagram-moddle` — XML↔JS model parsing (test-only)

## Key Architecture Notes

- The `diff()` function takes two parsed object diagram model roots (not raw XML)
- XML parsing is done by consumers using `object-diagram-moddle`
- `Differ.createDiff()` uses jsondiffpatch with custom `objectHash` (uses `obj.id`)
  and `propertyFilter` (excludes `$instanceOf`)
- `ChangeHandler` tracks only elements of types: `od:OdBoard`, `od:Object`, `od:Link`
- The diff result exposes four maps: `_added`, `_removed`, `_changed`, `_layoutChanged`
