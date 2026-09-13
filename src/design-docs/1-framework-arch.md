An automation framework architecture is broken down into two distinct halves: **High-Level Design (HLD)** covering code layers and software design principles, and **Infrastructure & DevOps** covering continuous execution and delivery.

---

## 1. What is an Automation Framework & Why Do We Need It?

* **Systematic Code Structure:** Prevents dumping hundreds of tests or thousands of lines of procedural code into single files.
* **Team Scalability:** Provides clean patterns so multiple SDETs/QAs can build, extend, and review automation concurrently without merge conflicts.
* **Core Non-Functional Benefits:** Maximizes reusability, minimizes maintenance overhead when application UI/APIs change, and enforces readability.

---

## 2. Part 1: High-Level Design (HLD) of the Framework

When asked to explain the **Framework Architecture**, articulate the **HLD layers and design principles**, not isolated implementation code (which belongs to Low-Level Design / LLD).

### Architectural Layers

* **Layer 1 — Page Layer (Page Object Model):**
* Implements **Encapsulation (OOP)**: Locators are kept `private` within page classes; user interactions and behaviors are exposed as `public` methods.
* **Strict Rule:** Page classes **never** contain assertions (`expect`); they only model page operations and return state or text for verification.
* **Layer 2 — Base Page Layer:**
* Implements **Inheritance (OOP)**: All page classes extend `BasePage`.
* Encapsulates common wrappers, cross-cutting actions, and global UI elements (e.g., headers, footers, logo/navigation verification, wait handlers).
* **Layer 3 — Test Layer (`/tests` or specs):**
* Houses test spec files (`*.spec.ts`).
* Contains all business validations and test assertions. Tests instantiate or inject page objects and call their public methods to assert application states.
* **Layer 4 — Fixtures Layer (Custom Fixtures):**
* Provides dependencies on the fly during runtime.
* Implements the **Factory Pattern** to initialize `PageManager`, individual page objects, dynamic authentication states, or API context fixtures before test execution starts.
* **Layer 5 — Test Data Layer:**
* Drives data-driven testing (DDT) by loading test datasets from lightweight external formats (JSON, CSV, Excel).
* Data sets are parsed via utilities at spec initialization and mapped to test iterations.
* **Layer 6 — Framework Configuration Layer (`playwright.config.ts`):**
* Controls global Playwright runtime properties: base URLs, parallel workers, timeouts, retry policies, screenshot captures, trace recordings, and reporters.
* **Layer 7 — Environment Management Layer (`.env.*`):**
* Externalizes environment-specific properties (QA, Staging, Dev) such as base URLs, API tokens, and service credentials. Driven via commands like:

```bash
ENV=qa npx playwright test
```

* **Layer 8 — Utilities / Helpers Layer (`/utils`):**
* Provides generic, reusable helper modules:
* File parsers (CSV, Excel, JSON).
* Random data generators (e.g., Faker libraries for names, addresses, phones).
* Database connectors and REST API HTTP clients for setup/teardown.
* **Layer 9 — Project & Package Metadata Layer:**
* `package.json` manages dependencies, devDependencies, execution scripts, project metadata, and module definitions (`type: "module"`).
* `tsconfig.json` governs TypeScript path mappings and compiler rules.
* **Layer 10 — Reporting & Artifacts Layer:**
* Automatically generates execution outputs: HTML reports, Allure reports, Playwright traces, failure screenshots, and execution videos.

---

### Core Design Principles & Patterns Followed

