// src/utils/exportToExcel.js
import * as XLSX from "xlsx";

/** Gabungkan semua key dari seluruh row (urutan: pertama kali muncul) */
function deriveColumnOrder(data) {
  const seen = new Set();
  const order = [];
  data.forEach(row => {
    Object.keys(row).forEach(k => {
      if (!seen.has(k)) {
        seen.add(k);
        order.push(k);
      }
    });
  });
  return order;
}

/** Label header default: ubah underscore -> spasi + kapital tiap kata */
function defaultHeaderLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function exportToExcel(data, opts = {}) {
  const {
    fileName = "inventaris.xlsx",
    sheetName = "Inventaris",
    // opsional: kalau mau override label header tertentu
    headerLabels = {}, // contoh: { Kode_Barang: "Kode Barang" }
    // opsional: kalau mau paksa urutan kolom tertentu
    columnOrder, // contoh: ["No", "Kode_Barang", ...]
  } = opts;

  const arr = Array.isArray(data) ? data : [];
  const keys = columnOrder && columnOrder.length ? columnOrder : arr.length ? deriveColumnOrder(arr) : [];

  // Kalau kosong, export sheet sederhana
  if (!arr.length || !keys.length) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["Data kosong"]]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
    return;
  }

  // Header ditampilkan
  const headers = keys.map(k => headerLabels[k] ?? defaultHeaderLabel(k));

  // Body mempertahankan tipe data (number tetap number, dst.)
  const body = arr.map(row => keys.map(k => row?.[k] ?? ""));

  const aoa = [headers, ...body];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Auto width kolom sederhana
  const colWidths = keys.map((k, colIdx) => {
    const headerLen = String(headers[colIdx]).length;
    let maxLen = headerLen;
    for (const r of arr) {
      const v = r?.[k] ?? "";
      const len = String(v).length;
      if (len > maxLen) maxLen = len;
    }
    return { wch: Math.min(Math.max(maxLen + 2, 8), 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
