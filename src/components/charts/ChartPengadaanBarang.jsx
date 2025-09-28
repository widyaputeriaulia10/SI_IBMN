import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

Chart.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

const ChartAnggaran = () => {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);
  const handleExportPNG = () => {
    if (chartRef.current) {
      const base64 = chartRef.current.toBase64Image();
      const link = document.createElement("a");
      link.href = base64;
      link.download = "chart-pengadaan.png";
      link.click();
    }
  };
  useEffect(() => {
    fetch("/data/all_data_ibmn_2.xlsx")
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        // Hitung total per tahun
        const totalPerYear = {};
        json.forEach((row) => {
          const tahun = row["Tahun_Perolehan"];
          const total = row["Jumlah_Barang"] || 0;
          if (!totalPerYear[tahun]) totalPerYear[tahun] = 0;
          totalPerYear[tahun] += total;
        });

        const tahunList = Object.keys(totalPerYear).sort();
        const totalList = tahunList.map((t) => totalPerYear[t]);

        // Hitung pertumbuhan YoY (%)
        const growthList = [0]; // tahun pertama tidak punya growth
        for (let i = 1; i < totalList.length; i++) {
          const growth =
            ((totalList[i] - totalList[i - 1]) / totalList[i - 1]) * 100;
          growthList.push(parseFloat(growth.toFixed(2)));
        }

        // Siapkan data chart
        const data = {
          labels: tahunList,
          datasets: [
            {
              type: "line",
              label: "Pertumbuhan (%)",
              data: growthList,
              borderColor: "#FEBF63",
              backgroundColor: "#FEBF63",
              yAxisID: "y2",
            },
            {
              type: "bar",
              label: "Total Barang",
              data: totalList,
              backgroundColor: "#006733",
              yAxisID: "y",
            },
          ],
        };

        setChartData(data);
      });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Total Barang" },
      },
      y2: {
        beginAtZero: true,
        position: "right",
        title: { display: true, text: "Pertumbuhan (%)" },
        grid: { drawOnChartArea: false },
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
        <h3>📦 Chart Pengadaan Barang Pertahun dan Pertumbuhannya</h3>
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
        <Bar ref={chartRef} data={chartData} options={options} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default ChartAnggaran;
