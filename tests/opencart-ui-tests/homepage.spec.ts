
import {test, expect} from '../../src/fixtures/pagefixtures'

test.beforeEach(async ({loginPage}) => {
    await loginPage.goToLoginPage();
    await loginPage.doLogin(process.env.APP_USERNAME,process.env.APP_PASSWORD);

})

test('home page title test @smoke', async ({homePage}) => {
    
    let pageTitle = await homePage.getHomePageTitle();
    console.log(`Page title : ${pageTitle}`)
    expect(pageTitle).toBe('My Account');
})

test('logout link exists test @smoke', async ({homePage}) => {
    
    expect(await homePage.isLogoutLinkExists()).toBeTruthy();
})

test('home page headers exists test @smoke', async ({homePage}) => {
    
    let allHeaders: string[] = await homePage.getHomePageHeaders();
    console.log('Home Page Headers : ', allHeaders);
    expect.soft(allHeaders).toHaveLength(4);
    // in below assertion if u change seq of array elments headers and on ui diff seq
    // is there then it will return failure. It expects in same seq as in UI of app
      expect.soft(allHeaders).toEqual([
        'My Account',
        'My Orders',
        'My Affiliate Account',
        'Newsletter'
      ]);
})


// common feature/functionalities test are available in HomePage
test('App logo exists on Login Page @regression', async ({homePage}) => {
    expect(await homePage.isLogoVisible()).toBeTruthy();
})

test('App search box exists on Login Page @regression', async ({homePage}) => {
    expect(await homePage.isSearchBoxVisible()).toBeTruthy();
})

test('App Cart exists on Login Page @regression', async ({homePage}) => {
    expect(await homePage.isCartBtnVisible()).toBeTruthy();
})

test('App Footers exists on Login Page @regression', async ({homePage}) => {
    expect(await homePage.getPageFootersCount()).toBeGreaterThan(4);

})
