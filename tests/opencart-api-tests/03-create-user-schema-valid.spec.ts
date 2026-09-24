// schema - type of response data
// ajv - node library for schema validation
// npm instal ajv

import { test, expect } from '../../src/fixtures/apifixtures'
//import userschema from '../../src/schemas/userSchema.json'
import Ajv from 'ajv'
import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve(process.cwd(), 'src/schemas/userSchema.json');
const userSchemaPath = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

const APIKEY = process.env.X_API_Key;
const BASEURL = process.env.API_BASE_URL;

let AUTH_HEADER: Record<string, string> = {
    'X-API-Key': APIKEY ?? '',
}

// setup the ajv
let ajv = new Ajv();

// defining schema in same spec file
// https://transform.tools/json-to-json-schema
let userSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Generated schema for Root",
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "phone": {},
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string" // to validate schema failure , replace string with number
        },
        "kycStatus": {
          "type": "string"
        },
        "createdAt": {
          "type": "string"
        },
        "updatedAt": {
          "type": "string"
        }
      },
      "required": [
        "id",
        "email",
        "phone",
        "firstName",
        "lastName",
        "kycStatus",
        "createdAt",
        "updatedAt",
       // "openAI"
      ]
    },
    "meta": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "string"
        },
        "timestamp": {
          "type": "string"
        },
        "version": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "timestamp",
        "version"
      ]
    }
  },
  "required": [
    "success",
    "data",
    "meta"
  ]
}

// in below test schema is already defined here in spec file
test('Get User-Schema Test1', async ({ apiHelper }) => {

    let response = await apiHelper.get("/v1/users/user-65dde39e", AUTH_HEADER);

    expect(response.status).toBe(200);

    // schema validation
    let validate = ajv.compile(userSchema);
    let isSchemaValid = validate(response.body);

    // Fail immediately by throwing an Error if invalid
    if (!isSchemaValid) {
        throw new Error(`Schema validation failed:\n${JSON.stringify(validate.errors, null, 2)}`);
    }

});

// in below test schema is present in schemas folder in json file and imported here
test('Get User-Schema Test2', async ({ apiHelper }) => {

    let response = await apiHelper.get("/v1/users/user-65dde39e", AUTH_HEADER);

    expect(response.status).toBe(200);

    // schema validation
    let validate = ajv.compile(userSchemaPath);
    let isSchemaValid = validate(response.body);

    // Fail immediately by throwing an Error if invalid
    if (!isSchemaValid) {
        throw new Error(`Schema validation failed:\n${JSON.stringify(validate.errors, null, 2)}`);
    }

});