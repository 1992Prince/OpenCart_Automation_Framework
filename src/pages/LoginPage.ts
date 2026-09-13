import {Page, Locator} from '@playwright/test'
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {


    // 1. private locators
    private readonly emailId: Locator;
    private readonly password: Locator;
    private readonly submitBtn: Locator;
    private readonly forgottenPasswordLink: Locator;
    private readonly loginErrorMsz: Locator;

    //2. constructor
    constructor(page: Page){
        super(page);
        this.emailId = page.getByRole('textbox', {name: 'E-Mail Address'});
        this.password = page.getByRole('textbox', {name: 'Password'});
        this.submitBtn = page.getByRole('button', {name: 'Login'});
        this.forgottenPasswordLink = page.getByRole('link', {name: 'Forgotten Password'}).first();
        this.loginErrorMsz = page.locator('.alert.alert-danger.alert-dismissible')
    }

    // 3. public page action/behaviour (methods) : Encapsulation
    // by default below methods are public
    // this.page is coming from BasePage

    async goToLoginPage(): Promise<void>{
        await this.page.goto('opencart/index.php?route=account/login');
    }

    async getLoginPageTitle(): Promise<string>{
        return await this.page.title();
    }

    async isForgottenPasswordLinkExists(): Promise<boolean>{
        return await this.forgottenPasswordLink.isVisible();
    }

    async doLogin(username: string, password: string): Promise<void>{
        // log utility to print username or password
        await this.emailId.fill(username);
        await this.password.fill(password);
        await this.submitBtn.click();
    }

    async isInvalidLoginErrorDisplayed(): Promise<boolean>{
        return await this.loginErrorMsz.isVisible();
    }










}