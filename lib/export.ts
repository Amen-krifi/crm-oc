import * as XLSX from 'xlsx';

/**
 * Flattens an array of objects into rows for export, using the given
 * column definitions to control order, headers, and value formatting.
 */
export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function toRows<T>(data: T[], columns: ExportColumn<T>[]) {
  return data.map((row) => {
    const record: Record<string, string | number> = {};
    for (const col of columns) record[col.header] = col.value(row);
    return record;
  });
}

export function exportToCsv<T>(filename: string, data: T[], columns: ExportColumn<T>[]) {
  const rows = toRows(data, columns);
  const headers = columns.map((c) => c.header);
  const escape = (val: string | number) => {
    const str = String(val ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToXlsx<T>(filename: string, data: T[], columns: ExportColumn<T>[], sheetName = 'Sheet1') {
  const rows = toRows(data, columns);
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns.map((c) => c.header) });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
