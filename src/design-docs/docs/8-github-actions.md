
# GitHub Actions – Interview Notes

---

## 1. What is GitHub Actions?

- GitHub Actions is a CI/CD automation platform provided by GitHub.
- It is used to build, test, and deploy applications automatically.
- For SDET, a common use case is to execute automated tests in CI whenever code changes are pushed or a PR is created.
- Workflows are written using YAML (`.yml` / `.yaml`) files.

---

## 2. Where do we create GitHub Actions workflows?

Workflows are created inside:

```text
.github/
    workflows/
        playwright.yml
```

- `.github/workflows` is the standard location for workflow files.
- GitHub automatically detects YAML files present in this folder.
- We can see and manage them from the **Actions** tab of the repository.

### Q - How many workflow files can we create?

There is no need to keep everything in one file.

We can create multiple workflow files:

```text
.github/workflows/
    playwright-regression.yml
    api-tests.yml
    smoke-tests.yml
    regression-tests.yml
    deployment.yml
```

Each file represents a separate workflow.

---

## 3. What is a Workflow?

A workflow is an automated process defined in a YAML file.

It defines:

- When the workflow should run → `on`
- What machine it should run on → `runs-on`
- What work it should perform → `jobs` and `steps`

### Simple flow

```text
Trigger
   ↓
Workflow
   ↓
Job
   ↓
Steps
   ↓
Test Execution
   ↓
Report / Artifacts
```

---

## 4. How can we trigger a workflow?

A workflow can be triggered in different ways.

### Push

```yaml
on:
  push:
    branches: [main]
```

Runs when code is pushed to `main`.

### Pull Request

```yaml
on:
  pull_request:
    branches: [main]
```

Runs when a PR is created/updated against `main`.

### Schedule

```yaml
on:
  schedule:
    - cron: '30 14 * * 1-5'
```

Runs automatically according to a cron schedule.

### Manual Execution

```yaml
on:
  workflow_dispatch:
```

Allows the user to manually start the workflow from the GitHub Actions UI.

---

## 5. Manual Execution with Input Parameters

We can also ask the user to select parameters when manually triggering the workflow.

Example:

```yaml
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
```

When we click **Run workflow**, GitHub provides an environment dropdown:

```text
QA
stage
dev
```

This is useful when the same automation needs to run against different environments.

---

## 6. Jenkins vs GitHub Actions

### Jenkins

Traditionally, we may need to manage:

- Jenkins controller/agent setup
- Agent machines
- Workspace
- Tool installation
- Maintenance

### GitHub Actions

GitHub provides hosted runners that can execute our workflow.

Example:

```yaml
runs-on: ubuntu-latest
```

GitHub provisions a virtual machine for the job.

After the job finishes, the hosted runner is generally temporary and discarded.

### Interview keyword

> "GitHub-hosted runners provide on-demand execution environments, so we don't have to maintain dedicated build agents for every workflow."

GitHub Actions also has **self-hosted runners** when organizations need their own infrastructure.

---

## 7. What is a Runner?

A runner is the machine/environment where the GitHub Actions job executes.

Example:

```yaml
runs-on: ubuntu-latest
```

This means the job runs on a GitHub-hosted Ubuntu machine.

### Common examples

```text
ubuntu-latest
windows-latest
macos-latest
```

For Playwright CI execution, Linux runners are commonly used and browser tests generally run in headless mode.

---

## 8. What are Jobs?

`jobs` defines the actual units of work.

Example:

```yaml
jobs:
  test:
```

Here `test` is the job ID.

A workflow can have multiple jobs:

```yaml
jobs:
  test:
  api-test:
  deploy:
```

Jobs can also have dependencies using `needs`.

---

## 9. What are Steps?

Inside a job, we define individual steps.

Example:

```yaml
steps:
  - Checkout code
  - Setup Node.js
  - Install dependencies
  - Install Playwright
  - Run tests
  - Upload report
```

Each step normally performs one logical operation.

---

## 10. `uses` vs `run`

This is an important interview question.

### `uses`

Used to execute a pre-built GitHub Action.

Example:

```yaml
uses: actions/checkout@v4
```

### `run`

Used to execute a shell command.

Example:

```yaml
run: npm ci
```

### Simple way to remember

```text
uses → GitHub Action
run  → Command
```

---

## 11. Important GitHub Actions

