
import {test, expect} from '../../src/fixtures/pagefixtures'

test.beforeEach(async ({loginPage}) => {
    await loginPage.goToLoginPage();
    await loginPage.doLogin(process.env.APP_USERNAME,process.env.APP_PASSWORD);

})

test('home page title test', async ({homePage}) => {
    
    let pageTitle = await homePage.getHomePageTitle();
    console.log(`Page title : ${pageTitle}`)
    expect(pageTitle).toBe('My Account');
})

test('logout link exists test', async ({homePage}) => {
    
    expect(await homePage.isLogoutLinkExists()).toBeTruthy();
})

test('home page headers exists test', async ({homePage}) => {
    
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


