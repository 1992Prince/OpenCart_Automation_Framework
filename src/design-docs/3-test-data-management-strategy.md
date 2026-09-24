# JSON Test Data Strategy in Our Framework

## 1. Records in TypeScript

- `Record` is a TypeScript utility type used to define the **type of keys and values in an object**.
- In Java, a similar concept is `Map<K, V>`, where we explicitly define the key and value types.
- In JavaScript, object properties are generally stored with **string or Symbol keys at runtime**.
- Therefore, for practical use, it is usually clearer to use a **string key** in `Record` and define the required type for the values.

### Syntax

```ts
Record<KeyType, ValueType>
```

---

## 2. Basic `Record` Example – Employees

Suppose we want to maintain multiple employees where:

- Employee ID → `string`
- Employee Name → `string`

```ts
const employees: Record<string, string> = {
    "101": "Prince",
    "102": "Rahul",
    "103": "Sunny"
};
```

Here:

- `string` → type of the key
- `string` → type of the value

So:

```ts
console.log(employees["101"]); // Prince
console.log(employees["102"]); // Rahul
```

---

## 3. Another `Record` Example – Student Marks

Suppose we want to store students' marks where:

- Roll Number → `string`
- Marks → `number`

```ts
const studentMarks: Record<string, number> = {
    "101": 85,
    "102": 92,
    "103": 78
};
```

Here:

```text
Record<string, number>
       ↓        ↓
      Key     Value
       ↓        ↓
   Roll No.    Marks
```

---

# 4. `Record<string, any>`

```ts
Record<string, any>
```

means:

> An object where the **keys are strings** and the **values can be of any type**.

### Example

```ts
const data: Record<string, any> = {
    name: "Prince",
    age: 30,
    isActive: true,
    marks: [80, 90, 95],
    address: {
        city: "Agra"
    }
};
```

Here all keys are strings, but the values can be anything:

```text
"name"     → string
"age"      → number
"isActive" → boolean
"marks"    → array
"address"  → object
```

So:

```text
Record<string, any>
       ↓       ↓
      Key    Value
       ↓       ↓
    string     any
```

---

# 5. `Record<string, any[]>`

Now suppose we specifically want the **value of every key to always be an array**.

```ts
Record<string, any[]>
```

means:

> An object where the **keys are strings** and the **value of every key is an array**.

The important difference is:

```text
Record<string, any>
              ↓
       value can be anything


Record<string, any[]>
               ↓
       value must be an array
```

### Example

```ts
const data: Record<string, any[]> = {
    names: ["Prince", "Rahul", "Sunny"],

    marks: [80, 90, 95],

    users: [
        { id: 101, name: "Prince" },
        { id: 102, name: "Rahul" }
    ]
};
```

Here:

```text
Key        → Value
-------------------------------
names      → array of strings
marks      → array of numbers
users      → array of objects
```

`any[]` means an **array containing any type of data**. The actual arrays in our framework contain JSON test-data objects. :chatgpt-content-reference{index="0"}

---

# 6. Structure of Our Test-Data JSON

Our framework uses a JSON file specifically for storing test data.

The structure is:

- The **root level is a JSON object**.
- The **keys are strings**.
- These keys represent the **test names used in the spec files**.
- The **value of each test name is a JSON array**.
- The JSON array can contain:
  - **One JSON object** → when the test requires a single test-data set.
  - **Multiple JSON objects** → when the same test needs to run with multiple test-data sets. :chatgpt-content-reference{index="1"}

### Example

```json
{
  "shouldLoginSuccessfully": [
    {
      "description": "Standard User Login",
      "username": "pwapril@pw.com",
      "password": "pw123",
      "expectedRole": "USER"
    }
  ],

  "shouldFailLoginWithInvalidCredentials": [
    {
      "description": "Invalid password",
      "username": "standard_user",
      "password": "wrong_password",
      "expectedError": "Invalid credentials"
    },

    {
      "description": "Locked-out account",
      "username": "locked_user",
      "password": "secret_password",
      "expectedError": "User account is locked"
    },

    {
      "description": "Non-existent user",
      "username": "ghost_user",
      "password": "secret_password",
      "expectedError": "User does not exist"
    }
  ]
}
```

So the overall structure is:

```text
Record<string, any[]>
       ↓       ↓
      Key    Value
       ↓       ↓
 Test Name  Array of Test Data
```

For example:

```text
"shouldLoginSuccessfully"
            ↓
       JSON Array
            ↓
     One JSON Object
```

Whereas:

```text
"shouldFailLoginWithInvalidCredentials"
            ↓
       JSON Array
            ↓
   ┌────────┼────────┐
   ↓        ↓        ↓
Object   Object   Object
```

The reason we use `any[]` is that different tests can have different test-data fields. :chatgpt-content-reference{index="2"}

---

# 7. `JsonHelper` Utility

