# E2E Tests

These tests use [Playwright](https://playwright.dev/) running via [Vitest](https://vitest.dev/).

## Prerequisites

Before running the tests, you must start the development server:

```bash
pnpm start
```

## Running Tests

Run the E2E tests with:

```bash
pnpm run test:e2e
```

## Writing Tests

Create new `.test.ts` files in this directory. 
Use the standard Vitest `test`, `expect` functions combined with Playwright's API.

Example:

```typescript
import { test, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser.close();
});

test('feature works', async () => {
  const page = await browser.newPage();
  await page.goto('http://localhost:8000');
  // ...
});
```
