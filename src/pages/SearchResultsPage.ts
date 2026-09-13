import { Page, Locator } from '@playwright/test';
import {BasePage} from '../pages/BasePage'

export class SearchResultsPage extends BasePage {

    private readonly searchResults: Locator;

    constructor(page: Page){
        super(page);
        this.searchResults = page.locator('div.product-layout');
    }

    // page actions methods/behaviours
    async getProductSearchResultsCount(): Promise<number>{
        return await this.searchResults.count();
    }

    // below is an example of dynamic locator
    async selectProduct(productName: string): Promise<void>{
        console.log(`Product name: ${productName}`);
        await this.page.waitForTimeout(3000);
        this.page.getByRole('link', {name: productName, exact:true}).first().click();
    }

}