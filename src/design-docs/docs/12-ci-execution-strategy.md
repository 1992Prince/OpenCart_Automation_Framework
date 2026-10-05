# Playwright TypeScript – CI/CD Execution Strategy

## 1. Overall Execution Strategy

We have **100+ E2E automation scripts** covering the complete customer journey, from customer registration up to billing and invoice generation.

Since these are complete E2E UI scenarios, executing all tests takes significant time. Therefore, we **do not execute all scenarios for every run**.

Instead, we categorize and tag our tests based on their purpose.

### Our main test categories

| Tag                | Purpose                                        | Execution                            |
| ------------------ | ---------------------------------------------- | ------------------------------------ |
| `@smoke`           | High-level validation that the build is stable | Before regression / after deployment |
| `@regression`      | Complete E2E regression coverage               | During every release                 |
| `@producttestdata` | Generate required customer/product test data   | On demand                            |
| `@healthcheck`     | Check application/service health               | Scheduled daily                      |
| `@appsanity`       | Narrow sanity tests for a specific application | Triggered by application teams       |

A test can also have **multiple tags**, depending on its purpose.

For example:

```text
@smoke @healthcheck
```

---

# 2. Why We Use Different Test Suites

The main reason is **execution time and purpose**.

For example, our complete customer journey can take approximately **30 minutes**, because it involves multiple applications and steps such as:

```text
Customer Creation
      ↓
Product Addition
      ↓
Product Configuration
      ↓
Site Visit / Feasibility
      ↓
Payment
      ↓
Billing
      ↓
Invoice
```

So instead of running the complete regression suite every time, we select the appropriate suite based on the requirement.

---

# 3. Typical Release Execution Flow

Our typical release execution is:

```text
Code deployed to lower environment
             ↓
        Smoke Tests
             ↓
     Is build stable?
        ↓          ↓
       Yes         No
        ↓          ↓
   Regression     Stop / Investigate
        ↓
   Test Results
```

### Smoke

Smoke tests provide a **quick high-level validation** that the environment/build is stable enough for further testing.

### Regression

Once smoke testing passes, we execute the complete regression scenarios tagged with:

```text
@regression
```

These cover the existing customer journeys and are executed as part of the release.

---

# 4. Making the Playwright Framework CI Ready

To make the framework suitable for CI execution, we configure Playwright differently for local and CI environments.

For example:

```typescript
retries: process.env.CI ? 1 : 0,
workers: process.env.CI ? 1 : '50%',
headless: process.env.CI ? true : false
```

So:

### Local execution

```text
Retries  → 0
Workers  → 50%
Browser  → Headed
```

### CI execution

```text
Retries  → 1
Workers  → 1
Browser  → Headless
```

The `CI` environment variable allows the same framework to automatically behave differently when running in GitHub Actions. 

---

# 5. Retry Strategy

We keep **only one retry in CI**.

```typescript
retries: 1
```

The reason is that we don't want multiple retries to hide genuine application or automation failures.

For example:

```text
Test fails
   ↓
Retry once
   ↓
Pass → Possible intermittent issue
Fail → Investigate actual failure
```

---

# 6. Failure Artifacts Configuration

We configure Playwright to capture debugging information mainly when a test fails or is retried.

Our configuration is:

```typescript
trace: 'on-first-retry',
screenshot: 'only-on-failure',
video: 'on-first-retry',
retries: 1
```

This means:

* **Screenshot** → captured when the test fails
* **Video** → captured on retry
* **Trace** → captured on retry
* **Retry** → maximum one retry

This avoids generating large amounts of unnecessary data for successful tests. 

---

# 7. What Artifacts Are Generated?

After execution, we mainly get two important folders:

```text
playwright-report/
test-results/
```

### `playwright-report/`

This contains the **HTML execution report**.

```text
playwright-report/
└── index.html
```

It provides:

* Passed tests
* Failed tests
* Skipped tests
* Execution duration
* Test steps
* Error/stack trace
* Screenshots
* Videos
* Trace information

So we can think of it as:

> **playwright-report = human-readable execution report**



---

# 8. `test-results/`

This folder contains **test-specific debugging artifacts**.

For example:

```text
test-results/
├── login-test/
│   ├── screenshot.png
│   ├── video.webm
│   └── trace.zip
└── homepage-test/
    └── ...
```

So:

> **test-results = evidence used to debug failures**

The report tells us **what failed**, while `test-results` helps us understand **why it failed**. 

---

# 9. GitHub Actions Workflows

Instead of putting everything into one workflow, we maintain **separate workflow YAML files** based on execution purpose.

For example:

```text
.github/workflows/

├── smoke.yml
├── regression.yml
├── apptestdata.yml
└── healthcheck.yml
```

### `smoke.yml`

Executes:

```text
@smoke
```

scenarios.

### `regression.yml`

Executes:

```text
@regression
```

scenarios during releases.

### `apptestdata.yml`

Executes:

```text
@producttestdata
```

scenarios on demand.

### `healthcheck.yml`

Executes:

```text
@healthcheck
```

scenarios on a scheduled basis.



---

# 10. Environment Selection

We also support execution against different environments.

For example, from GitHub Actions we can use:

```text
workflow_dispatch
```

and select the required environment from the **Actions tab**.

For example:

```text
Environment:
    QA
    Stage
    Dev
```

Once the environment is selected, the workflow uses the corresponding environment configuration and secrets.

```text
Select Environment
       ↓
Fetch Environment Secrets
       ↓
Run Playwright Tests
       ↓
Generate Reports
```

Our credentials, API client IDs and other sensitive configuration values are maintained using **GitHub repository/environment secrets**, rather than hardcoding them in the framework. 