To read this JSON test data, we create a common **`JsonHelper` utility class**.

Instead of writing file-reading and JSON-parsing logic in every spec file, we keep it in one reusable utility.

```ts
import fs from 'fs';
import path from 'path';

export class JsonHelper {

    // Reads the JSON file once and returns an object
    static load(filePath: string): Record<string, any[]> {

        const fullPath = path.resolve(
            process.cwd(),
            filePath
        );

        return JSON.parse(
            fs.readFileSync(fullPath, 'utf-8')
        );
    }
}
```

The method has the return type:

```ts
Record<string, any[]>
```

which tells TypeScript:

> This JSON file returns an object where each test name is a string key and its corresponding test data is an array. :chatgpt-content-reference{index="3"}

---

# 8. How `JsonHelper` Works Technically

## Step 1 – Export the `JsonHelper` Class

We export the class so that it can be reused across different spec files.

```ts
export class JsonHelper {
```

Because it is a class, we can put reusable methods inside it.

---

## Step 2 – Create a Static `load()` Method

```ts
static load(filePath: string): Record<string, any[]>
```

The `load()` method:

- Is **static**, so we can call it directly using the class name.
- Does not require us to create an object of `JsonHelper`.
- Accepts the JSON file path as a parameter.
- Returns the JSON data in the expected `Record<string, any[]>` structure.

For example:

```ts
JsonHelper.load('src/testsData/loginData.json');
```

---

## Step 3 – Resolve the Full File Path

Inside the method:

```ts
const fullPath = path.resolve(process.cwd(), filePath);
```

Here:

- `process.cwd()` gets the **current working directory** from where the Node.js process is running.
- `filePath` is the relative JSON file path passed to the method.
- `path.resolve()` combines these and creates the **absolute/full path** of the JSON file.
- This full path is then passed to the file-system operation. :chatgpt-content-reference{index="4"}

---

## Step 4 – Read the JSON File

We use Node.js's built-in **File System (`fs`) module**:

```ts
fs.readFileSync(fullPath, 'utf-8')
```

`readFileSync()`:

- Reads the file **synchronously**.
- Accepts the full file path.
- `'utf-8'` tells Node.js to read the file as text/string.
- Therefore, at this stage, the JSON file content is returned as a **JSON-formatted string**. :chatgpt-content-reference{index="5"}

For example, the JSON file:

```json
{
  "users": [
    {
      "name": "Prince"
    }
  ]
}
```

is initially read approximately as:

```text
'{"users":[{"name":"Prince"}]}'
```

---

## Step 5 – Convert JSON String into JavaScript Object

Next, we use:

```ts
JSON.parse(
    fs.readFileSync(fullPath, 'utf-8')
)
```

`JSON.parse()`:

- Takes the JSON string.
- Converts it into a **JavaScript value/object**.
- After parsing, we can access its properties using normal JavaScript object and array syntax.

For example:

```ts
data.users[0].name
```

can be used after parsing. :chatgpt-content-reference{index="6"}

---

## Step 6 – Return the Parsed Data

Our method declares:

```ts
static load(filePath: string): Record<string, any[]>
```

So the method is declared to return:

```ts
Record<string, any[]>
```

which represents:

```text
String Key → Array Value
```

And specifically in our framework:

```text
Test Name → Array of Test Data Objects
```

:chatgpt-content-reference{index="7"}

### Important Technical Point

`JSON.parse()` performs the actual runtime conversion:

```text
JSON String
    ↓
JavaScript Object
```

`Record<string, any[]>` is the **TypeScript return-type contract** that tells TypeScript how we expect the parsed object to be structured.

TypeScript does **not** perform the runtime conversion into a `Record`. :chatgpt-content-reference{index="8"}

---

# 9. Import `JsonHelper` in the Spec File

Since our utility is exported as:

```ts
export class JsonHelper {
```

it is a **named export**.

In the spec file, we import it using destructuring syntax:

```ts
import { JsonHelper } from '../utils/JsonHelper';
```

The `{ JsonHelper }` syntax is used to import/destructure the named export from the module.

The name inside `{ }` should match the exported class name.

Because `load()` is static, we can directly call it using the imported class name without creating an object:

```ts
JsonHelper.load(...)
```

:chatgpt-content-reference{index="9"}

---

# 10. Load the JSON Test Data in the Spec

In our spec file:

```ts
let testData: Record<string, any[]> =
    JsonHelper.load('src/testsData/loginData2.json');
```

Here:

```text
testData
   ↓
Record<string, any[]>
   ↓
Test Name → JSON Array
```

The JSON file is loaded once, and its parsed data is kept in memory.

We can then retrieve the required test data from `testData` when needed. :chatgpt-content-reference{index="10"}

---

# 11. Execute a Test With Single Test Data

Suppose the JSON contains:

