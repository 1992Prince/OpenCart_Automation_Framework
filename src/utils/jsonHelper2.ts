import fs from 'fs';
import path from 'path';

export class JsonHelper {

  static load(filePath: string): Record<string, any[]> {

    const fullPath = path.resolve(process.cwd(), filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new Error(
        `JSON file not found: ${fullPath}`
      );
    }

    try {
      const fileContent = fs.readFileSync(fullPath, 'utf-8');

      return JSON.parse(fileContent);

    } catch (error) {
      throw new Error(
        `Invalid JSON file: ${fullPath}`
      );
    }
  }
}