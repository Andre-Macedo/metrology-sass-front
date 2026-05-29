import * as XLSX from 'xlsx'

/**
 * Exports an array of objects to an Excel file.
 * 
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the worksheet
 */
export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Data') {
    if (!data || data.length === 0) return

    // 1. Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(data)

    // 2. Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // 3. Trigger the download
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`)
}
