import fs from 'fs';
import { parse } from 'csv-parse/sync';

// this sync mode enables all workers or threads that connect with this
// util will access it or interact it in sync mode and not parallel mode

// since this is utility, we will create static method instead of instance mehtod
// in memory only one copy of this utility will be created and we don't need
// to create obj of this class.
export class CsvHelper {

    // why fs.readFileSync
    // parse second parameter are column properties sa object

    // then it is holding all data from given file path to Record wch is kind of map
    static readCsv(filePath: string): Record<string, string>[] {
        return parse(fs.readFileSync(filePath, 'utf-8'), {
            columns:true ,// first row as headers
            skip_empty_lines: true, // ignore empty lines in csv file
            trim: true, // if data in csv file have given any speace before or later
        }) as Record<string, string>[];
    }

}