* **Single Responsibility Principle (SRP):** Each class and file has one single responsibility. Page classes only manipulate DOM elements; test specs only perform assertions; data utilities only handle file I/O.
* **YAGNI (You Aren't Gonna Need It):** Only build framework utilities that solve current, concrete requirements; avoid speculative over-engineering.
* **Loose Coupling & Abstraction:** Components interact through clean abstraction layers rather than hard concrete dependencies, simplifying future library or architecture upgrades.
* **Design Patterns:**
* **Page Object Model (POM):** Decouples UI structure and locators from test logic.
* **Factory Pattern:** Dynamically provisions page instances and API clients via custom fixtures.
* **Fluent / Chained Method Pattern:** Page action methods return `this` or the target destination page class instance to enable readable, chained method calls.
* **Singleton Pattern:** Used for global configuration managers, database pool instances, and logger setups.

---

## 3. Part 2: Infrastructure & DevOps

The second half of the framework architecture enables unattended execution, automated gating, and containerized scale.

* **Version Control & Branching Strategy:**
* Git repository hosted on GitHub/GitLab/Bitbucket.
* Trunk-based or GitFlow model (Feature branch $\rightarrow$ Pull Request $\rightarrow$ Automated CI Check $\rightarrow$ Merge to `main`).
* **CI/CD Pipeline Integration (Jenkins / GitHub Actions):**
* Triggers automated smoke test suites on developer Pull Requests (PR gating).
* Executes scheduled regression suites (nightly/weekly) across distributed runners.
* Sends automated test execution summaries and failure alerts to Slack/MS Teams channels and email distribution lists.
* **Containerization & Scale (Docker / Kubernetes):**
* Docker images pre-baked with required Node.js runtimes, browsers, and dependencies to guarantee consistent local vs. CI execution environments.
* Integrates with cloud-based browser infrastructure or Kubernetes clusters to execute hundreds of tests concurrently using parallel workers.

---

## 4. Package vs. Package.json

Both **`package.json`** and **`package-lock.json`** stay at the root level of the project, but they serve completely different purposes:

* **`package.json`** is the project manifest file where you define your framework's metadata—such as the framework name, version, description, author, license, type, custom execution scripts, dependencies, and devDependencies. It specifies the acceptable version ranges (e.g., using `^` or `~`).

```json
{
  "name": "opencart_automation_framework",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {},
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "devDependencies": {
    "@playwright/test": "^1.62.1",
    "@types/node": "^26.4.1"
  }
}
```

* **`package-lock.json`**, on the other hand, is automatically generated and maintained by Node.js (npm). It records the exact, pinned versions and full dependency tree of every single package and sub-dependency installed at that moment.
* This guarantees that every team member, CI pipeline runner, and deployment server installs the exact same version of Playwright and its libraries, preventing version drift or unexpected breaking changes across environments.                               |

---

## Question 1: "Explain the folder structure of your automation framework."

**How to deliver the answer (in 60 seconds):**

* **At Root Configuration level:**
* `package.json` & `tsconfig.json`: Manage dependencies, execution scripts, and TypeScript path mappings.
* `playwright.config.ts`: Controls global timeouts, browser settings, retries, workers, and reporters.
* `.github/workflows`: Holds CI/CD pipeline definitions for automated runs.
* **Source Directory (`/src`):**
* `/pages`: Houses all Page Object classes; locators are private, action methods of page/behaviours are public, and all extend a common `BasePage`.
* `/fixtures`: Custom Playwright fixtures acting as a factory to initialize page objects, auth sessions, and API clients on the fly.
* `/config`: Environment files (`.env.qa`, `.env.stg`) holding base URLs and service credentials.
* `/utils`: Reusable helper classes for DB connections, custom Faker data generators, and CSV/JSON parsers.
* **Tests & Data:**
* `/tests`: Contains test spec files (`*.spec.ts`) with business logic and assertions.
* `/test-data`: Externalized JSON/CSV files driving data-driven tests.
* **Generated Artifacts:**
* `/playwright-report` & `/test-results`: Stores HTML reports, screenshots, videos, and trace files.

---

## Question 2: "Can you walk me through your overall framework architecture design?"

**How to deliver the answer (in 90 seconds):**

* **Framework Arch have two Core Halves:**
* I split our framework into **High-Level Design (HLD)** and **DevOps Infrastructure**.
* **High-Level Design (HLD):**
* **Layered Architecture:** Clear separation of concerns into Page Layer, Test Layer, Fixture Layer, Data Layer, and Utilities.
* **OOP & Clean Code:**
* **Encapsulation:** Locators are kept strictly private inside Page classes.
* **Inheritance:** Page classes inherit common actions and global components from a `BasePage`.
* **Separation of Concerns:** Zero assertions in Page classes; assertions live exclusively in the Test Layer (`/tests`).
* **Design Patterns:** Page Object Model (POM) for UI mapping, Custom Fixtures as a Factory pattern for dependency injection, and Fluent/Chained methods for step readability.
* **Data & Config:** Test data is externalized in JSON/CSV files, and multi-environment runs are driven via `.env` files.
* **Infrastructure & CI/CD:**
* **Source Control:** Git repository using feature branches and Pull Request gating.
* **CI Pipeline Integration:** Jenkins/GitHub Actions runs automated smoke tests on every developer PR to catch breaks early.
* **Scheduled Regression:** Full regressions run nightly across parallel Docker containers for fast feedback, pushing results directly to Slack and email.

## Question 3: "Why do you have a `tsconfig.json` file at the root level, and what is its purpose?"

**How to answer in an interview (in points):**

* **Core Purpose:**
* It marks the root directory as a TypeScript project and tells the compiler (`tsc`) how to transpile TypeScript code into JavaScript.
* It controls **strictness**—defining how strictly TypeScript enforces type checking, null checks, and code quality rules across your framework.
* **Main Section at Root Level:**
* It contains the **`compilerOptions`** object, which holds all the rules and flags for the compiler.
* **Major Components inside `compilerOptions`:**
* **`target`**: Specifies the output JavaScript version (e.g., `"ES2022"`, `"ESNext"`).
* **`module`**: Defines the module system to use (e.g., `"NodeNext"`, `"ESNext"`).
* **`moduleResolution`**: Tells TypeScript how to locate and resolve imports (e.g., `"NodeNext"`).
* **`strict`**: The strictness switch (e.g., `true`); enforces strict type-checking, preventing issues like `implicit any` or missing `null` checks.
* **`baseUrl` & `paths**`: Configures custom path aliases (e.g., mapping `"@pages/*"` to `"src/pages/*"`), eliminating messy relative imports like `../../pages/LoginPage`.
* **`resolveJsonModule`**: Enables direct importing of external `.json` test data files into test specs without custom parsers.
* **File Scope Properties (Outside `compilerOptions`):**
* **`include`**: Specifies which folders to compile and check (e.g., `["src/**/*", "tests/**/*"]`).
* **`exclude`**: Skips unnecessary folders to speed up compilation (e.g., `["node_modules", "test-results"]`).
