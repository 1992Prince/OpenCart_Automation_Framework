In **Playwright + TypeScript**, the simplest way is to add the tag directly in the test title using `@tag`.

### 1. Add tag in test name

```ts
import { test, expect } from '@playwright/test';

test('Verify login functionality @smoke', async ({ page }) => {
    await page.goto('https://example.com');
    // test steps
});

test('Verify invalid login @regression', async ({ page }) => {
    // test steps
});
```

You can use tags like:

```text
@smoke
@regression
@sanity
@e2e
```

---

### 2. Run tests using the tag

For example, to run only `@smoke` tests:

```bash
npx playwright test --grep @smoke
```

For regression:

```bash
npx playwright test --grep @regression
```

---

### 3. Add the command to `package.json`

Inside `scripts`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:smoke": "npx playwright test --grep @smoke",
    "test:regression": "npx playwright test --grep @regression"
  }
}
```

---

### 4. Run from npm

Now you don't need to type the full Playwright command.

For smoke:

```bash
npm run test:smoke
```

For regression:

```bash
npm run test:regression
```

### Simple flow to remember

```text
Add @tag
    ↓
test('Login test @smoke')
    ↓
Add command in package.json
    ↓
"test:smoke": "playwright test --grep @smoke"
    ↓
Run
    ↓
npm run test:smoke
```

**Interview answer:**

> "In Playwright, I tag tests using `@tag` in the test title, for example `@smoke` or `@regression`. I use Playwright's `--grep` option to execute tests matching a specific tag, and I usually add these commands as npm scripts for easy local and CI execution."
