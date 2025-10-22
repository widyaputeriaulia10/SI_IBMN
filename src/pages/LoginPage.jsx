import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/LoginPage.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/management-barang";

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleLogin = async e => {
    e.preventDefault();
    setErrMsg("");

    if (!form.username.trim() || !form.password) {
      setErrMsg("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // penting: simpan cookie session
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Login gagal.");
      }

      // jika perlu simpan user:
      // localStorage.setItem("user", JSON.stringify(data.user));

      navigate(from, { replace: true });
    } catch (err) {
      setErrMsg(err.message || "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/logo-uin.png" alt="Logo UIN" className="login-logo" />
        <h2 className="login-title">Sistem Informasi Inventaris Barang Milik Negara</h2>
        <p className="login-subtitle">
          Fakultas Sains dan Teknologi
          <br />
          UIN Sunan Gunung Djati Bandung
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <input type="text" placeholder="Username" className="login-input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} autoComplete="username" />

          <div className="password-field">
            <input type={showPassword ? "text" : "password"} placeholder="Password" className="login-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="current-password" style={{ width: "100%", boxSizing: "border-box" }} />
            <button type="button" className="toggle-password" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {errMsg && (
            <div className="login-error" style={{ color: "#dc2626", marginTop: 8 }}>
              {errMsg}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {/* <p className="login-note">
          Belum punya akun? <a href="#">Hubungi admin</a>
        </p> */}
      </div>

      <div className="img-container">
        <img src="/login-ilust.webp" alt="Logo Overlay" className="logo-overlay" style={{ width: "585px" }} />
      </div>

      <div className="login-right">
        <img src="/login-bg.png" alt="Login Illustration" className="login-illustration" />
      </div>
    </div>
  );
};

export default LoginPage;
