// import React from "react";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Sidebar from "../components/sidebar";
import ChartAnggaran from "../components/charts/ChartPengadaanBarang";
import ChartBarangPerJenis from "../components/charts/ChartBarangPerJenis";
import ChartBarangPerTipe from "../components/charts/ChartBarangPerTipe";
import ChartTrendBarang from "../components/charts/ChartTrendBarang";
import ChartKondisiBarang from "../components/charts/ChartKondisiBarang";
import BigNumberCards from "../components/BigNumberCards";
import ProgresPerbaikan from "../components/charts/ProgresPerbaikan";

import "../styles/DashboardPage.css";

const DashboardPage = () => {
  const [totalBarang, setTotalBarang] = useState(0);
  const [totalAnggaran, setTotalAnggaran] = useState(0);
  const [laporan, setLaporan] = useState([]);
  useEffect(() => {
    fetch("/data/Dummy_BMN_50_Data.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        const jumlahBarang = data.reduce(
          (sum, row) => sum + (row["Vol"] || 0),
          0
        );
        const jumlahAnggaran = data.reduce(
          (sum, row) => sum + (row["Jumlah Total"] || 0),
          0
        );

        setTotalBarang(jumlahBarang);
        setTotalAnggaran(jumlahAnggaran);
      });
  }, []);
  useEffect(() => {
    fetch("data/data_dummy_laporan_kerusakan.xlsx")
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        setLaporan(json); // simpan ke state
      })
      .catch((error) => console.error("Gagal load Excel:", error));
  }, []);
  return (
    <div style={styles.container}>
      {/* Main Content */}
      <Sidebar />
      <main style={styles.main}>
        <h2 style={{ marginBottom: "1rem" }}>
          Selamat datang di Sistem BMN FST
        </h2>
        <BigNumberCards
          totalBarang={totalBarang}
          totalAnggaran={totalAnggaran}
        />
        <div className="chart-grid">
          <div className="chart-card">
            <ChartAnggaran />
          </div>
          <div className="chart-card">
            <ChartBarangPerJenis />
          </div>
          <div className="chart-card">
            <ChartBarangPerTipe />
          </div>
          <div className="chart-card">
            <ChartTrendBarang />
          </div>
          <div className="chart-card">
            <ChartKondisiBarang />
          </div>
          <div className="chart-card">
            <ProgresPerbaikan />
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    borderRight: "1px solid #dee2e6",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    marginBottom: "2rem",
    gap: "0.75rem",
  },
  avatar: {
    width: "40px",
    height: "40px",
    backgroundColor: "#007e3a",
    borderRadius: "50%",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  active: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: "#e9ecef",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "bold",
    color: "#007e3a",
  },
  main: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "2rem",
  },
};

export default DashboardPage;
