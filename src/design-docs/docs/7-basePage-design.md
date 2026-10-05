# BasePage Design in Playwright POM

## 1. What is BasePage?

* **BasePage is a parent class** in the Page Object Model (POM).
* It contains **common locators and common methods** that are used across multiple pages.
* All page classes can **extend BasePage** and reuse these common elements and functions.
* The main purpose is to **avoid duplicate code** and keep the framework maintainable.

### Simple Example

```text
BasePage
   │
   ├── LoginPage
   ├── HomePage
   ├── ProductPage
   └── CartPage
```

---

## 2. Why do all pages extend BasePage?

In most applications, some elements are common across many pages.

For example, in an e-commerce application:

* Logo
* Search box
* Search button
* Currency selector
* Cart button
* Footer links

Instead of defining these locators separately in every page, we define them **once in BasePage**.

```text
Without BasePage:

HomePage     → logo locator
ProductPage  → logo locator
CartPage     → logo locator
CheckoutPage → logo locator

          ↓

Duplicate code ❌
```

With BasePage:

```text
                 BasePage
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    HomePage    ProductPage   CartPage
```

All child pages can reuse the common locators and methods. ✅

---

# 3. What do we keep inside BasePage?

Generally, we keep **two types of things**:

### A. Common Locators

Locators that are available on multiple pages.

For example:

```typescript
protected readonly logo: Locator;
protected readonly searchBox: Locator;
protected readonly searchIcon: Locator;
protected readonly footerLinks: Locator;
protected readonly currency: Locator;
protected readonly cartBtn: Locator;
```

### B. Common Methods / Actions

Methods that can be used across multiple pages.

For example:

```typescript
isLogoVisible()
isSearchBoxVisible()
getPageFooters()
getPageTitle()
getPageCurrentURL()
waitForPageLoad()
takeScreenshot()
```

---

# 4. Why not define common locators in every Page class?

Because it creates **duplication**.

For example, if the logo is present on 10 pages, we don't want:

```typescript
// HomePage
logo = page.getByRole(...);

// ProductPage
logo = page.getByRole(...);

// CartPage
logo = page.getByRole(...);
```

Instead:

```typescript
// BasePage
protected readonly logo = page.getByRole(...);
```

Then every child page can use the same locator.

### Benefits

* Less duplicate code
* Easier maintenance
* Better reusability
* Changes need to be made in one place
* Cleaner Page Object classes

---

# 5. Why do we use `protected`?

We generally don't want common locators to be directly accessible from anywhere.

We use:

```typescript
protected readonly logo: Locator;
```

instead of:

```typescript
public readonly logo: Locator;
```

### `protected`

`protected` means:

> The variable can be accessed inside the BasePage and by classes that extend BasePage.

For example:

```typescript
export class HomePage extends BasePage {

    async checkLogo() {
        return await this.logo.isVisible();
    }
}
```

This is possible because `HomePage` extends `BasePage`.

```text
BasePage
   ↓
HomePage

HomePage can access protected members ✅
```

But an unrelated class should not directly access them.

### Why `readonly`?

```typescript
protected readonly logo: Locator;
```

`readonly` means the locator reference should not be reassigned after initialization.

This makes the class safer and prevents accidental reassignment.

---

# 6. Common Application Functionality

BasePage can contain common application-level functionality such as:

### Common UI elements

* Logo
* Search
* Navigation
* Footer
* Currency
* Cart
* Header

### Common actions

* Search
* Validate logo
* Get footer links
* Click common navigation
* Change currency
* Open cart

For example:

```typescript
async getPageFooters(): Promise<string[]> {
    return await this.footerLinks.allInnerTexts();
}
```

Now any page extending `BasePage` can use this functionality.

---

# 7. Generic Playwright Methods

BasePage can also contain **generic Playwright wrapper methods** that are not specific to one business page.

Examples:

```typescript
getPageTitle()
getPageCurrentURL()
waitForPageLoad()
takeScreenshot()
```

For example:

```typescript
async getPageTitle(): Promise<string> {
    return await this.page.title();
}

getPageCurrentURL(): string {
    return this.page.url();
}
```

These methods can be used from any page object.

---

# 8. BasePage vs Page-Specific Functionality

A simple rule:

### BasePage → Common functionality

```text
Logo
Search
Footer
Header
Cart
Currency
Page title
Current URL
Screenshot
Page load
```

### Individual Page → Page-specific functionality

For example, `LoginPage`:

```text
Username
Password
Login button
Forgot password
Login()
```

`ProductPage`:

```text
Product name
Product price
Add to cart
Product details
```

`CheckoutPage`:

```text
Address
Payment method
Place order
Order confirmation
```

---

# 9. BasePage in POM Architecture

A typical framework structure can look like:

```text
Tests
  ↓
Page Objects
  ↓
BasePage
  ↓
Playwright
```

Example:

```text
Tests
 │
 ├── LoginTest
 ├── ProductTest
 └── CheckoutTest
       │
       ↓
 Page Objects
 │
 ├── LoginPage
 ├── ProductPage
 └── CheckoutPage
       │
       ↓
    BasePage
       │
       ↓
   Playwright API
```

This creates a **reusable and maintainable architecture**.

---

# 10. Key Interview Answer ⭐

> **BasePage is the parent class in our Page Object Model. We keep common locators and common functionalities that are used across multiple pages, such as logo, search, footer, cart, currency, page title, URL, screenshot and page-load methods.**
>
> **All page classes extend BasePage so they can reuse these common elements instead of defining the same locators and methods repeatedly. This reduces code duplication and makes the framework easier to maintain.**
>
> **We generally keep these members as `protected` so they are accessible to the BasePage and its child page classes, but are not exposed unnecessarily to unrelated classes.**

### One-line definition to remember

> **BasePage is a reusable parent class that centralizes common locators and generic page-level functionality for all Page Objects.**
