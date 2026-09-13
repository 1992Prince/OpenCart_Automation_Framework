import { Page, Locator } from '@playwright/test';
import {BasePage} from '../pages/BasePage'

export class HomePage extends BasePage {

    // private locators
    private readonly logoutlink: Locator;
    private readonly headers: Locator;
    private readonly searchBox: Locator;
    private readonly searchIcon: Locator;

    // constructor
    constructor(page: Page){
        super(page);
        this.logoutlink = page.getByRole('link', {name: 'Logout'});
        this.headers = page.getByRole('heading', {level:2});
        this.searchBox = page.getByRole('textbox', {name: 'Search'});
        this.searchIcon = page.locator('#search button');
    }

    // page actions
    async getHomePageTitle(): Promise<string>{
        return await this.page.title();
    }

    async isLogoutLinkExists(): Promise<boolean>{
        return await this.logoutlink.isVisible();
    }

    async getHomePageHeaders(): Promise<string[]>{
        return await this.headers.allInnerTexts();
    }

    async doSearch(searchKey: string): Promise<void>{
        console.log(`search key: `, searchKey);
        await this.searchBox.fill(searchKey);
        await this.searchIcon.click();
    }

}