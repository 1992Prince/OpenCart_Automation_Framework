import {test as baseTest, Page} from '@playwright/test'
import { APIHelper } from '../utils/apiClient'

// define type of API fixtures
type APIFixture = {
    apiHelper:APIHelper
}

export let test = baseTest.extend<APIFixture>({
    apiHelper: async ({request}, use) => {
            let apiHelper = new APIHelper(request, process.env.API_BASE_URL!);
            await use(apiHelper);
        },
});

export {expect} from '@playwright/test';
