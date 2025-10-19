import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import UserFormModal from "../components/UserFormModal";
import EditUserModal from "../components/EditUserModal"; // ⬅️ tambahkan ini
import ConfirmDeleteUserModal from "../components/ConfirmDeleteUserModal";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [me, setMe] = useState(null); // <- data user login

  // EDIT modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");
  // ambil sesi user (untuk cek role)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/auth/me", { credentials: "include" });
        if (r.ok) setMe(await r.json());
      } catch {}
    })();
  }, []);

  // ambil data user dari API
  const fetchUsers = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Gagal memuat pengguna");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Terjadi kesalahan");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isAdmin = String(me?.role || "").toLowerCase() === "admin";
  const canAdd = isAdmin;

  const canEditUser = u => {
    if (isAdmin) return true;
    if (!me) return false;
    return Number(u.id) === Number(me.id); // non-admin hanya boleh edit dirinya
  };

  const handleEdit = u => {
    if (!canEditUser(u)) {
      // tooltip sudah di tombol; sebagai fallback tampilkan alert
      alert("Hanya admin yang bisa mengedit pengguna lain. Anda hanya dapat mengedit profil Anda sendiri.");
      return;
    }
    setEditData(u);
    setEditOpen(true);
  };

  const askDelete = u => {
    setUserToDelete(u);
    setDeleteErr("");
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteErr("");
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || "Gagal menghapus pengguna");
      setConfirmOpen(false);
      setUserToDelete(null);
      await fetchUsers(); // refresh list
    } catch (e) {
      setDeleteErr(e.message || "Terjadi kesalahan saat menghapus");
    } finally {
      setDeleting(false);
    }
  };

  // useEffect(() => {
  //   console.log("canAdd", me, canAdd);
  // }, [canAdd, me]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <h2 style={{ margin: 0 }}>Manajemen Pengguna</h2>
            {!canAdd && <InfoTooltip id="adminTip" text="Hanya admin yang dapat menambah, menghapus dan mengedit pengguna" />}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={fetchUsers} style={{ ...styles.primaryBtn, background: "#0ea5e9" }}>
              Refresh
            </button>
            <button onClick={() => setModalOpen(true)} style={{ ...styles.primaryBtn, opacity: canAdd ? 1 : 0.6, cursor: canAdd ? "pointer" : "not-allowed" }} disabled={!canAdd} title={canAdd ? "Tambah pengguna" : "Butuh peran admin"}>
              + Tambah Pengguna
            </button>
          </div>
        </div>

        {err && <div style={styles.alert}>{err}</div>}

        {loading ? (
          <div style={styles.skeletonWrap}>
            <div style={styles.skeletonRow} />
            <div style={styles.skeletonRow} />
            <div style={styles.skeletonRow} />
          </div>
        ) : users.length === 0 ? (
          <div style={styles.empty}>Belum ada pengguna.</div>
        ) : (
          <div style={{  borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", marginTop: 14 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, backgroundColor: "white" }}>
              <thead style={{ backgroundColor: "#f8fafc", position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Role</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const allowed = canEditUser(u);
                  return (
                    <tr key={u.id ?? u.username} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={styles.avatar}>{(u.full_name || u.username || "?")[0]?.toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.full_name || "-"}</div>
                            {u.email && <div style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>{u.username}</td>
                      <td style={styles.td}>
                        <RoleBadge role={u.role} />
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        {!allowed && <InfoTooltip id={`editTip-${u.id}`} text="Bukan admin: hanya bisa mengedit akun sendiri" />}
                        <button
                          onClick={() => handleEdit(u)}
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: "#f59e0b",
                            opacity: allowed ? 1 : 0.6,
                            cursor: allowed ? "pointer" : "not-allowed",
                            marginRight: 8,
                          }}
                          disabled={!allowed}
                          aria-describedby={!allowed ? `editTip-${u.id}` : undefined}
                        >
                          Edit
                        </button>
                        <button onClick={() => askDelete(u)} style={{ ...styles.actionBtn, backgroundColor: "#ef4444", opacity: canAdd ? 1 : 0.6, cursor: canAdd ? "pointer" : "not-allowed" }} disabled={!canAdd} title={canAdd ? `Hapus ${u.username}` : "Butuh peran admin"}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal tambah user (khusus admin) */}
        <UserFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchUsers();
          }}
        />
        {/* Modal EDIT */}
        <EditUserModal
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditData(null);
          }}
          user={editData}
          me={me}
          onSaved={() => {
            setEditOpen(false);
            setEditData(null);
            fetchUsers();
          }}
        />
        <ConfirmDeleteUserModal
          open={confirmOpen}
          user={userToDelete}
          onCancel={() => {
            setConfirmOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={doDelete}
          loading={deleting}
          error={deleteErr}
        />
      </main>
    </div>
  );
};

function RoleBadge({ role }) {
  const isAdmin = String(role).toLowerCase() === "admin";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        fontSize: 12,
        borderRadius: 999,
        fontWeight: 700,
        color: isAdmin ? "#065f46" : "#1e40af",
        background: isAdmin ? "#d1fae5" : "#dbeafe",
        border: `1px solid ${isAdmin ? "#34d399" : "#93c5fd"}`,
        textTransform: "uppercase",
        letterSpacing: 0.3,
      }}
    >
      {role}
    </span>
  );
}

const styles = {
  th: { textAlign: "left", padding: "12px 16px", fontSize: 13, color: "#475569", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px 16px", fontSize: 14, color: "#111827", verticalAlign: "middle" },
  actionBtn: { border: "none", color: "white", padding: "6px 10px", borderRadius: 8, marginLeft: 8, cursor: "pointer", fontWeight: 600 },
  primaryBtn: { backgroundColor: "#007e3a", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "#e2e8f0", display: "grid", placeItems: "center", fontWeight: 700, color: "#334155" },
  skeletonWrap: { display: "grid", gap: 8, marginTop: 12 },
  skeletonRow: { height: 44, background: "linear-gradient(90deg,#f1f5f9,#e2e8f0,#f1f5f9)", borderRadius: 8, animation: "pulse 1.2s infinite" },
  empty: { padding: 16, background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 8, color: "#475569", marginTop: 12 },
  alert: { padding: 12, borderRadius: 8, background: "#fee2e2", color: "#991b1b", marginTop: 12, border: "1px solid #fecaca" },
};

function InfoTooltip({ id, text }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-describedby={id}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: "none",
          cursor: "help",
          color: "#0ea5e9",
          background: "#e0f2fe",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: 12,
        }}
        title={text}
      >
        i
      </button>

      {open && (
        <div
          id={id}
          role="tooltip"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 8,
            width: 60,
            background: "#111827",
            color: "#f9fafb",
            padding: "8px 10px",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
            zIndex: 100,
            whiteSpace: "normal",
            textAlign: "left",
          }}
        >
          {text}
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -6,
              left: 10,
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "6px solid #111827",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default UsersPage;
