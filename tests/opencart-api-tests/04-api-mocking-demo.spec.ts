import {test, expect} from '@playwright/test'

test.skip('intercept all backgroud api calls test', async ({page}) => {

    await page.route('**/*', async (route) => {

        console.log("Req Details - ",route.request().method()," ",route.request().url());
        await route.continue();

    })

    await page.goto('https://naveenautomationlabs.com/opencart/index.php?route=common/home');

    await page.pause();
})

test('mock search data api', async ({ page }) => {

    const fakeProducts = [
        { name: 'Macbook Pro', price: '$599' },
        { name: 'Macbook Air M5', price: '$499' },
        { name: 'Macbook M4', price: '$399' },
        { name: 'Macbook Neo', price: '$299' }
    ];

    await page.route(
        '**/index.php?route=product/search&search=macbook',
        async (route) => {

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(fakeProducts)
            });
        }
    );

    await page.goto(
        'https://abc.com/index.php?route=product/search&search=macbook'
    );

    await page.pause();
});