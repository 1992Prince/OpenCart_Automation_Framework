import fs from 'fs'

export class JsonHelper{

    // here we need to do deserialization
    // here we need to convert json to javascript obj
    // below JS object will be returned and it will be automatically covereted to Record array
    static readJson(filePath: string): Record<string, string>[] {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
}