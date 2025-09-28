import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import "../styles/PengaturanPage.css";
import { useNavigate } from "react-router-dom";

const PengaturanPage = () => {
  // const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const stored = localStorage.getItem("darkMode") === "true";
  //   setDarkMode(stored);
  //   document.body.classList.toggle("dark", stored);
  // }, []);

  // const toggleDarkMode = () => {
  //   const newMode = !darkMode;
  //   setDarkMode(newMode);
  //   localStorage.setItem("darkMode", newMode);
  //   document.body.classList.toggle("dark", newMode);
  // };

  const handleLogout = () => {
    //   // Hapus data login di localStorage (jika ada token/login flag)
    //   localStorage.removeItem("token"); // sesuaikan jika kamu menyimpan "token"
    //   localStorage.removeItem("user"); // hapus juga data user jika ada
    // Navigasi ke halaman login
    navigate("/login");
  };
  return (
    <div className="pengaturan-container">
      <Sidebar />

      <div className="pengaturan-content">
        <h2>⚙️ Pengaturan</h2>

        {/* <div className="section">
          <h3>🌙 Mode Tampilan</h3>
          <button onClick={toggleDarkMode} className="toggle-mode-btn">
            {darkMode ? "☀️ Gunakan Light Mode" : "🌙 Gunakan Dark Mode"}
          </button>
        </div> */}

        <div className="section">
          <h3>👤 Informasi Pengguna</h3>
          <p>Nama: Admin UIN Bandung</p>
          <p>Email: admin@uin.ac.id</p>
        </div>

        <div className="section">
          <h3>🔐 Keluar</h3>
          <button className="logout-btn" onClick={handleLogout}>
            Logout 🔓
          </button>
        </div>
      </div>
    </div>
  );
};

export default PengaturanPage;