### Checkout

```yaml
uses: actions/checkout@v4
```

**Purpose:**

Checks out the repository code into the runner.

Without checkout, our test code is not available in the runner workspace.

---

### Setup Node.js

```yaml
uses: actions/setup-node@v4
```

**Purpose:**

Installs/configures the required Node.js version.

Example:

```yaml
with:
  node-version: 24
```

---

### Upload Artifact

```yaml
uses: actions/upload-artifact@v4
```

**Purpose:**

Stores files generated during the workflow.

Useful for:

- Playwright HTML reports
- Screenshots
- Videos
- Logs
- Traces

Example:

```yaml
path: playwright-report/
```

---

## 12. What is Caching?

Caching is used to avoid downloading/installing the same dependencies repeatedly.

For example, Playwright browsers can take time to download.

We can cache them:

```yaml
- name: Cache Playwright browsers
  id: playwright-cache
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('package-lock.json') }}
```

### How it works

```text
First execution
      ↓
No cache
      ↓
Download Playwright browsers
      ↓
Save cache

Next execution
      ↓
Cache available
      ↓
Reuse cache
      ↓
Less execution time
```

### Interview keyword

> "Caching improves CI execution time by reusing dependencies or artifacts that don't need to be downloaded on every run."

---

## 13. What is `hashFiles()`?

Example:

```yaml
key: playwright-${{ hashFiles('package-lock.json') }}
```

`hashFiles()` generates a hash based on the specified file.

If `package-lock.json` changes, the hash changes, so GitHub can create/use a new cache key.

This helps avoid using an outdated cache after dependency changes.

---

## 14. GitHub Secrets

Sensitive information should not be hardcoded in the YAML or source code.

Examples:

```text
APP_USERNAME
APP_PASSWORD
API_TOKEN
CLIENT_SECRET
X_API_KEY
```

These can be stored in:

```text
Repository
    ↓
Settings
    ↓
Secrets and variables
    ↓
Actions
    ↓
Repository secrets
```

Then referenced in YAML:

```yaml
APP_USERNAME: ${{ secrets.APP_USERNAME }}
```

### Interview keyword

> "We use GitHub Secrets to securely manage credentials, tokens, API keys, and other sensitive configuration values."

---

## 15. How does the application read these values?

In the Playwright code we can read environment variables:

```typescript
process.env.APP_USERNAME
process.env.APP_BASE_URL
process.env.API_TOKEN
```

Locally, we might use:

```text
.env.qa
.env.stage
.env.dev
```

And select the environment using:

```typescript
const ENV = process.env.ENV || 'qa';
```

In CI, instead of depending on local `.env` files, we pass values through GitHub Actions environment variables/secrets.

Example:

```yaml
env:
  ENV: ${{ github.event.inputs.environment || 'QA' }}
  APP_BASE_URL: ${{ secrets.APP_BASE_URL }}
  APP_USERNAME: ${{ secrets.APP_USERNAME }}
```

---

## 16. Important: `process.env.CI`

In Playwright configuration, we often see:

```typescript
retries: process.env.CI ? 2 : 0
```

`CI` is a commonly used environment variable indicating that tests are running in a Continuous Integration environment.

For example:

```text
Local execution → CI is not set/false
CI execution    → CI is true
```

Therefore:

```typescript
retries: process.env.CI ? 2 : 0
```

means:

```text
CI    → 2 retries
Local → 0 retries
```

This is a **ternary operator**.

---

## 17. CI-specific Workers

Example:

```typescript
workers: process.env.CI ? 2 : undefined
```

This means:

```text
CI     → 2 workers
Local  → Playwright default worker behavior
```

We often control workers in CI because the runner has limited resources and excessive parallelism can make tests unstable.

---

## 18. Headless Execution

CI environments generally execute browser tests in headless mode.

Example:

```typescript
headless: process.env.CI ? true : false
```

Meaning:

```text
CI    → headless
Local → headed
```

This allows developers to see the browser locally while CI executes efficiently without opening a visible browser window.

---

## 19. Different Reports for Local and CI

We may configure different reporters based on the execution environment.

Example:

```typescript
reporter: process.env.CI
  ? [['html']]
  : [['list']]
```

### Typical approach

```text
Local → Simple console/list reporting
CI    → HTML/reporting suitable for CI artifacts
```