---

# 11. Using Playwright Docker Image

For CI execution, we use the **official Playwright Docker image**.

This helps us avoid manually setting up:

```text
Node.js
Playwright
Browser binaries
Required dependencies
```

on the CI runner.

Conceptually:

```text
GitHub Actions Runner
        ↓
Playwright Docker Image
        ↓
Node + Playwright + Browsers
        ↓
Execute Tests
```

This makes the CI environment more consistent and reduces setup-related issues. 

---

# 12. Dependency and Browser Caching

We also use caching for dependencies and browser binaries.

The idea is:

```text
First Run
   ↓
Install dependencies + browsers
   ↓
Save Cache
```

Then:

```text
Next Run
   ↓
Restore Cache
   ↓
Avoid downloading everything again
   ↓
Start Tests Faster
```

If the `package.json` changes, the cache is updated because the dependency definition has changed.

The cache is saved only when the workflow completes successfully according to our current configuration. 

---

# 13. Uploading Artifacts to GitHub Actions

After Playwright execution, we upload both:

```text
playwright-report/
test-results/
```

as GitHub Actions artifacts.

The flow is:

```text
Playwright Execution
        ↓
playwright-report/
        ↓
test-results/
        ↓
Upload as GitHub Actions Artifacts
```

This means even after the workflow finishes, the team can access the generated reports and failure evidence from the workflow run. 

---

# 14. GitHub Pages Dashboard

We also publish the Playwright HTML report through **GitHub Pages**.

The flow is:

```text
Playwright Tests
       ↓
Generate index.html
       ↓
Generate playwright-report/
       ↓
Publish report to GitHub Pages
       ↓
Dashboard URL
```

The `index.html` becomes the entry point for the published Playwright report.

So instead of asking everyone to download the artifact, we can provide a **GitHub Pages link** where stakeholders can directly view the latest execution results. 

---

# 15. Email Notification

After execution, the workflow prepares a summary containing information such as:

```text
Total Tests
Passed
Failed
Skipped
Execution Status
Report Link
```

The report/dashboard link is then included in the email.

So the flow is:

```text
Test Execution
      ↓
Generate Report
      ↓
Publish to GitHub Pages
      ↓
Prepare Execution Summary
      ↓
Send Email
      ↓
User clicks Dashboard Link
      ↓
GitHub Pages Report
```

The email/SMTP credentials are maintained as GitHub Secrets. 

---

# 16. Slack Notification

Similarly, after execution we send a notification to the team's Slack channel.

The Slack message contains the execution summary and the GitHub Pages report link.

For example:

```text
Playwright Regression Execution

Environment: QA

Total:   120
Passed:  115
Failed:    3
Skipped:   2

View Detailed Report:
<GitHub Pages Link>
```

The team can click the report link and directly open the Playwright dashboard.

The Slack webhook is stored securely in GitHub Secrets. 

---

# 17. Complete CI Architecture

You can explain the complete strategy in an interview like this:

```text
                  GitHub Actions
                       │
              Select Environment
                       │
              Fetch Environment
                  Secrets
                       │
             Playwright Docker
                    Image
                       │
                Execute Tests
                       │
          ┌────────────┴────────────┐
          │                         │
   playwright-report/        test-results/
          │                         │
     HTML Report          Screenshots / Video /
          │                Trace / Error Context
          └────────────┬────────────┘
                       │
                Upload Artifacts
                       │
                 GitHub Pages
                       │
              Playwright Dashboard
                       │
              ┌────────┴────────┐
              │                 │
            Email             Slack
              │                 │
              └────────┬────────┘
                       │
                Report URL
                       │
              Team / Stakeholders
```

---

# 18. Our Complete Execution Strategy — Short Interview Answer

If the interviewer asks:

> **"Explain how your Playwright framework is integrated with GitHub Actions."**

You can say:

> "We have more than 100 E2E scenarios, so we don't execute everything for every run. We categorize our tests using tags such as smoke, regression, healthcheck and test-data generation.
>
> We have separate GitHub Actions workflows for these different execution purposes. For example, smoke runs before regression, regression runs as part of every release, health checks are scheduled daily, and test-data scenarios are triggered on demand.
>
> Our Playwright framework is CI-ready by using CI-specific configuration such as headless execution, one retry and controlled workers. We capture screenshots on failure and video and trace on retry.
>
> For CI execution, we use a Playwright Docker image so that Node, Playwright and browser dependencies are already available.
>
> After execution, Playwright generates two important outputs: `playwright-report`, which contains the HTML report, and `test-results`, which contains debugging artifacts such as screenshots, videos and traces. We upload both as GitHub Actions artifacts.
>
> We then publish the HTML report through GitHub Pages so the team gets a common dashboard URL. Finally, we send the execution summary and dashboard link through email and Slack. Environment-specific credentials are managed through GitHub Secrets, and the environment can be selected through workflow dispatch."

This is the **clean sequence** to remember:

```text
Test Tagging
    ↓
Separate Workflows
    ↓
Select Environment
    ↓
Fetch Secrets
    ↓
Playwright Docker
    ↓
Execute Tests
    ↓
Generate Reports + Failure Artifacts
    ↓
Upload GitHub Artifacts
    ↓
Publish HTML Report to GitHub Pages
    ↓
Generate Execution Summary
    ↓
Email + Slack Notification
    ↓
Team Opens Dashboard
```

That sequence is the most important part to memorize for your interview. It covers **strategy → CI readiness → execution → artifacts → dashboard → notifications** without getting lost in GitHub Actions YAML syntax.
