import React, { useState, useEffect } from "react";
import AlertModal from "./AlertModal";
const UserFormModal = ({ isOpen, onClose, onSave, defaultData }) => {
  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
    role: "Operator",
  });

  useEffect(() => {
    if (defaultData) {
      setForm({ ...defaultData, password: "" }); // reset password
    } else {
      setForm({ nama: "", username: "", password: "", role: "Operator" });
    }
  }, [defaultData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.nama || !form.username || (!defaultData && !form.password)) {
      alert("Semua field wajib diisi");
      return;
    }
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{defaultData ? "Edit" : "Tambah"} Pengguna</h3>

        <input
          name="nama"
          value={form.nama}
          onChange={handleChange}
          placeholder="Nama Lengkap"
          style={styles.input}
        />
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          style={styles.input}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="Admin">Admin</option>
          <option value="Operator">Operator</option>
          <option value="Viewer">Viewer</option>
        </select>

        <div style={styles.buttons}>
          <button onClick={handleSubmit} style={styles.save}>
            Simpan
          </button>
          <button onClick={onClose} style={styles.cancel}>
            Batal
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

export default UserFormModal;
