
import {test, expect} from '../../src/fixtures/pagefixtures'
import { ProductInfoPage } from '../../src/pages/ProductInfoPage';

test.beforeEach(async ({loginPage}) => {
    await loginPage.goToLoginPage();
    await loginPage.doLogin(process.env.APP_USERNAME,process.env.APP_PASSWORD);

})

test('verify search results count test', async ({homePage, searchResultsPage}) => {

    await homePage.doSearch('macbook');
    let resultCount = await searchResultsPage.getProductSearchResultsCount();
    console.log(`Product search result count: ${resultCount}`);
    expect(resultCount).toBe(3);

})

test('verify use able to land on product page test', async ({homePage, searchResultsPage, page, productInfoPage}) => {

    await homePage.doSearch('macbook');
    await searchResultsPage.selectProduct('MacBook Pro');
    //expect(await page.title()).toBe('MacBook Pro');
    let headerTxt = await productInfoPage.getProductHeader();
    console.log(`Header Text is: ${headerTxt}`);
    expect(headerTxt).toBe('Search - macbook');

})

test('verify product images count test', async ({homePage, searchResultsPage, page, productInfoPage}) => {
    await homePage.doSearch('macbook');
    await searchResultsPage.selectProduct('MacBook Pro');
    expect(await productInfoPage.getProductImagesCount()).toBe(4);
})