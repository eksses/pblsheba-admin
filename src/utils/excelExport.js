import * as XLSX from 'xlsx';

/**
 * Utility to export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Data') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate buffer and download
  XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
};
