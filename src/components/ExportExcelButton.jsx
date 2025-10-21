// src/components/ExportExcelButton.jsx
import React from "react";
import { exportToExcel } from "../utils/exportToExcel";
import "./styles.css";

export default function ExportExcelButton({ data, fileName = "inventaris.xlsx" }) {
  const onExport = () => {
    exportToExcel(data, {
      fileName,
      sheetName: "Inventaris",
      // opsional: bisa kirim headerLabels/columnOrder kalau mau override
      // headerLabels: { Kode_Barang: "Kode Barang", Nama_Barang: "Nama Barang" },
      // columnOrder: ["No", "Kode_Barang", ...],
    });
  };

  return (
    <button className="btn-export" onClick={onExport}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v10" />
        <path d="M8.5 10.5L12 14l3.5-3.5" />
        <path d="M5 19h14" />
      </svg>
      EXPORT
    </button>
  );
}
