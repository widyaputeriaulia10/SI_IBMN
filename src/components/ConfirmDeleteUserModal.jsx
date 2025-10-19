export default function ConfirmDeleteUserModal({ open, user, onCancel, onConfirm, loading, error }) {
  if (!open || !user) return null;

  const onKeyDown = e => {
    if (e.key === "Escape") onCancel?.();
  };

  return (
    <div style={cdm.overlay} role="dialog" aria-modal="true" onKeyDown={onKeyDown}>
      <div style={cdm.modal}>
        <div style={cdm.header}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Hapus Pengguna</h3>
          <button style={cdm.closeBtn} onClick={onCancel} aria-label="Tutup">
            ✕
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={cdm.avatar}>{(user.full_name || user.username || "?")[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{user.full_name || "-"}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>@{user.username}</div>
            </div>
          </div>

          <div style={cdm.warnBox}>
            <span style={cdm.dot} /> Tindakan ini bersifat <b>permanen</b>. Data pengguna akan dihapus.
          </div>

          {error && <div style={cdm.error}>{error}</div>}
        </div>

        <div style={cdm.footer}>
          <button type="button" onClick={onCancel} style={cdm.btnSecondary} disabled={loading}>
            Batal
          </button>
          <button type="button" onClick={onConfirm} style={cdm.btnDanger} disabled={loading} title="Hapus sekarang">
            {loading ? "Menghapus..." : "Ya, hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

const cdm = {
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "#e2e8f0", display: "grid", placeItems: "center", fontWeight: 700, color: "#334155" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 },
  modal: { width: "min(520px, 96vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", overflow: "hidden" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e5e7eb" },
  closeBtn: { border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#6b7280" },
  warnBox: { background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", borderRadius: 8, padding: "10px 12px", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" },
  error: { marginTop: 10, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, padding: "8px 10px" },
  footer: { display: "flex", justifyContent: "flex-end", gap: 8, padding: 16, borderTop: "1px solid #e5e7eb" },
  btnSecondary: { background: "#f1f5f9", color: "#111827", border: "1px solid #e5e7eb", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  btnDanger: { background: "#dc2626", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 },
};
