import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const ChartKondisiBarang = () => {
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
  useEffect(() => {
    fetch("/data/Dummy_BMN_50_Data.xlsx")
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const tahunSet = new Set();
        const kondisiList = ["Baik", "Rusak", "Hilang"];
        const jenisList = [...new Set(json.map((row) => row["Jenis Barang"]))];
        const tahunList = [
          ...new Set(json.map((row) => row["Tahun Pengadaan"])),
        ].sort();

        // Buat struktur data: { kondisi -> [jumlah per tahun] }
        const dataPerKondisi = {};
        kondisiList.forEach((kondisi) => {
          dataPerKondisi[kondisi] = tahunList.map((tahun) => {
            return json
              .filter(
                (row) =>
                  row["Tahun Pengadaan"] === tahun && row["Keadaan"] === kondisi
              )
              .reduce((sum, row) => sum + row["Vol"], 0);
          });
        });

        const colors = {
          Baik: "#4D96FF",
          Rusak: "#FF6B6B",
          Hilang: "#F9D923",
        };

        const datasets = kondisiList.map((kondisi) => ({
          label: kondisi,
          data: dataPerKondisi[kondisi],
          backgroundColor: colors[kondisi],
        }));

        setChartData({
          labels: tahunList,
          datasets,
        });
      });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      x: {
        stacked: true,
        title: { display: true, text: "Tahun Pengadaan" },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: "Jumlah Barang" },
      },
    },
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3>📊 Keadaan Barang per Tahun Pengadaan</h3>
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
      {chartData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default ChartKondisiBarang;
