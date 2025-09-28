import React, { useEffect, useState, useRef } from "react";
import ReactSpeedometer from "react-d3-speedometer";
import { FaTachometerAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
const ProgresPerbaikan = () => {
  const [laporan, setLaporan] = useState([]);
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);
  const handleExportPNG = () => {
    if (chartRef.current) {
      const base64 = chartRef.current.toBase64Image();
      const link = document.createElement("a");
      link.href = base64;
      link.download = "chart-barang-pertipe.png";
      link.click();
    }
  };
  // kalau ada useEffect harus di panggil di atas
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

  const totalLaporan = laporan.length;
  const jumlahSelesai = laporan.filter(
    (item) => item.Status === "Selesai"
  ).length;
  const persentaseSelesai = totalLaporan > 0 ? jumlahSelesai / totalLaporan : 0;
  return (
    <div>
      <div
        style={{
          display: "absolute",
          justifyContent: "center",
          alignItems: "center",
          height: "200px", // atau sesuai tinggi card kamu
          marginTop: "1rem",
        }}
      >
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FaTachometerAlt /> Progress Perbaikan Barang
        </h3>
        <button
          onClick={handleExportPNG}
          style={{
            backgroundColor: "#007E3A", // Hijau khas UIN
            color: "white",
            border: "none",
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#006733")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#007E3A")
          }
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          title="Cetak Gambar" // jika ingin tooltip bawaan browser
        >
          🖨️
        </button>
      </div>
      <ReactSpeedometer
        value={Math.round(persentaseSelesai * 100)}
        minValue={0}
        maxValue={100}
        segments={5}
        needleColor="steelblue"
        startColor="#FF471A"
        endColor="#006733"
        textColor="#000000"
        currentValueText="Progress: ${value}%"
        height={200}
      />
    </div>
  );
};

export default ProgresPerbaikan;
