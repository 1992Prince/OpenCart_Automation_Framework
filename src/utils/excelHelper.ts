import XSLX from 'xlsx'

export class ExcelHelper{

    static readExcel(filePath: string, sheetname: string){
        const workbook = XSLX.readFile(filePath);
        const sheet = workbook.Sheets[sheetname];
        return XSLX.utils.sheet_to_json<Record<string,string>>(sheet);
    }
}


