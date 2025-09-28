// File: DetailBarangModal.jsx
import React, { useState } from "react";
import "../styles/DetailBarang.css";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const DetailBarangModal = ({ item, riwayat, onClose }) => {
  const [riwayatList, setRiwayatList] = useState(riwayat || []);

  const handleAddRiwayat = () => {
    const newRiwayat = { tanggal: "", keterangan: "" };
    setRiwayatList([...riwayatList, newRiwayat]);
  };

  const handleRiwayatChange = (index, field, value) => {
    const updated = [...riwayatList];
    updated[index][field] = value;
    setRiwayatList(updated);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(riwayatList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `riwayat-${item.kode}.xlsx`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-header">
          <img src={item.gambar} alt={item.nama} className="modal-image" />
          <div className="modal-info">
            <h2>{item.nama}</h2>
            <p>ID: {item.id}</p>
            <p>Kode: {item.kode}</p>
            <p>Lokasi: {item.lokasi}</p>
            <p>Tanggal Masuk: {item.tanggalMasuk || "-"}</p>
            <p>Kondisi: {item.kondisi || "-"}</p>
          </div>
        </div>

        <div className="riwayat-actions">
          <button onClick={handleAddRiwayat} className="btn">
            + Tambah Riwayat Baru
          </button>
          <button onClick={handleExportExcel} className="btn export">
            Export ke Excel
          </button>
        </div>

        <table className="riwayat-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {riwayatList.map((entry, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="date"
                    value={entry.tanggal}
                    onChange={(e) =>
                      handleRiwayatChange(index, "tanggal", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={entry.keterangan}
                    onChange={(e) =>
                      handleRiwayatChange(index, "keterangan", e.target.value)
                    }
                  />
                </td>
                <td>
                  <button
                    onClick={() => {
                      const updated = riwayatList.filter((_, i) => i !== index);
                      setRiwayatList(updated);
                    }}
                    className="btn-delete"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  <AlertModal
    isOpen={showAlert}
    onClose={() => setShowAlert(false)}
    type="success"
    message="Data berhasil disimpan!"
  />;
};

export default DetailBarangModal;
