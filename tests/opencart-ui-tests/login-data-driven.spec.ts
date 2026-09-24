//this is way we are reading test data json file at spec level

import { test, expect } from '../../src/fixtures/pagefixtures'
import { JsonHelper } from '../../src/utils/jsonHelper2'


test.beforeEach(async ({ loginPage }) => {
    await loginPage.goToLoginPage();

})

let testData: Record<string, any[]> = JsonHelper.load('src/testsData/loginData2.json');
let loginSucessData = testData.shouldLoginSuccessfully[0];

test.skip(`Login Successful Test from json`, async ({ loginPage, page }) => {
    console.log(`${loginSucessData.username} and ${loginSucessData.password}`)
    await loginPage.doLogin(loginSucessData.username, loginSucessData.password);
    await page.waitForTimeout(2000);
})

let loginUnSucessfulData = testData.shouldFailLoginWithInvalidCredentials;
for(let data of loginUnSucessfulData){
    test.only(`Login Test from json ${data.description}`, async ({loginPage, page}) => {
    console.log(`${data.username} and ${data.password}`)
    await loginPage.doLogin(data.username, data.password);
    await page.waitForTimeout(2000);
})
}