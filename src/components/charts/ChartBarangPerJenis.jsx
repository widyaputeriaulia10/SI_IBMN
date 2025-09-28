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

const ChartBarangPerJenis = () => {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);
  const handleExportPNG = () => {
    if (chartRef.current) {
      const base64 = chartRef.current.toBase64Image();
      const link = document.createElement("a");
      link.href = base64;
      link.download = "chart-barang-perjenis.png";
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

        // 🔄 Ambil list tahun dan jenis barang
        const tahunSet = new Set();
        const jenisSet = new Set();

        json.forEach((row) => {
          tahunSet.add(row["Tahun Pengadaan"]);
          jenisSet.add(row["Jenis Barang"]);
        });

        const tahunList = Array.from(tahunSet).sort();
        const jenisList = Array.from(jenisSet);
        const colorPalette = [
          "#006733",
          "#4D96FF",
          "#F4C542",
          "#E74C3C",
          "#9B59B6",
          "#2ECC71",
          "#F39C12",
          "#CD8D7B",
          "#95A5A6",
          "#34495E",
        ];

        const warnaJenisBarang = {};
        jenisList.forEach((jenis, i) => {
          warnaJenisBarang[jenis] = colorPalette[i % colorPalette.length];
        });

        // 🔢 Buat struktur data per jenis per tahun
        const dataMap = {};
        jenisList.forEach((jenis) => {
          dataMap[jenis] = tahunList.map((tahun) => {
            const totalVol = json
              .filter(
                (row) =>
                  row["Jenis Barang"] === jenis &&
                  row["Tahun Pengadaan"] === tahun
              )
              .reduce((sum, row) => sum + row["Vol"], 0);
            return totalVol;
          });
        });

        const datasets = jenisList.map((jenis) => ({
          label: jenis,
          data: dataMap[jenis],
          backgroundColor: warnaJenisBarang[jenis],
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
      legend: {
        position: "bottom",
      },
    },
    scales: {
      y: {
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
        <h3>📦 Chart Jumlah Barang per Jenis per Tahun</h3>
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

export default ChartBarangPerJenis;
