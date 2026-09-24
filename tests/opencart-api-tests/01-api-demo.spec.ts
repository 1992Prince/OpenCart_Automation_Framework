import { test, expect, APIRequest, APIResponse } from '@playwright/test'

// Object keys can be written without quotes, but keys containing special characters 
// like "-" must be enclosed in quotes, e.g. 'X-API-Key'.

// Request JS header obj
let AUTH_TOKEN = {
    'X-API-Key': 'demo-api-key-123',
}

// Request Payload obj
let CREATE_USER_PAYLOAD = {
        "email": "supreme@example.com",
        "phone": "+919876543210",
        "firstName": "supreme_todo",
        "lastName": "lastname",
        "kycStatus": "pending",
        "address": {
            "line1": "123 Main Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "postalCode": "400001",
            "country": "IN"
        }
    }

let user_id: any;


test('Get Users Test', async ({ request }) => {

    let resp: APIResponse = await request.get(`https://billpay-api.gauravkhurana-practice-api.workers.dev/v1/users`, {
        headers: AUTH_TOKEN,
    });

    let statusCode = resp.status();
    let statusText = resp.statusText();

    let respBody = await resp.json();
    console.log(`Status Code: ${statusCode} and status text: ${statusText}`);
    console.log("Response Body: ", respBody);

});

test('Create User Test', async ({ request }) => {

    let resp: APIResponse = await request.post(`https://billpay-api.gauravkhurana-practice-api.workers.dev/v1/users`, {
        headers: AUTH_TOKEN,
        data: CREATE_USER_PAYLOAD
    });

    let statusCode = resp.status();
    let statusText = resp.statusText();

    let respBody = await resp.json();

    user_id = respBody.data.id;
    console.log(`Status Code: ${statusCode} and status text: ${statusText} and user_id: ${user_id}`);
    console.log("Response Body: ", respBody);

});

test(`Fetch User Test`, async ({ request }) => {

    let resp: APIResponse = await request.get(`https://billpay-api.gauravkhurana-practice-api.workers.dev/v1/users/${user_id}`, {
        headers: AUTH_TOKEN,
    });

    let statusCode = resp.status();
    let statusText = resp.statusText();

    let respBody = await resp.json();

    console.log(`Status Code: ${statusCode} and status text: ${statusText}`);
    console.log("Response Body: ", respBody);

});

test(`Delete User Test`, async ({ request }) => {

    let resp: APIResponse = await request.delete(`https://billpay-api.gauravkhurana-practice-api.workers.dev/v1/users/${user_id}`, {
        headers: AUTH_TOKEN
    });

    let statusCode = resp.status();
    let statusText = resp.statusText();

    console.log(`Status Code: ${statusCode} and status text: ${statusText}`);

});
