# GitHub Actions: Playwright Docker Image

## 1. Older CI YAML --- What We Were Doing

Previously, the workflow [smoke.yml/regression.yml] was responsible for preparing the complete
Playwright environment.

Main steps:

1.  **Checkout code**
    -   Clone the GitHub repository into the CI machine.
2.  **Setup Node.js**
    -   Install the required Node.js version.
3.  **Cache Playwright browsers**
    -   Reuse downloaded browser binaries between workflow runs.
4.  **Install npm dependencies**
    -   Run `npm ci`.
    -   Installs dependencies from `package-lock.json`.
5.  **Install Playwright browsers/dependencies**
    -   Example:

    ``` yaml
    npx playwright install --with-deps chromium
    ```

    -   Downloads Chromium and required Linux/browser dependencies.
6.  **Run Playwright tests**
    -   Example:

    ``` yaml
    npx playwright test --project=chromium
    ```
7.  **Upload reports**
    -   Upload `playwright-report/`.
    -   Upload `test-results/`.
8.  **Pipeline summary**
    -   Show environment, test result, workflow/run information, etc.

------------------------------------------------------------------------

## 2. What Changes with Playwright Docker Image?

We can use:

``` text
mcr.microsoft.com/playwright:v1.63.0-noble
```

The image already contains:

-   Node.js
-   Playwright
-   Chromium
-   Firefox
-   WebKit
-   Browser system dependencies

### Therefore, we DON'T need to do these separately:

  Old Step                           With Playwright Docker Image
  ---------------------------------- ------------------------------
  `actions/setup-node`               ❌ Not required
  Install Playwright browsers        ❌ Not required
  `playwright install --with-deps`   ❌ Not required
  Playwright browser cache           ❌ Not required

### We STILL need:

-   ✅ `actions/checkout`
-   ✅ `npm ci`
-   ✅ Run Playwright tests
-   ✅ Upload HTML report
-   ✅ Upload test results
-   ✅ Pipeline summary
-   ✅ GitHub Environment secrets

> `npm ci` is still required because the Docker image does not contain
> our project's npm dependencies from `package.json`.

------------------------------------------------------------------------

## 3. Complete YAML Using Playwright Docker Image

``` yaml
name: Playwright E2E Tests

on:
  # Manually trigger workflow from Actions tab.
  workflow_dispatch:
    inputs:
      environment:
        description: 'Select environment'
        required: true
        default: 'QA'
        type: choice
        options:
          - QA
          - stage
          - dev

jobs:

  test:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest

    # Use official Playwright image.
    # Node.js, Playwright, browsers and OS dependencies are already available.
    container:
      image: mcr.microsoft.com/playwright:v1.63.0-noble
      options: --init --ipc=host

    # Select GitHub Environment based on dropdown value.
    environment: ${{ inputs.environment }}

    steps:

      - name: Checkout repository
        # Clone repository into the CI container.
        uses: actions/checkout@v6

      - name: Install dependencies
        # Install project dependencies from package-lock.json.
        run: npm ci

      - name: Run Playwright tests
        run: npx playwright test --project=chromium
        env:
          ENV: ${{ inputs.environment }}

          # GitHub Environment secrets.
          APP_BASE_URL: ${{ secrets.APP_BASE_URL }}
          APP_USERNAME: ${{ secrets.APP_USERNAME }}
          APP_PASSWORD: ${{ secrets.APP_PASSWORD }}
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
          X_API_KEY: ${{ secrets.X_API_KEY }}
          API_TOKEN: ${{ secrets.API_TOKEN }}
          OAUTH_CLIENT_ID: ${{ secrets.OAUTH_CLIENT_ID }}
          OAUTH_CLIENT_SECRET: ${{ secrets.OAUTH_CLIENT_SECRET }}
          GRANT_TYPE: ${{ secrets.GRANT_TYPE }}

      - name: Upload Playwright HTML Report
        # Upload report even when tests fail.
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ github.run_id }}
          path: playwright-report/
          retention-days: 7

      - name: Upload Playwright Test Results
        # Upload screenshots, traces, videos and other debugging artifacts.
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-test-results-${{ github.run_id }}
          path: test-results/
          retention-days: 7

  summary:
    name: Pipeline Summary
    needs: [test]
    if: always()
    runs-on: ubuntu-latest

    steps:

      - name: Results
        run: |
          echo "═══════════════════════════════════════════"
          echo "       PLAYWRIGHT PIPELINE SUMMARY"
          echo "═══════════════════════════════════════════"
          echo "Environment:    ${{ inputs.environment }}"
          echo "Test Job:       ${{ needs.test.result }}"
          echo "Workflow:       ${{ github.workflow }}"
          echo "Run Number:     ${{ github.run_number }}"
          echo "Run ID:         ${{ github.run_id }}"
          echo "Branch:         ${{ github.ref_name }}"
          echo "Commit:         ${{ github.sha }}"
          echo "Triggered By:   ${{ github.actor }}"
          echo "───────────────────────────────────────────"
          echo "HTML Report:    Uploaded as CI artifact"
          echo "Test Results:   Uploaded as CI artifact"
          echo "═══════════════════════════════════════════"
```

