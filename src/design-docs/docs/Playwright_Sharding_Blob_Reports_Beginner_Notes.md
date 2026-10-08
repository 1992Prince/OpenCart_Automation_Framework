# Playwright Sharding & Blob Reports — Beginner-Friendly Notes

## 1. What is Sharding?

**Sharding means distributing tests across multiple machines/boxes.**

By default, Playwright runs test files in parallel and tries to make good use of the CPU cores available on the machine. To achieve greater parallelization, Playwright can run tests on multiple machines simultaneously. This mode is called **sharding**.

In simple words:

> **Sharding = splitting the complete test suite into smaller parts called shards so that the parts can run independently and reduce the overall test runtime.**

Each shard can run as a separate job.

---

## 2. Simple Example — 52 Test Cases

Suppose you have:

```text
52 Test Cases
```

and want to run them across:

```text
4 different machines / boxes
```

Conceptually:

```text
52 Test Cases
      |
      v
  Playwright
      |
      +--> Shard 1 -> ~13 tests
      +--> Shard 2 -> ~13 tests
      +--> Shard 3 -> ~13 tests
      +--> Shard 4 -> ~13 tests
```

Basic calculation:

```text
52 / 4 = 13
```

So, conceptually, each box handles around 13 tests.

> **Important:** Playwright automatically distributes the tests. You specify the number of shards, but you do not manually assign individual test cases to specific boxes.

---

## 3. Sharding Command

Use:

```bash
npx playwright test --shard=x/y
```

For 4 shards:

```bash
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

Meaning:

- `1/4` = Shard 1 of 4
- `2/4` = Shard 2 of 4
- `3/4` = Shard 3 of 4
- `4/4` = Shard 4 of 4

---

## 4. What Happens Inside Each Machine?

Each machine/box has its own:

- CPU
- Memory
- Processes
- Workers

These resources are used to execute the tests assigned to that shard.

```text
Machine 1 -> Shard 1
Machine 2 -> Shard 2
Machine 3 -> Shard 3
Machine 4 -> Shard 4
```

The four shards can run **in parallel**.

---

## 5. Sharding + Playwright Workers

Sharding and workers are two different levels of parallelization.

If `fullyParallel: true` is enabled, tests within a shard can also run in parallel according to the workers/CPU resources available on that machine.

Conceptually:

```text
                    4 MACHINES
                         |
        +----------------+----------------+
        |                |                |
     Shard 1          Shard 2          Shard 3       Shard 4
        |                |                |             |
        v                v                v             v
    Workers           Workers          Workers       Workers
        |                |                |             |
        v                v                v             v
   Parallel Tests    Parallel Tests   Parallel Tests  Parallel Tests
```

So:

> **Sharding provides parallelization across machines, while workers provide parallelization within each machine.**

At shard level, you can still have multiple workers because a shard is simply the portion of the test suite being executed on a machine/job.

---

## 6. Can We Choose Which Test Goes to Which Shard?

**No.**

Playwright automatically distributes the tests among the configured shards.

For example, you cannot manually specify:

```text
TC1 -> Shard 1
TC2 -> Shard 2
TC3 -> Shard 3
```

Instead, you specify:

```bash
npx playwright test --shard=1/4
```

and Playwright determines the tests belonging to that shard.

```text
X Test Cases
     |
     v
 Playwright
     |
     +--> Shard 1 -> automatically assigned tests
     +--> Shard 2 -> automatically assigned tests
     +--> Shard 3 -> automatically assigned tests
     +--> Shard 4 -> automatically assigned tests
```

---

## 7. How to See Which Tests Belong to Each Shard

You can list the tests for a shard **without executing them** by using `--list`.

### Shard 1

```bash
npx playwright test --shard=1/4 --list
```

### Shard 2

```bash
npx playwright test --shard=2/4 --list
```

### Shard 3

```bash
npx playwright test --shard=3/4 --list
```

### Shard 4

```bash
npx playwright test --shard=4/4 --list
```

This is useful when you want to see which tests Playwright has assigned to each shard.

### Example

```text
PS D:\git\OpenCart_Automation_Framework> npx playwright test --shard=1/4 --list

Running tests on Environment: qa
injected env from src\config\.env.qa

Listing tests:

[chromium] › opencart-api-tests\01-api-demo.spec.ts:30:1 › Get Users Test
[chromium] › opencart-api-tests\01-api-demo.spec.ts:45:1 › Create User Test
[chromium] › opencart-api-tests\01-api-demo.spec.ts:63:1 › Fetch User Test
[chromium] › opencart-api-tests\01-api-demo.spec.ts:79:1 › Delete User Test
[chromium] › opencart-api-tests\02-crud.spec.ts:15:6 › Get Users Test
[chromium] › opencart-api-tests\02-crud.spec.ts:24:1 › Create User E2E Test
[chromium] › opencart-api-tests\03-create-user-schema-valid.spec.ts:100:1 › Get User-Schema Test1
[chromium] › opencart-api-tests\03-create-user-schema-valid.spec.ts:118:1 › Get User-Schema Test2
[chromium] › opencart-api-tests\04-api-mocking-demo.spec.ts:3:6 › intercept all backgroud api calls test
[chromium] › opencart-api-tests\04-api-mocking-demo.spec.ts:17:1 › mock search data api
[chromium] › opencart-ui-tests\faker-demo.spec.ts:5:1 › faker test demo

