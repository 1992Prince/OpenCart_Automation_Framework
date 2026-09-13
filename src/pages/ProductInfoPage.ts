import { Page, Locator } from '@playwright/test';
import {BasePage} from '../pages/BasePage'

export class ProductInfoPage extends BasePage {

    private readonly header: Locator;
    private readonly productImages: Locator;

    constructor(page: Page){
        super(page);
        this.header = page.getByRole('heading', {level:1});
        this.productImages = page.locator('div#content li img');
    }

    // page actions methods/behaviours
    async getProductHeader(): Promise<string>{
        return await this.header.innerText();
    }

    async getProductImagesCount(): Promise<number>{
        await this.productImages.first().waitFor({state: 'visible'});
        return await this.productImages.count();
    }
    



}