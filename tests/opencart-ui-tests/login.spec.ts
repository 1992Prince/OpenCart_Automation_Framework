//import {test, expect} from '@playwright/test'
import {test, expect} from '../../src/fixtures/pagefixtures'
import {CsvHelper} from '../../src/utils/csvHelper'
import {ExcelHelper} from '../../src/utils/excelHelper'
import {JsonHelper} from '../../src/utils/jsonhelper'


test.beforeEach(async ({loginPage}) => {
    await loginPage.goToLoginPage();
    
})

test('Login Page Title Test @smoke', async ({loginPage}) => {
    
    let pageTitle = await loginPage.getPageTitle();
    console.log(`Page title : ${pageTitle}`)
    expect(pageTitle).toBe('Account Login');
})

test('Forget Pwd Link Exist Test @smoke', async ({loginPage}) => {
    expect(await loginPage.isForgottenPasswordLinkExists()).toBeTruthy();

})

// below after login we are asserting at homepage to make sure user logged in successfull
test('Login Successful test @smoke', async ({loginPage, homePage}) => {
    await loginPage.doLogin(process.env.APP_USERNAME, process.env.APP_PASSWORD);
    expect.soft(await homePage.isLogoutLinkExists()).toBeTruthy();
    expect.soft(await homePage.getHomePageTitle()).toBe("My Account");
})


// pros
// light weight and easy to maintain and read
// 3rd party lib is there to read and no machine Licenses are req to read


// Data Driven from csv : read data from csv file and use loop to iterate the record and test will
// run that no of rows times
let testData: Record<string, string>[] = CsvHelper.readCsv('src/testsData/loginData.csv');
for(let data of testData){
    test(`Login Test from csv ${data.test_id}`, async ({loginPage, page}) => {
    await loginPage.doLogin(data.username, data.password);
    await page.waitForTimeout(2000);
})
}

// EXCEL is worst approach
// 1. maintaince is req
// 2. requires MS licence in laptop
// 3. excel file gets corrupted very often and also they are heavy
// 4. sometimes in remote repo, only binary files are allowed and not excel ones

// Data Driven from excel
let testData2: Record<string, string>[] = ExcelHelper.readExcel('src/testsData/loginData.xlsx', 'login');
for(let data of testData2){
    test(`Login Test from excel ${data.test_id}`, async ({loginPage, page}) => {
    console.log(`${data.username} and ${data.password}`)
    await loginPage.doLogin(data.username, data.password);
    await page.waitForTimeout(2000);
})
}

// Node have inbuild method to parse, read
// light weight also and no third party is req to parse
// serialization and deserialization can be done wihout any 3rd party
// very good for smaller no of tcs but for bigger no of tests can be confusing and reqs maintaince
// Data Driven from json 
let testData3: Record<string, string>[] = JsonHelper.readJson('src/testsData/loginData.json');
for(let data of testData3){
    test(`Login Test from json ${data.id}`, async ({loginPage, page}) => {
    console.log(`${data.username} and ${data.password}`)
    await loginPage.doLogin(data.username, data.password);
    await page.waitForTimeout(2000);
})
}


// common feature/functionalities test are available in LoginPage
test('App logo exists on Login Page @smoke', async ({loginPage}) => {
    expect(await loginPage.isLogoVisible()).toBeTruthy();
})

test('App search box exists on Login Page @regression', async ({loginPage}) => {
    expect(await loginPage.isSearchBoxVisible()).toBeTruthy();
})

test('App Cart exists on Login Page @regression', async ({loginPage}) => {
    expect(await loginPage.isCartBtnVisible()).toBeTruthy();
})

test('App Footers exists on Login Page @regression', async ({loginPage}) => {
    expect(await loginPage.getPageFootersCount()).toBeGreaterThan(4);
})