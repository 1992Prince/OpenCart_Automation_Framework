import { APIRequestContext } from "@playwright/test";

export class APIHelper {

    // baseURL will be maintained in qa config properties
    // in diff envs only baseURL changes but endpoints remain same, so we can hardcode endpoints here
    private readonly request: APIRequestContext;
    private readonly baseURL: string;

    constructor(request: APIRequestContext, baseURL: string) {
        this.request = request;
        this.baseURL = baseURL;
    }

    // 4 simple helper/generic methods
    // these methods will be available to all spec files via fixtures

    // GET
    // headers are optional and can be passed to fun or not
    // we are returning the obj from this method
    async get(endPoint: string, headers?: Record<string, string>) {
        const url = `${this.baseURL}${endPoint}`;

        // Log Request
        console.log(`[REQUEST] GET -> ${url}`, headers ? { headers } : '');

        const response = await this.request.get(url, {
            headers: headers,
        });

        const status = response.status(); // Use response.status if not using Playwright/Fetch
        const body = await response.json();

        // Log Response
        console.log(`[RESPONSE] ${status} <- ${url}:`, body);

        return {
            status: status,
            body: body
        };
    }

    // POST
    async post(endPoint: string, data: object, headers?: Record<string, string>) {
        const url = `${this.baseURL}${endPoint}`;

        // Log Request
        console.log(`[REQUEST] POST -> ${url}`, { headers, body: data });

        let response = await this.request.post(url, {
            headers: headers,
            data: data
        });

        const status = response.status();
        const body = await response.json();

        // Log Response
        console.log(`[RESPONSE] ${status} <- ${url}:`, body);

        return {
            status: status,
            body: body
        };
    }

    // PUT
    async put(endPoint: string, data: object, headers?: Record<string, string>) {
        const url = `${this.baseURL}${endPoint}`;

        // Log Request
        console.log(`[REQUEST] PUT -> ${url}`, { headers, body: data });

        let response = await this.request.put(url, {
            headers: headers,
            data: data
        });

        const status = response.status();
        const body = await response.json();

        // Log Response
        console.log(`[RESPONSE] ${status} <- ${url}:`, body);

        return {
            status: status,
            body: body
        };
    }

    // DELETE
    async delete(endPoint: string, headers?: Record<string, string>) {
        const url = `${this.baseURL}${endPoint}`;

        // Log Request
        console.log(`[REQUEST] DELETE -> ${url}`, headers ? { headers } : '');

        let response = await this.request.delete(url, {
            headers: headers,
        });

        const status = response.status();

        // Log Response (DELETE often returns 204 No Content with no body)
        console.log(`[RESPONSE] ${status} <- ${url}`);

        return {
            status: status
        };
    }
}