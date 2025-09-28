// import React from "react";
import React, { useState } from "react";
import "../styles/LandingPage.css";
import BigNumberCards from "../components/BigNumberCards";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";

import DashboardPage from "./DashboardPage";
import ChartTrendBarang from "../components/charts/ChartTrendBarang";
import ChartAnggaran from "../components/charts/ChartPengadaanBarang";

const LandingPage = () => {
  const navigate = useNavigate();
  const [totalBarang] = useState(123);
  const [jumlahRuang] = useState(12);
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="landing-container">
      <div className="landing-header">
        <div className="logo">FST UIN SGD Bandung</div>
        <nav className="nav-menu">
          {/* <Link to="/">Beranda</Link>
          <Link to="/dashboard">Dashboard</Link> */}
          <Link to="/login" className="btn-login">
            Login
          </Link>
        </nav>
      </div>
      {/* <header className="landing-header">
        <div className="logo">FST UIN SGD Bandung</div>
        <button className="btn-masuk-header" onClick={() => navigate("/login")}>
          Masuk
        </button>
      </header> */}

      <section className="hero-section">
        <div className="hero-left">
          <h1>Sistem Informasi Inventaris Barang Milik Negara</h1>
          <p>
            Aplikasi internal untuk mendukung pengelolaan aset secara efisien
            dan transparan di lingkungan Fakultas Sains dan Teknologi,
            Universitas Islam Negeri Sunan Gunung Djati Bandung. Aplikasi ini
            dikembangkan untuk memudahkan sivitas akademika Fakultas Sains dan
            Teknologi dalam melakukan pencatatan, pelacakan, dan pelaporan
            barang milik negara secara terpusat dan terintegrasi.
          </p>
          <div className="hero-buttons">
            <button className="btn-masuk" onClick={() => navigate("/login")}>
              Masuk ke Sistem
            </button>
          </div>
        </div>
        <div className="hero-right">
          {/* <img
            src="\f-web-2-rb.png"
            alt="Ilustrasi Inventaris"
            className="hero-image"
          /> */}
          <img
            src="\f-web-2-rb.png" // pastikan file di public/images
            alt="Ilustrasi Inventaris"
            className="hero-image"
          />
        </div>
      </section>

      <section className="features-section">
        <div className="feature-box">
          <i className="icon">📦</i>
          <h4>Pencatatan Data Barang</h4>
          <p>Input data aset kampus secara akurat dan terstruktur.</p>
        </div>

        <div className="feature-box">
          <i className="icon">🗑️</i>
          <h4>Hapus Data Barang</h4>
          <p>Kelola penghapusan aset yang tidak lagi digunakan dengan aman.</p>
        </div>

        <div className="feature-box">
          <i className="icon">📊</i>
          <h4>Laporan Otomatis</h4>
          <p>Hasilkan laporan inventaris secara real-time dan siap unduh.</p>
        </div>
      </section>

      <section className="cta-section">
        <div className="summary-box">
          {/* Tempatkan chart di sini jika sudah ada */}
          <div className="summary-chart">
            <h3>Summary Data IBMN</h3>
            <BigNumberCards
              totalBarang={totalBarang}
              jumlahRuang={jumlahRuang}
            />
            <div className="summary-chart" style={{ width: "100%" }}>
              {/* <h3>Summary Data IBMN</h3> */}
              <div style={styles.container}>
                <div style={styles.card}>
                  {/* <p style={styles.label}>Diagram Pengadaan</p> */}
                  <ChartAnggaran />
                </div>
                <div style={styles.card}>
                  {/* <p style={styles.label}>Diagram Tren Barang </p> */}
                  <ChartTrendBarang />
                </div>
                {/* <div style={styles.card}>
             <ChartBarangPerTipe/>
              <p style={styles.label}>📅 Tahun Pengadaan Terbaru</p>
              <h1 style={styles.value}>
                </h1>
            </div> */}
              </div>
            </div>
          </div>
          {/* <div className="hero-buttons" style={{ marginTop: "2rem" }}>
            <Link to="/login">
              <button className="btn-outline">Login</button>
            </Link>
          </div> */}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-info">
          <span>
            Fakultas Sains dan Teknologi - UIN Sunan Gunung Djati Bandung
          </span>
          <span>Jl. A.H. Nasution No.105, Bandung</span>
          <span> Kontak: (022) 7800525 | Email: fst@uinsgd.ac.id</span>
        </div>
        <div className="footer-bottom">
          <span>© 2025 FST UIN SGD Bandung</span>
          <span> Dikembangkan oleh: Widya Puteri Aulia, S.Kom., </span>
        </div>
      </footer>
    </div>
  );
};
const styles = {
  container: {
    display: "flex",
    gap: "2rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "1.5rem 2rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
  },
  label: {
    fontSize: "1.1rem",
    color: "#555",
    marginBottom: "0.5rem",
  },
  value: {
    fontSize: "2.5rem",
    color: "#2c3e50",
    margin: 0,
  },
};

export default LandingPage;