------------------------------------------------------------------------

## 4. Old vs New CI Flow

### Older approach

``` text
GitHub Runner
     ↓
Setup Node.js
     ↓
Cache browsers
     ↓
npm ci
     ↓
Install Playwright browsers
     ↓
Install browser dependencies
     ↓
Run tests
     ↓
Upload reports
```

### Docker approach

``` text
Playwright Docker Image
(Node + Playwright + Browsers + OS dependencies)
     ↓
Checkout code
     ↓
npm ci
     ↓
Run tests
     ↓
Upload reports
```

------------------------------------------------------------------------

## 5. Main Benefit

The Docker image makes the CI environment **pre-built and consistent**.

Instead of preparing Playwright and browser dependencies on every
workflow run, the required environment is already inside the image.

### Important

Docker does **not** remove `npm ci`.

The image provides the **Playwright execution environment**; `npm ci`
installs **our project's dependencies**.

Also, CI execution time is not guaranteed to be faster on every run
because GitHub may need to pull the Docker image. The bigger benefits
are **consistent environment, simpler YAML, and less setup work**.


Exactly — with one important clarification. 👍

### Old approach

You are **building the Playwright environment on the CI machine**:

```text
GitHub Runner
   ↓
Install Node.js
   ↓
npm ci
   ↓
Install Playwright browsers + OS dependencies
   ↓
Cache browser binaries
   ↓
Run tests
```

So the workflow itself performs the machine/environment setup.

---

### New Docker approach

The Playwright Docker image is **already a prepared environment**:

```text
Playwright Docker Image
   │
   ├── Node.js                 ✅ Already there
   ├── Playwright              ✅ Already there
   ├── Chromium                ✅ Already there
   ├── Firefox                ✅ Already there
   ├── WebKit                 ✅ Already there
   └── Browser OS dependencies ✅ Already there
              ↓
        Checkout code
              ↓
          npm ci
              ↓
        Run tests
```

So **NO**, Docker does **not** only install `node_modules`.

The important distinction is:

| Component                     | Old way                    | Docker way                                                                 |
| ----------------------------- | -------------------------- | -------------------------------------------------------------------------- |
| Node.js                       | Installed during CI        | ✅ Already in image                                                         |
| Playwright package            | Installed through `npm ci` | ✅ Image has Playwright, but your project version still comes from `npm ci` |
| Browser binaries              | Downloaded/installed       | ✅ Already inside image                                                     |
| Browser OS dependencies       | Installed                  | ✅ Already inside image                                                     |
| Your project's `node_modules` | `npm ci`                   | `npm ci`                                                                   |
| Browser cache                 | Used                       | ❌ Not needed                                                               |

### One important detail

Your project still has:

```json
"@playwright/test": "1.63.0"
```

and:

```bash
npm ci
```

installs your project's dependencies, including `@playwright/test`.

The Docker image already contains the **Playwright browser binaries and system dependencies**, so you don't need:

```bash
npx playwright install
```

or:

```bash
npx playwright install --with-deps
```

That's the main advantage. **The Docker image is essentially your pre-built Playwright test machine.** 🚀