Total: 11 tests in 5 files
```

---

## 8. Running Sharding Locally

To run a shard locally:

```bash
npx playwright test --shard=1/4
```

Similarly:

```bash
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

> **Important:** Running all four commands one after another on the same machine is useful for understanding and demonstrating the concept, but it is **not the real-world purpose of sharding**. The real benefit comes when the shards execute simultaneously on different machines/runners.

---

## 9. Blob Reporter — Why Do We Need It?

When multiple shards execute separately, each shard produces its own test results.

The challenge is:

> **How do we combine the results from all shards into one report?**

For this, Playwright provides the **Blob reporter**.

A Blob report contains information about:

- Tests that were executed
- Test results
- Test attachments
- Traces
- Screenshot diffs

Blob reports can be merged and converted into another Playwright report.

By default, the Blob report is generated in:

```text
blob-report/
```

---

## 10. Reporter Configuration

A useful configuration for this setup is:

```ts
reporter: process.env.CI
  ? [
      ['html', {
        outputFolder: 'playwright-report',
        open: 'never'
      }]
    ]
  : [
      ['html', {
        outputFolder: 'playwright-report',
        open: 'always'
      }],
      ['blob', {
        outputDir: 'blob-report'
      }]
    ],
```

### Local Execution

When running locally:

```text
HTML Reporter
+
Blob Reporter
```

Reports are generated in:

```text
playwright-report/
blob-report/
```

### CI Execution

When running in CI:

```text
HTML Reporter only
```

The HTML report is generated in:

```text
playwright-report/
```

---

# 11. Playwright Sharding with Blob Reports — Local Execution

Suppose you have **X test cases** and want to distribute them across **4 shards/boxes**.

We will demonstrate the process locally.

## Step 1 — Run Shard 1

Run:

```bash
npx playwright test --shard=1/4
```

Playwright executes the tests assigned to Shard 1.

The Blob report is generated in:

```text
blob-report/
```

For example:

```text
blob-report/
└── report-1.zip
```

### Rename the folder

Rename:

```text
blob-report
```

to:

```text
blob-report-1
```

### Why rename it?

The next shard execution will again generate/use the `blob-report` folder.

Therefore, preserve the previous Blob report before running the next shard.

---

## Step 2 — Run Shard 2

Run:

```bash
npx playwright test --shard=2/4
```

A new:

```text
blob-report/
```

will be generated.

Rename it:

```text
blob-report -> blob-report-2
```

---

## Step 3 — Run Shard 3

Run:

```bash
npx playwright test --shard=3/4
```

After execution:

```text
blob-report/
```

will be generated.

Rename it:

```text
blob-report -> blob-report-3
```

---

## Step 4 — Run Shard 4

Run:

```bash
npx playwright test --shard=4/4
```

After execution:

```text
blob-report/
```

will be generated.

Rename it:

```text
blob-report -> blob-report-4
```

---

# 12. Final Folder Structure After Running All 4 Shards

At this point:

```text
Project
│
├── blob-report-1/
│   └── report-1.zip
│
├── blob-report-2/
│   └── report-2.zip
│
├── blob-report-3/
│   └── report-3.zip
│
└── blob-report-4/
    └── report-4.zip
```

---

# 13. Create a Common Blob Reports Folder

Create a new folder:

```text
blob-reports/
```

Take the ZIP file from each shard folder and put all four ZIP files inside this folder.

Final structure:

```text
blob-reports/
├── report-1.zip
├── report-2.zip
├── report-3.zip
└── report-4.zip
```

So the project becomes:

```text
Project
│
├── blob-report-1/
│   └── report-1.zip
│
├── blob-report-2/
│   └── report-2.zip
│
├── blob-report-3/
│   └── report-3.zip
│
├── blob-report-4/
│   └── report-4.zip
│
└── blob-reports/
    ├── report-1.zip
    ├── report-2.zip
    ├── report-3.zip
    └── report-4.zip
```

---

# 14. Merge All 4 Blob Reports

Run:

```bash
npx playwright merge-reports --reporter=html blob-reports
```

Playwright reads the Blob reports from:

```text
blob-reports/
```

and merges the results from all four shards into **one combined HTML report**.

Example command output:

```text
PS D:\git\OpenCart_Automation_Framework> npx playwright merge-reports --reporter=html blob-reports

merging reports from D:\git\OpenCart_Automation_Framework\blob-reports
extracting: blob-reports\report-1.zip
extracting: blob-reports\report-2.zip
extracting: blob-reports\report-3.zip
extracting: blob-reports\report-4.zip
merging events
processing test events
building final report
finished building report
```

---

