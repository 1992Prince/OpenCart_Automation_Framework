import { test, expect } from '../../src/fixtures/apifixtures'


const APIKEY = process.env.X_API_Key;
const BASEURL = process.env.API_BASE_URL;

let AUTH_HEADER: Record<string, string> = {
    'X-API-Key': APIKEY ?? '',
}

// let AUTH_HEADER = {
//     Authorization: `Bearer ${APIKEY}`,
// }

test.skip('Get Users Test', async ({ apiHelper }) => {

    let response = await apiHelper.get("/v1/users", AUTH_HEADER);

    expect(response.status).toBe(200);
    expect(response.body).toBeGreaterThan(0);

});

test('Create User E2E Test', async ({ apiHelper }) => {

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

    // create user operation
    let createUserResponse = await apiHelper.post("/v1/users",CREATE_USER_PAYLOAD,AUTH_HEADER);
    expect(createUserResponse.status).toBe(201);
    expect(createUserResponse.body.data.phone).toContain('919876543210');
    expect(createUserResponse.body.data.address.line1).toContain('123 Main Street');
    expect(createUserResponse.body.data.address.line2).toBeNull;

    let user_id = createUserResponse.body.data.id;

    // fetch user operation
    let fetchUserResponse = await apiHelper.get(`/v1/users/${user_id}`, AUTH_HEADER);
    expect(fetchUserResponse.status).toBe(200);

    // update user operation

    // delete user operation
    let deleteUserResponse = await apiHelper.delete(`/v1/users/${user_id}`, AUTH_HEADER);
    expect(deleteUserResponse.status).toBe(200);
    //expect(response.body).toBeGreaterThan(0);

    // validate created user doesn't exist

});



