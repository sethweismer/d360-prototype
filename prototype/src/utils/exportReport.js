import * as XLSX from 'xlsx';

export function exportToCSV(rows, columns, filename = 'report.csv') {
  const header = columns.map((c) => c.title).join(',');
  const csvRows = rows.map((row) =>
    columns
      .map((c) => {
        const val = c.dataIndex ? row[c.dataIndex] : '';
        const str = Array.isArray(val) ? val.join('; ') : String(val ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(',')
  );
  const csv = [header, ...csvRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function exportToExcel(rows, columns, filename = 'report.xlsx') {
  const data = rows.map((row) => {
    const obj = {};
    columns.forEach((c) => {
      const val = c.dataIndex ? row[c.dataIndex] : '';
      obj[c.title] = Array.isArray(val) ? val.join('; ') : (val ?? '');
    });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
