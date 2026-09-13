import {test as baseTest, Page} from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { BasePage } from '../pages/BasePage'
import { HomePage } from '../pages/HomePage'
import { SearchResultsPage } from '../pages/SearchResultsPage'
import { ProductInfoPage } from '../pages/ProductInfoPage'

type pageFixtures = {
    basePage: BasePage,
    loginPage: LoginPage,
    homePage: HomePage,
    searchResultsPage: SearchResultsPage,
    productInfoPage: ProductInfoPage
}

// extend the playwright test: using baseTest.extend: inheritance concept
// use is default export that comes from pw test module
export let test = baseTest.extend<pageFixtures>({
    basePage: async ({page}, use) => {
        let basePage = new BasePage(page);
        await use(basePage);
    },
    loginPage: async ({page}, use) => {
        let loginPage = new LoginPage(page);
        await use(loginPage);
    },
    homePage: async ({page}, use) => {
        let homePage = new HomePage(page);
        await use(homePage);
    },
    searchResultsPage: async ({page}, use) => {
        let searchResultsPage = new SearchResultsPage(page);
        await use(searchResultsPage);
    },
    productInfoPage: async ({page}, use) => {
        let productInfoPage = new ProductInfoPage(page);
        await use(productInfoPage);
    },
})

export {expect} from '@playwright/test'