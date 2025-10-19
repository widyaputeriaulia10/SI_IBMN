import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function UserFormModal({ isOpen, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
    role: "user",
    is_active: true,
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // reset saat tutup
      setForm({ full_name: "", email: "", username: "", password: "", confirm: "", role: "user", is_active: true });
      setErr("");
      setSubmitting(false);
      setShowPw(false);
      setShowPw2(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const e = [];
    if (!form.username.trim()) e.push("Username wajib diisi");
    if (!form.password) e.push("Password wajib diisi");
    if (form.password && form.password.length < 6) e.push("Password minimal 6 karakter");
    if (form.password !== form.confirm) e.push("Konfirmasi password tidak sama");
    if (!["admin", "user"].includes(form.role)) e.push("Role tidak valid");
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      setErr(errors.join(" • "));
      return;
    }
    setErr("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          role: form.role,
          full_name: form.full_name || null,
          email: form.email || null,
          is_active: !!form.is_active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          const field = data?.field || "username/email";
          throw new Error(`${field} sudah digunakan`);
        }
        throw new Error(data?.message || "Gagal menambah pengguna");
      }
      onSaved?.(data);
    } catch (e) {
      setErr(e.message || "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={modal}>
        <div style={header}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Tambah Pengguna</h3>
          <button onClick={onClose} style={closeBtn} aria-label="Tutup">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={grid}>
            <Field label="Nama Lengkap" placeholder="cth: Admin Sistem">
              <input style={input} value={form.full_name} onChange={e => onChange("full_name", e.target.value)} />
            </Field>

            <Field label="Email" placeholder="cth: admin@kampus.ac.id">
              <input type="email" style={input} value={form.email} onChange={e => onChange("email", e.target.value)} />
            </Field>

            <Field label="Username *" placeholder="cth: admin">
              <input style={input} value={form.username} onChange={e => onChange("username", e.target.value)} required autoComplete="username" />
            </Field>

            <Field label="Role *">
              <select style={input} value={form.role} onChange={e => onChange("role", e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </Field>

            <Field label="Password *">
              <div style={{ position: "relative" }}>
                <input style={{ ...input, paddingRight: 38 }} type={showPw ? "text" : "password"} value={form.password} onChange={e => onChange("password", e.target.value)} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPw(v => !v)} style={eyeBtn} aria-label="Toggle password">
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Field>

            <Field label="Konfirmasi Password *">
              <div style={{ position: "relative" }}>
                <input style={{ ...input, paddingRight: 38 }} type={showPw2 ? "text" : "password"} value={form.confirm} onChange={e => onChange("confirm", e.target.value)} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPw2(v => !v)} style={eyeBtn} aria-label="Toggle confirm password">
                  {showPw2 ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Field>

            <Field label="Status">
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!form.is_active} onChange={e => onChange("is_active", e.target.checked)} />
                Aktif
              </label>
            </Field>
          </div>

          {err && <div style={alert}>{err}</div>}

          <div style={footer}>
            <button type="button" onClick={onClose} style={btnSecondary}>
              Batal
            </button>
            <button type="submit" disabled={submitting} style={btnPrimary}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- small UI bits ---------- */
function Field({ label, children, placeholder }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      {children}
      {placeholder && !children?.props?.value && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{placeholder}</div>}
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 };
const modal = { width: "min(720px, 96vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", overflow: "hidden" };
const header = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e5e7eb" };
const closeBtn = { border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#6b7280" };
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 16 };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, outline: "none" ,boxSizing :"border-box" };
const eyeBtn = { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "#64748b" };
const alert = { margin: "0 16px", marginTop: 4, padding: 10, borderRadius: 8, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b" };
const footer = { display: "flex", justifyContent: "flex-end", gap: 8, padding: 16, borderTop: "1px solid #e5e7eb" };
const btnPrimary = { background: "#007e3a", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
const btnSecondary = { background: "#f1f5f9", color: "#111827", border: "1px solid #e5e7eb", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 };
