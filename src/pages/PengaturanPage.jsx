// src/pages/PengaturanPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const initialPrefs = () => {
  try {
    const raw = localStorage.getItem("prefs");
    return raw ? JSON.parse(raw) : { theme: "light", pageSize: 10 };
  } catch {
    return { theme: "light", pageSize: 10 };
  }
};

export default function PengaturanPage() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // profile form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // prefs
  const [prefs, setPrefs] = useState(initialPrefs());
  const [savingPrefs, setSavingPrefs] = useState(false);
  const isDark = useMemo(() => prefs.theme === "dark", [prefs.theme]);

  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const r = await fetch("/auth/me", { credentials: "include" });
        if (!r.ok) throw new Error("Gagal memuat profil");
        const u = await r.json();
        if (cancel) return;
        setMe(u);
        setFullName(u.full_name || "");
        setEmail(u.email || "");
      } catch (e) {
        if (!cancel) setErr(e.message || "Terjadi kesalahan");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // apply theme immediately when toggle
  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
  }, [isDark]);

  const saveProfile = async e => {
    e.preventDefault();
    setProfileMsg("");
    setErr("");

    if (newPw && newPw.length < 6) {
      setErr("Password baru minimal 6 karakter");
      return;
    }
    if (newPw && newPw !== newPw2) {
      setErr("Konfirmasi password tidak sama");
      return;
    }

    // build patch only changed
    const patch = {};
    if ((fullName || "") !== (me?.full_name || "")) patch.full_name = fullName || null;
    if ((email || "") !== (me?.email || "")) patch.email = email || null;
    if (newPw) patch.password = newPw;

    if (Object.keys(patch).length === 0) {
      setProfileMsg("Tidak ada perubahan");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gagal menyimpan profil");

      setMe(data);
      setNewPw("");
      setNewPw2("");
      setProfileMsg("Profil diperbarui");
    } catch (e) {
      setErr(e.message || "Gagal menyimpan profil");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      const next = { ...prefs };
      localStorage.setItem("prefs", JSON.stringify(next));
      document.body.classList.toggle("dark", next.theme === "dark");
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <Sidebar />
        <main style={main}>
          <h2 style={title}>⚙️ Pengaturan</h2>
          <div style={skeleton} />
          <div style={skeleton} />
        </main>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <Sidebar />
      <main style={main}>
        <h2 style={title}>⚙️ Pengaturan</h2>

        {err && <div style={alertErr}>{err}</div>}
        {profileMsg && <div style={alertOk}>{profileMsg}</div>}

        <div style={grid}>
          {/* Profil */}
          <section style={card}>
            <div style={cardHead}>
              <strong>👤 Informasi Pengguna</strong>
              <small style={{ color: "#64748b" }}>{me?.role?.toUpperCase()}</small>
            </div>

            <form onSubmit={saveProfile} style={{ display: "grid", gap: 12 }}>
              <Field label="Nama lengkap">
                <input style={input} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="mis. Admin UIN Bandung" />
              </Field>

              <Field label="Email">
                <input type="email" style={input} value={email} onChange={e => setEmail(e.target.value)} placeholder="mis. admin@uin.ac.id" />
              </Field>

              <div style={{ height: 1, background: "#e5e7eb", margin: "8px 0" }} />

              <Field label="Password baru (opsional)">
                <div style={pwWrap}>
                  <input type={showPw1 ? "text" : "password"} style={input} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Minimal 6 karakter" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw1(v => !v)} aria-label={showPw1 ? "Sembunyikan password" : "Tampilkan password"} title={showPw1 ? "Sembunyikan password" : "Tampilkan password"} style={pwToggle}>
                    {showPw1 ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </Field>

              <Field label="Konfirmasi password">
                <div style={pwWrap}>
                  <input type={showPw2 ? "text" : "password"} style={input} value={newPw2} onChange={e => setNewPw2(e.target.value)} placeholder="Ulangi password baru" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw2(v => !v)} aria-label={showPw2 ? "Sembunyikan password" : "Tampilkan password"} title={showPw2 ? "Sembunyikan password" : "Tampilkan password"} style={pwToggle}>
                    {showPw2 ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </Field>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button type="submit" style={btnPrimary} disabled={savingProfile}>
                  {savingProfile ? "Menyimpan…" : "Simpan Profil"}
                </button>
              </div>
            </form>
          </section>

          {/* Preferensi */}
          {/* <section style={card}>
            <div style={cardHead}>
              <strong>🎛️ Preferensi Aplikasi</strong>
              <small style={{ color: "#64748b" }}>Disimpan di perangkat ini</small>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Tema">
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => setPrefs(p => ({ ...p, theme: "light" }))} style={{ ...btnToggle, ...(prefs.theme === "light" ? btnToggleActive : null) }} aria-pressed={prefs.theme === "light"}>
                    Terang
                  </button>
                  <button type="button" onClick={() => setPrefs(p => ({ ...p, theme: "dark" }))} style={{ ...btnToggle, ...(prefs.theme === "dark" ? btnToggleActive : null) }} aria-pressed={prefs.theme === "dark"}>
                    Gelap
                  </button>
                </div>
              </Field>

              <Field label="Jumlah baris per halaman (tabel)">
                <select style={input} value={prefs.pageSize} onChange={e => setPrefs(p => ({ ...p, pageSize: Number(e.target.value) }))}>
                  {[10, 20, 50, 100].map(n => (
                    <option key={n} value={n}>
                      {n} baris
                    </option>
                  ))}
                </select>
              </Field>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={savePrefs} style={btnSecondary} disabled={savingPrefs}>
                  {savingPrefs ? "Menyimpan…" : "Simpan Preferensi"}
                </button>
              </div>
            </div>
          </section> */}

          {/* Keamanan / sesi */}
          <section style={card}>
            <div style={cardHead}>
              <strong>🔐 Keamanan</strong>
            </div>
            <p style={{ marginTop: 0, color: "#475569" }}>Kamu dapat keluar dari perangkat ini. </p>
            <div>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  try {
                    await fetch("/auth/logout", { method: "POST", credentials: "include" });
                    window.location.href = "/login";
                  } catch {}
                }}
              >
                <button type="submit" style={btnDanger}>
                  Logout
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------- kecil-kecil UI ---------- */
function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
      {children}
    </label>
  );
}

/* ---------- styles ---------- */
const pwWrap = { position: "relative" };
const pwToggle = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#64748b",
  padding: 4,
  lineHeight: 0,
};

const pageWrap = { display: "flex", minHeight: "100dvh", background: "#fff" };
const main = { flex: 1, padding: "24px", maxWidth: 1100, marginInline: "auto" };
const title = { margin: "6px 0 18px", fontSize: 22 };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
};

const card = {
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
};

const cardHead = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
};

const input = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  boxSizing :"border-box",
  outline: "none",
  background: "#fff",
};

const btnPrimary = {
  background: "#007e3a",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = {
  background: "#0ea5e9",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
};

const btnDanger = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
};

const btnToggle = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#111827",
  padding: "8px 12px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 600,
};
const btnToggleActive = {
  background: "#e9f5f2",
  color: "#0f766e",
  borderColor: "#0f766e",
};

const alertErr = { padding: 10, borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", marginBottom: 12 };
const alertOk = { padding: 10, borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0", color: "#14532d", marginBottom: 12 };

const skeleton = {
  height: 110,
  borderRadius: 12,
  background: "linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)",
  animation: "pulse 1.2s infinite",
};
