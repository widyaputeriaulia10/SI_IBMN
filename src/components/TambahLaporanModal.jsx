// src/components/TambahLaporanModal.jsx
import React, { useState } from "react";
import "../styles/TambahLaporanModal.css";
import AlertModal from "./AlertModal";

const TambahLaporanModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    namaBarang: "",
    lokasi: "",
    keterangan: "",
    tanggal: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.namaBarang &&
      formData.lokasi &&
      formData.keterangan &&
      formData.tanggal
    ) {
      onSubmit(formData);
      setFormData({
        namaBarang: "",
        lokasi: "",
        keterangan: "",
        tanggal: "",
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>Tambah Laporan Masalah</h2>
        <form onSubmit={handleSubmit} className="form-laporan">
          <label>
            Nama Barang:
            <input
              type="text"
              name="namaBarang"
              value={formData.namaBarang}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Lokasi:
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Masalah:
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              required
            ></textarea>
          </label>
          <label>
            Tanggal:
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="btn-submit">
            Simpan Laporan
          </button>
        </form>
      </div>
    </div>
  );
};

export default TambahLaporanModal;
