# Error Handling

## Q: What is Error Handling, and have you implemented it in your framework?

### Answer — Interview Speaking Style

- **Error handling means handling unexpected problems in a controlled and readable way instead of showing a confusing technical error.**
- Yes, I have implemented basic error handling in my framework, mainly in utility/helper classes.
- For example, we have a **test data utility** that reads data from a JSON file.
- If a new team member provides an incorrect file name or file path, Node.js can throw a technical error.
- To handle this, we use **`try/catch`** where we need to catch the technical error and provide a more **human-readable error message**.
- For example, instead of showing only a low-level file error, we can show:

```text
JSON file not found:
C:\project\test-data\users.json
```

- This makes it easier for the team member to understand what went wrong and fix the file path.

### Example

```ts
import fs from 'fs';
import path from 'path';

export class JsonHelper {

    static load(filePath: string): Record<string, any[]> {

        const fullPath = path.resolve(process.cwd(), filePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(
                `JSON file not found: ${fullPath}`
            );
        }

        try {
            const fileContent = fs.readFileSync(fullPath, 'utf-8');

            return JSON.parse(fileContent);

        } catch (error) {
            throw new Error(
                `Invalid JSON file: ${fullPath}`
            );
        }
    }
}
```

### Important Point

- I don't use `try/catch` everywhere unnecessarily.
- I use it where I want to **handle an error and provide additional information or a better error message**.
- For example, for API requests, Playwright already provides a useful failure and stack trace when the request itself fails.
- In that case, I can allow the error to propagate naturally instead of catching it just to throw the same error again.

### Short Interview Answer

> **"Error handling means handling unexpected errors in a controlled and meaningful way. Yes, I have implemented basic error handling in my framework, mainly in utility classes. For example, our JSON test-data utility expects a file path. If a new team member provides an incorrect path, we use try-catch to handle the error and provide a human-readable message like 'JSON file not found: <path>'. This helps the team quickly understand and fix the issue. I don't use try-catch everywhere; I use it where I need to handle the error or provide a more meaningful message."**