```json
{
  "shouldLoginSuccessfully": [
    {
      "description": "Standard User Login",
      "username": "pwapril@pw.com",
      "password": "pw123",
      "expectedRole": "USER"
    }
  ]
}
```

There is only **one test-data object** inside the array.

We retrieve it using:

```ts
let loginSuccessData =
    testData.shouldLoginSuccessfully[0];
```

### What happens here?

First:

```ts
testData.shouldLoginSuccessfully
```

returns the JSON array:

```text
[
    {
        description: "...",
        username: "...",
        password: "...",
        expectedRole: "USER"
    }
]
```

Then:

```ts
[0]
```

returns the **first JSON object** from that array.

Therefore:

```ts
loginSuccessData
```

is now the first JSON object.

We can directly access its properties:

```ts
loginSuccessData.username
loginSuccessData.password
loginSuccessData.expectedRole
```

:chatgpt-content-reference{index="11"}

### Example

```ts
let testData: Record<string, any[]> =
    JsonHelper.load('src/testsData/loginData2.json');

let loginSuccessData =
    testData.shouldLoginSuccessfully[0];

test.skip(`Login Successful Test from json`, async ({ loginPage, page }) => {

    console.log(
        `${loginSuccessData.username} and ${loginSuccessData.password}`
    );

    await loginPage.doLogin(
        loginSuccessData.username,
        loginSuccessData.password
    );

    await page.waitForTimeout(2000);
});
```

If we want the **second JSON object** from the array:

```ts
let loginSuccessData =
    testData.shouldLoginSuccessfully[1];
```

So:

```text
[0] → First JSON object
[1] → Second JSON object
[2] → Third JSON object
```

---

# 12. Execute a Test With Multiple Test Data – Data-Driven Testing

Now suppose the test requires multiple test-data objects:

```text
shouldFailLoginWithInvalidCredentials
              ↓
          JSON Array
              ↓
      Multiple Objects
```

Instead of individually accessing:

```ts
[0]
[1]
[2]
```

we retrieve the complete JSON array:

```ts
let loginUnsuccessfulData =
    testData.shouldFailLoginWithInvalidCredentials;
```

Now:

```ts
loginUnsuccessfulData
```

is a **JSON array**.

Because it is an array, we can iterate over it.

```ts
for (let data of loginUnsuccessfulData) {

    test.only(
        `Login Test from json ${data.description}`,
        async ({ loginPage, page }) => {

            console.log(
                `${data.username} and ${data.password}`
            );

            await loginPage.doLogin(
                data.username,
                data.password
            );

            await page.waitForTimeout(2000);
        }
    );
}
```

Here:

```ts
data
```

represents **one JSON object at a time**.

For example:

```text
First iteration
    ↓
Invalid password object

Second iteration
    ↓
Locked-out account object

Third iteration
    ↓
Non-existent user object
```

Therefore, the same test logic can be executed with multiple sets of test data. :chatgpt-content-reference{index="12"}

---

# 13. Our Complete Framework Strategy

The complete strategy is:

```text
Maintain JSON Test Data
        ↓
Separate test data from test/spec code
        ↓
Create JsonHelper utility
        ↓
Import JsonHelper in the spec
        ↓
JsonHelper.load(filePath)
        ↓
Resolve full file path
        ↓
Read JSON using fs.readFileSync()
        ↓
JSON string
        ↓
JSON.parse()
        ↓
JavaScript object
        ↓
Record<string, any[]>
        ↓
Keep parsed test data in memory
        ↓
Spec retrieves data using Test Name
        ↓
        ┌────────────────────────────┐
        │ Single Test Data           │
        │                            │
        │ testName[0]                │
        │       ↓                    │
        │ First JSON Object          │
        └────────────────────────────┘

                 OR

        ┌────────────────────────────┐
        │ Multiple Test Data         │
        │                            │
        │ testName                   │
        │       ↓                    │
        │ JSON Array                 │
        │       ↓                    │
        │ for...of                   │
        │       ↓                    │
        │ Multiple Test Executions   │
        └────────────────────────────┘
```

## Conclusion

In our framework, we maintain **JSON test data for each spec/test area**. The `JsonHelper` utility provides a reusable way to load that JSON file. Its `load()` method resolves the file path, reads the file using Node.js `fs`, converts the JSON string into a JavaScript object using `JSON.parse()`, and declares the expected structure as `Record<string, any[]>`.

At runtime, the spec retrieves the required **JSON array using the test name**. If the test requires a single data set, we access the required JSON object using its array index. If the test requires multiple data sets, we iterate over the JSON array and create separate test executions for each data set.

So the overall framework approach is:

> **Maintain JSON test data → load it once through `JsonHelper` → keep it in memory as `Record<string, any[]>` → retrieve data using the test name → use one object for a single-data test or iterate the array for Data-Driven Testing.** :chatgpt-content-reference{index="13"}