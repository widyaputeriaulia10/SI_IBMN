import React, { useState, useEffect } from "react";
import AlertModal from "./AlertModal";

const BarangFormModal = ({ isOpen, onClose, onSave, defaultData }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [form, setForm] = useState({
    kode: "",
    nama: "",
    jenis: "",
    kondisi: "",
    lokasi: "",
    tanggalMasuk: "",
    tanggalKeluar: "",
    tanggalUpdate: "",
  });

  useEffect(() => {
    if (defaultData) {
      setForm({
        kode: defaultData.kode || "",
        nama: defaultData.nama || "",
        jenis: defaultData.jenis || "",
        kondisi: defaultData.kondisi || "",
        lokasi: defaultData.lokasi || "",
        tanggalMasuk: defaultData.tanggalMasuk || "",
        tanggalKeluar: defaultData.tanggalKeluar || "",
        tanggalUpdate: defaultData.tanggalUpdate || "",
      });
    } else {
      setForm({
        kode: "",
        nama: "",
        jenis: "",
        kondisi: "",
        lokasi: "",
        tanggalMasuk: "",
        tanggalKeluar: "",
        tanggalUpdate: "",
      });
    }
  }, [defaultData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
    setShowAlert(true);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{defaultData ? "Edit" : "Tambah"} Barang</h3>
        <input
          name="kode"
          value={form.kode}
          onChange={handleChange}
          placeholder="Kode Barang"
          style={styles.input}
        />
        <input
          name="nama"
          value={form.nama}
          onChange={handleChange}
          placeholder="Nama Barang"
          style={styles.input}
        />
        <input
          name="jenis"
          value={form.jenis}
          onChange={handleChange}
          placeholder="Jenis Barang"
          style={styles.input}
        />
        <input
          name="kondisi"
          value={form.kondisi}
          onChange={handleChange}
          placeholder="Kondisi"
          style={styles.input}
        />
        <input
          name="lokasi"
          value={form.lokasi}
          onChange={handleChange}
          placeholder="Lokasi"
          style={styles.input}
        />
        <label>Tanggal Masuk</label>
        <input
          type="date"
          name="tanggalMasuk"
          value={form.tanggalMasuk}
          onChange={handleChange}
          style={styles.input}
        />

        <label>Tanggal Keluar</label>
        <input
          type="date"
          name="tanggalKeluar"
          value={form.tanggalKeluar}
          onChange={handleChange}
          style={styles.input}
        />

        <div style={styles.buttons}>
          <button onClick={handleSubmit} style={styles.save}>
            Simpan
          </button>
          <button onClick={onClose} style={styles.cancel}>
            Batal
          </button>
          <AlertModal
            isOpen={showAlert}
            onClose={() => setShowAlert(false)}
            type="success"
            message="Barang berhasil disimpan"
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    width: "400px",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  buttons: { display: "flex", justifyContent: "flex-end", gap: "1rem" },
  save: {
    backgroundColor: "#007e3a",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
  },
  cancel: {
    backgroundColor: "#ccc",
    color: "black",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
  },
};

export default BarangFormModal;
