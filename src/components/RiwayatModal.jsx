import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AlertModal from "./AlertModal";

const RiwayatModal = ({ isOpen, onClose, data, namaBarang }) => {
  if (!isOpen) return null;

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RiwayatBarang");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `riwayat-${namaBarang.replace(/\s+/g, "_")}.xlsx`);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Riwayat untuk: {namaBarang}</h3>

        <ul style={styles.list}>
          {data.length > 0 ? (
            data.map((item, index) => (
              <li key={index} style={styles.item}>
                📅 <strong>{item.tanggal}</strong> - {item.keterangan}
              </li>
            ))
          ) : (
            <li>Tidak ada riwayat.</li>
          )}
        </ul>

        <div style={styles.buttonRow}>
          <button onClick={handleExportExcel} style={styles.exportBtn}>
            Export Excel
          </button>
          <button onClick={onClose} style={styles.closeBtn}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
  <AlertModal
    isOpen={showAlert}
    onClose={() => setShowAlert(false)}
    type="success"
    message="Riwayat berhasil ditambahkan"
  />;
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    width: "400px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  list: {
    paddingLeft: "1rem",
    lineHeight: "1.6",
    marginBottom: "1.5rem",
  },
  item: {
    marginBottom: "0.5rem",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  exportBtn: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    border: "none",
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  closeBtn: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default RiwayatModal;