# 15. Where Will the Final HTML Report Be Generated?

Because the HTML reporter is configured with:

```ts
outputFolder: 'playwright-report'
```

the final combined HTML report will be generated inside:

```text
playwright-report/
```

Conceptually:

```text
4 Shard Reports
      |
      +--> report-1.zip
      +--> report-2.zip
      +--> report-3.zip
      +--> report-4.zip
              |
              v
npx playwright merge-reports --reporter=html blob-reports
              |
              v
      playwright-report/
              |
              +--> index.html
```

You can open the merged report using:

```bash
npx playwright show-report
```

The report contains the consolidated results from all four shards.

---

# 16. Important — Local Execution vs Real CI Use Case

The local process above is mainly for **understanding and demonstrating the sharding concept**.

Locally, when all four commands are run one after another:

```text
Shard 1 → execute
      ↓
Shard 2 → execute
      ↓
Shard 3 → execute
      ↓
Shard 4 → execute
      ↓
Merge reports
```

the execution is **sequential** because all four shards are being run on one machine.

This does not provide the full performance benefit of sharding.

---

# 17. Real-World Use Case — CI

Sharding is primarily useful when the test suite is distributed across multiple CI runners/machines.

For example:

```text
                    CI Pipeline
                         |
              +----------+----------+
              |          |          |
              v          v          v
           Runner 1   Runner 2   Runner 3   Runner 4
           Shard 1    Shard 2    Shard 3    Shard 4
              |          |          |          |
              +----------+----------+----------+
                         |
                         v
                   Merge Reports
                         |
                         v
                  One HTML Report
```

The runners can be Ubuntu-based machines/runners, and execution can also be performed using Docker containers.

The important point is:

> **In the real CI use case, the shards execute in parallel rather than sequentially.**

This is where sharding provides a significant reduction in overall execution time.

---

# 18. How Sharding Helps Reduce Long Execution Time

## Problem

Suppose your automation suite takes several hours to execute on one machine.

Playwright already provides parallel execution through workers and `fullyParallel`.

For example:

```text
One Machine
     |
     +--> Worker 1
     +--> Worker 2
     +--> Worker 3
     +--> Worker 4
```

Tests can run in parallel according to the CPU cores/resources available on the machine.

## Need More Speed?

If you still need to reduce execution time, you can leverage **sharding**.

Instead of:

```text
All Tests
   |
   v
One Machine
```

you can distribute them across multiple machines:

```text
                  All Tests
                      |
        +-------------+-------------+
        v             v             v
     Shard 1       Shard 2       Shard 3       Shard 4
     Machine 1     Machine 2     Machine 3     Machine 4
        |             |             |             |
        v             v             v             v
     Workers       Workers       Workers       Workers
```

Therefore:

> **Workers/`fullyParallel` help you use the resources of one machine efficiently. Sharding lets you scale execution across multiple machines.**

---

# 19. Quick Revision

| Concept | Meaning |
|---|---|
| **Worker** | Parallel process used by Playwright on a machine |
| **`fullyParallel: true`** | Allows tests to run in parallel according to Playwright's parallel execution model |
| **Shard** | A portion of the complete test suite |
| **Sharding** | Distributing the test suite across multiple machines/runners |
| **`--shard=1/4`** | Execute Shard 1 out of 4 |
| **`--list`** | List tests without executing them |
| **Blob Reporter** | Stores test results and attachments in a mergeable format |
| **`merge-reports`** | Combines Blob reports into a final Playwright report |
| **`playwright-report`** | HTML report output folder configured in the reporter |

---

# 20. Interview Answer — What Is Sharding?

> **“Playwright sharding is a mechanism to distribute a large test suite across multiple machines or CI runners. For example, if I have 52 test cases and want to use four machines, I can run the suite with `--shard=1/4` through `4/4`. Playwright automatically distributes the tests among the four shards. Each machine can also use multiple workers for parallel execution. The shard reports can then be collected as Blob reports and merged into one consolidated HTML report. Sharding is especially useful in CI because all shards can execute in parallel and significantly reduce the overall execution time.”**

---

# 21. Key Takeaways ⭐

1. **Sharding = distributing tests across multiple machines/runners.**
2. Playwright automatically distributes tests between shards.
3. You specify the **number of shards**, not the individual test-to-shard mapping.
4. Use:
   ```bash
   npx playwright test --shard=1/4
   ```
   for the first of four shards.
5. Use `--list` to see which tests are assigned to a shard without executing them.
6. Workers provide parallelism **within a machine**.
7. Sharding provides parallelism **across machines**.
8. Blob reports are useful for collecting results from individual shards.
9. The four Blob reports can be merged using:
   ```bash
   npx playwright merge-reports --reporter=html blob-reports
   ```
10. The final HTML report is generated in `playwright-report` when that is the configured HTML reporter output folder.
11. Running shards sequentially on one local machine is mainly a **learning/demo approach**.
12. The real benefit of sharding comes when shards run **in parallel on multiple CI runners/machines**.
