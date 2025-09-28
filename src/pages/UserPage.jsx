import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import UserFormModal from "../components/UserFormModal";

const UsersPage = () => {
  const [users, setUsers] = useState([
    { nama: "Admin Sistem", username: "admin", role: "Admin" },
    { nama: "Petugas Lab", username: "operator1", role: "Operator" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleSave = (user) => {
    if (editData) {
      const updated = users.map((u) =>
        u.username === editData.username ? { ...u, ...user } : u
      );
      setUsers(updated);
    } else {
      setUsers([...users, user]);
    }
  };

  const handleEdit = (user) => {
    setEditData(user);
    setModalOpen(true);
  };

  const handleDelete = (username) => {
    if (window.confirm("Yakin ingin hapus user ini?")) {
      setUsers(users.filter((u) => u.username !== username));
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem" }}>
        <h2>Manajemen Pengguna</h2>
        <button
          onClick={() => {
            setModalOpen(true);
            setEditData(null);
          }}
          style={{
            backgroundColor: "#007e3a",
            color: "white",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          + Tambah Pengguna
        </button>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead style={{ backgroundColor: "#f1f3f5" }}>
            <tr>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={styles.td}>{u.nama}</td>
                <td style={styles.td}>{u.username}</td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEdit(u)}
                    style={{ ...styles.actionBtn, backgroundColor: "#ffc107" }}
                  >
                    Edit
                  </button>{" "}
                  <button
                    onClick={() => handleDelete(u.username)}
                    style={{ ...styles.actionBtn, backgroundColor: "#dc3545" }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <UserFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          defaultData={editData}
        />
      </main>
    </div>
  );
};

// ⬇️ Tambahkan styles di sini, tetap dalam file ini
const styles = {
  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    color: "#212529",
  },
  td: {
    padding: "12px",
    color: "#495057",
  },
  actionBtn: {
    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    marginRight: "6px",
  },
};
export default UsersPage;
