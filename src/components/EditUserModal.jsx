import React, { useEffect, useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/**
 * EditUserModal
 * - Admin: boleh ubah semua (username, role, is_active, full_name, email, password)
 * - Non-admin: hanya boleh edit dirinya sendiri -> hanya full_name, email, password
 */
export default function EditUserModal({ isOpen, onClose, user, me, onSaved }) {
  const [form, setForm] = useState({
    id: null,
    username: "",
    full_name: "",
    email: "",
    role: "user",
    is_active: true,
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = String(me?.role || "").toLowerCase() === "admin";
  const editingSelf = user && me && Number(user.id) === Number(me.id);

  const canEditAll = isAdmin;
  const canEditSelfOnly = !isAdmin && editingSelf;

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        id: user.id,
        username: user.username || "",
        full_name: user.full_name || "",
        email: user.email || "",
        role: user.role || "user",
        is_active: !!user.is_active,
        password: "",
        confirm: "",
      });
      setErr("");
      setSaving(false);
      setShowPw(false);
      setShowPw2(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const e = [];
    if (!form.username.trim()) e.push("Username wajib diisi");
    if (!["admin", "user"].includes(String(form.role))) e.push("Role tidak valid");

    if (form.password) {
      if (form.password.length < 6) e.push("Password minimal 6 karakter");
      if (form.password !== form.confirm) e.push("Konfirmasi password tidak sama");
    }
    if (!canEditAll && !canEditSelfOnly) e.push("Tidak memiliki izin mengedit");

    // Non-admin tak boleh ubah username/role/is_active
    // (UI sudah disable, ini validasi backend-side di server juga penting)
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const v = validate();
    if (v.length) {
      setErr(v.join(" • "));
      return;
    }
    setErr("");
    setSaving(true);
    try {
      const patch = {};

      // Admin boleh ubah semua; non-admin hanya beberapa field:
      if (canEditAll) {
        if (form.username.trim() !== (user.username || "")) patch.username = form.username.trim();
        if (form.role !== user.role) patch.role = form.role;
        if (!!form.is_active !== !!user.is_active) patch.is_active = !!form.is_active;
      }

      // Field yang boleh untuk semua (self/admin)
      if ((form.full_name || "") !== (user.full_name || "")) patch.full_name = form.full_name || null;
      if ((form.email || "") !== (user.email || "")) patch.email = form.email || null;
      if (form.password) patch.password = form.password;

      if (Object.keys(patch).length === 0) {
        setErr("Tidak ada perubahan");
        setSaving(false);
        return;
      }

      const url = canEditAll ? `/api/users/${form.id}` : `/api/users/me`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          const field = data?.field || "username/email";
          throw new Error(`${field} sudah digunakan`);
        }
        throw new Error(data?.message || "Gagal memperbarui pengguna");
      }
      onSaved?.(data);
    } catch (e) {
      setErr(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={modal}>
        <div style={header}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Edit Pengguna</h3>
          <button onClick={onClose} style={closeBtn} aria-label="Tutup">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={grid}>
            {/* Username */}
            <Field label="Username *">
              <input
                style={input}
                value={form.username}
                onChange={e => onChange("username", e.target.value)}
                disabled={!canEditAll} // non-admin tidak boleh
              />
            </Field>

            {/* Role */}
            <Field label="Role *">
              <select style={input} value={form.role} onChange={e => onChange("role", e.target.value)} disabled={!canEditAll}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </Field>

            {/* Full name */}
            <Field label="Nama Lengkap">
              <input style={input} value={form.full_name} onChange={e => onChange("full_name", e.target.value)} />
            </Field>

            {/* Email */}
            <Field label="Email">
              <input type="email" style={input} value={form.email} onChange={e => onChange("email", e.target.value)} autoComplete="" />
            </Field>

            {/* Password baru (opsional) */}
            <Field label="Password Baru (opsional)">
              <div style={{ position: "relative" }}>
                <input style={{ ...input, paddingRight: 38 }} type={showPw ? "text" : "password"} value={form.password} onChange={e => onChange("password", e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(v => !v)} style={eyeBtn} aria-label="Toggle password">
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Field>

            <Field label="Konfirmasi Password">
              <div style={{ position: "relative" }}>
                <input style={{ ...input, paddingRight: 38 }} type={showPw2 ? "text" : "password"} value={form.confirm} onChange={e => onChange("confirm", e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw2(v => !v)} style={eyeBtn} aria-label="Toggle confirm password">
                  {showPw2 ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Field>

            {/* Status aktif (admin saja) */}
            <Field label="Status">
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!form.is_active} onChange={e => onChange("is_active", e.target.checked)} disabled={!canEditAll} />
                Aktif
              </label>
            </Field>
          </div>

          {err && <div style={alert}>{err}</div>}

          <div style={footer}>
            <button type="button" onClick={onClose} style={btnSecondary}>
              Batal
            </button>
            <button type="submit" disabled={saving} style={btnPrimary}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- UI kecil ---------- */
function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 };
const modal = { width: "min(720px, 96vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", overflow: "hidden" };
const header = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb" };
const closeBtn = { border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#6b7280" };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 16 };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, outline: "none", boxSizing: "border-box" };
const eyeBtn = { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "#64748b" };
const alert = { margin: "0 16px", marginTop: 4, padding: 10, borderRadius: 8, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b" };
const footer = { display: "flex", justifyContent: "flex-end", gap: 8, padding: 16, borderTop: "1px solid #e5e7eb" };
const btnPrimary = { background: "#007e3a", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
const btnSecondary = { background: "#f1f5f9", color: "#111827", border: "1px solid #e5e7eb", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 };
