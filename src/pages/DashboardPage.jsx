// import React from "react";
import React, { useState } from "react";
import "../styles/DashboardPage.css";
import BigNumberCards from "../components/BigNumberCards";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";

import ChartTrendBarang from "../components/charts/ChartTrendBarang";
import ChartAnggaran from "../components/charts/ChartPengadaanBarang";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [totalBarang] = useState(123);
  const [jumlahRuang] = useState(12);
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="landing-container">
     
      <section className="hero-section">
        {/* <h1>Dasbor BMN Fakultas Sains dan Teknologi</h1> */}
        {/* <p>Transparansi Pengelolaan Aset di Fakultas Sains dan Teknologi</p> */}

        {/* Tempatkan chart di sini jika sudah ada */}
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
      </section>

      {/* <section className="features-section">
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
        <div className="summary-box"></div>
      </section>

  */}
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

export default DashboardPage;
