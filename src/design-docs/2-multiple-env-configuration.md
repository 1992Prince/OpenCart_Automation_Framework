
# How Do You Run Your Tests in Multiple Environments?

* We use the **`dotenv` package** to manage environment-specific configuration.
* Install the package using:

```bash
npm install dotenv
```

* `dotenv` allows us to load environment variables from `.env` files into `process.env`.
* In our framework, we maintain separate environment files:

```text
src/config/
    .env.qa
    .env.dev
    .env.stg
```

* These files contain environment-specific application properties such as:

```text
APP_USERNAME
APP_PASSWORD
APP_BASE_URL
DB_SERVER
API_URL
```

* Example `.env.qa`:

```text
APP_USERNAME=pwapril@pw.com
APP_PASSWORD=pw123
APP_BASE_URL=https://naveenautomationlabs.com/
```

* Example `.env.dev` can contain the corresponding DEV environment values.
* Example `.env.stg` can contain the corresponding STG environment values.

---

# Environment Selection

* In the configuration file, we read the environment value at runtime:

```typescript
import dotenv from 'dotenv';

const ENV = process.env.ENV || 'qa';

console.log(`Running tests on Environment: ${ENV}`);

dotenv.config({
    path: `src/config/.env.${ENV}`
});
```

* `process` is a **Node.js global object** that provides information about and control over the current Node.js process.
* `process.env` is used to access **environment variables** available to the Node.js process.
* `process.env.ENV` captures the `ENV` value passed at runtime.
* We store that value in the `ENV` variable:

```typescript
const ENV = process.env.ENV || 'qa';
```

* If `ENV` is passed at runtime:

```text
ENV=dev
```

* Then:

```typescript
process.env.ENV
```

* returns:

```text
dev
```

* If `ENV` is **not passed**, the fallback value is:

```text
qa
```

* Therefore:

```typescript
const ENV = process.env.ENV || 'qa';
```

* means:

```text
ENV passed → use that environment
ENV not passed → use QA
```

---

# Loading the Environment File

* We dynamically construct the `.env` file path:

```typescript
dotenv.config({
    path: `src/config/.env.${ENV}`
});
```

* If:

```text
ENV=qa
```

* The framework loads:

```text
src/config/.env.qa
```

* If:

```text
ENV=dev
```

* The framework loads:

```text
src/config/.env.dev
```

* If:

```text
ENV=stg
```

* The framework loads:

```text
src/config/.env.stg
```

* `dotenv.config()` reads the selected `.env` file and loads its properties into `process.env`.

---

# Using Environment Properties in Playwright Configuration

* We can use environment-specific properties in `playwright.config.ts`.
* For example:

```typescript
baseURL: process.env.APP_BASE_URL
```

* This allows the same test framework to run against different application URLs.
* For example:

```text
QA  → QA application URL
DEV → DEV application URL
STG → STG application URL
```

* We don't hardcode the environment-specific URL in the test scripts.

---

# Using Environment Properties in Tests

* Environment-specific properties can also be accessed directly from `process.env` inside test files.
* For example:

```typescript
await loginPage.doLogin(
    process.env.APP_USERNAME,
    process.env.APP_PASSWORD
);
```

* This allows the same test to use different credentials depending on the selected environment.

---

# Running Tests from Command Line

* On Linux/macOS, an environment can be passed while executing the test:

```bash
ENV=qa npx playwright test
```

* For DEV:

```bash
ENV=dev npx playwright test
```

* For STG:

```bash
ENV=stg npx playwright test
```

---

# Running Tests on Windows — PowerShell

* In a Windows VS Code PowerShell terminal, we can set the environment variable at runtime:

```powershell
$env:ENV="qa"; npx playwright test
```

* For DEV:

```powershell
$env:ENV="dev"; npx playwright test
```

* For STG:

```powershell
$env:ENV="stg"; npx playwright test
```

* We can also run a specific test file:

```powershell
$env:ENV="qa"; npx playwright test tests/opencart-ui-tests/login.spec.ts
```

---

# CI/CD Execution

* The same `ENV` variable can be supplied from the **CI/CD pipeline**.
* For example, the pipeline can set:

```text
ENV=qa
```

* The framework then:

```text
CI/CD Pipeline
       ↓
ENV=qa
       ↓
process.env.ENV
       ↓
ENV = qa
       ↓
src/config/.env.qa
       ↓
Environment properties loaded
       ↓
Playwright tests execute against QA
```

* This allows the same automation codebase to execute against multiple environments without changing the test scripts.

---

# Interview Answer

* **"We use the `dotenv` package to manage environment-specific configuration. We maintain separate `.env` files such as `.env.qa`, `.env.dev`, and `.env.stg` under our config folder. These files contain environment-specific properties such as application URL, username, password, API URL, and database configuration. At runtime, we capture the environment using `process.env.ENV`. If no environment is provided, we use QA as the default. We then dynamically load the corresponding `.env` file using `dotenv.config()`. The loaded properties become available through `process.env`, so we can use values such as `process.env.APP_BASE_URL`, `process.env.APP_USERNAME`, and `process.env.APP_PASSWORD` in our Playwright configuration and tests. The `ENV` value can be supplied from the command line, Windows PowerShell, or the CI/CD pipeline, allowing the same test code to run against QA, DEV, or STG without changing the test scripts."**
