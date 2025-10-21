// import React, { useEffect, useState, useRef } from "react";
// import * as XLSX from "xlsx";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart,
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Legend,
//   Tooltip,
// } from "chart.js";

// Chart.register(
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Legend,
//   Tooltip
// );

// const ChartAnggaran = () => {
//   const [chartData, setChartData] = useState(null);
//   const chartRef = useRef(null);
//   const handleExportPNG = () => {
//     if (chartRef.current) {
//       const base64 = chartRef.current.toBase64Image();
//       const link = document.createElement("a");
//       link.href = base64;
//       link.download = "chart-pengadaan.png";
//       link.click();
//     }
//   };
//   useEffect(() => {
//     fetch("/data/all_data_ibmn_2.xlsx")
//       .then((res) => res.arrayBuffer())
//       .then((arrayBuffer) => {
//         const workbook = XLSX.read(arrayBuffer, { type: "array" });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const json = XLSX.utils.sheet_to_json(sheet);

//         // Hitung total per tahun
//         const totalPerYear = {};
//         json.forEach((row) => {
//           const tahun = row["Tahun_Perolehan"];
//           const total = row["Jumlah_Barang"] || 0;
//           if (!totalPerYear[tahun]) totalPerYear[tahun] = 0;
//           totalPerYear[tahun] += total;
//         });

//         const tahunList = Object.keys(totalPerYear).sort();
//         const totalList = tahunList.map((t) => totalPerYear[t]);

//         // Hitung pertumbuhan YoY (%)
//         // const growthList = [0]; // tahun pertama tidak punya growth
//         // for (let i = 1; i < totalList.length; i++) {
//         //   const growth =
//         //     ((totalList[i] - totalList[i - 1]) / totalList[i - 1]) * 100;
//         //   growthList.push(parseFloat(growth.toFixed(2)));
//         // }

//         // Siapkan data chart
//         const data = {
//           labels: tahunList,
//           datasets: [
//             // {
//             //   type: "line",
//             //   label: "Pertumbuhan (%)",
//             //   data: growthList,
//             //   borderColor: "#FEBF63",
//             //   backgroundColor: "#FEBF63",
//             //   yAxisID: "y2",
//             // },
//             {
//               type: "bar",
//               label: "Total Barang",
//               data: totalList,
//               backgroundColor: "#006733",
//               yAxisID: "y",
//             },
//           ],
//         };

//         setChartData(data);
//       });
//   }, []);

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { position: "bottom" },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: { display: true, text: "Total Barang" },
//       },
//       // y2: {
//       //   beginAtZero: true,
//       //   position: "right",
//       //   title: { display: true, text: "Pertumbuhan (%)" },
//       //   grid: { drawOnChartArea: false },
//       // },
//     },
//   };

//   return (
//     <div>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "1rem",
//         }}
//       >
//         <h3>📦 Chart Pengadaan Barang Pertahun</h3>
//         <button
//           onClick={handleExportPNG}
//           style={{
//             backgroundColor: "#007E3A", // Hijau khas UIN
//             color: "white",
//             border: "none",
//             padding: "0.4rem 0.8rem",
//             borderRadius: "6px",
//             cursor: "pointer",
//             fontSize: "0.9rem",
//             display: "flex",
//             alignItems: "center",
//             gap: "0.5rem",
//             boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
//             transition: "background-color 0.3s ease",
//           }}
//           onMouseOver={(e) =>
//             (e.currentTarget.style.backgroundColor = "#006733")
//           }
//           onMouseOut={(e) =>
//             (e.currentTarget.style.backgroundColor = "#007E3A")
//           }
//           onMouseEnter={() => setShowTooltip(true)}
//           onMouseLeave={() => setShowTooltip(false)}
//           title="Cetak Gambar" // jika ingin tooltip bawaan browser
//         >
//           🖨️
//         </button>
//       </div>
//       {chartData ? (
//         <Bar ref={chartRef} data={chartData} options={options} />
//       ) : (
//         <p>Loading chart...</p>
//       )}
//     </div>
//   );
// };

// export default ChartAnggaran;

import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

Chart.register(
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
      // Cek apakah instance Chart tersedia
      const chartInstance = chartRef.current;
      const base64 =
        chartInstance.toBase64Image?.() ||
        chartInstance.canvas?.toDataURL("image/png");

      if (base64) {
        const link = document.createElement("a");
        link.href = base64;
        link.download = "chart-pengadaan.png";
        link.click();
      } else {
        console.error("Chart reference tidak valid untuk diekspor.");
      }
    }
  };

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    // Pilih salah satu:
    // 1) Langsung ke server Express:
    const url = "/api/inventaris/by-year";
    // 2) Kalau sudah set proxy Vite (lihat saran sebelumnya), pakai:
    // const url = "/local-api/inventaris/by-year";

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(map => {
        if (!alive) return;

        // Normalisasi: pastikan angka & urut by tahun (opsional)
        const normalized = Object.fromEntries(
          Object.entries(map)
            .filter(([year, total]) => year && total != null)
            .map(([year, total]) => [String(year), Number(total)])
            .sort((a, b) => Number(a[0]) - Number(b[0]))
        );

        const tahunList = Object.keys(normalized).sort();
        const totalList = tahunList.map(t => normalized[t]);

        // Siapkan data untuk Line Chart
        const data = {
          labels: tahunList,
          datasets: [
            {
              label: "Total Barang",
              data: totalList,
              borderColor: "#007E3A",
              backgroundColor: "#007E3A",
              tension: 0.3, // garis agak melengkung
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        };

        setChartData(data);
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error("Gagal memuat data:", err);
        }
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);
  // useEffect(() => {
  //   fetch("/data/all_data_ibmn_2.xlsx")
  //     .then(res => res.arrayBuffer())
  //     .then(arrayBuffer => {
  //       const workbook = XLSX.read(arrayBuffer, { type: "array" });
  //       const sheet = workbook.Sheets[workbook.SheetNames[0]];
  //       const json = XLSX.utils.sheet_to_json(sheet);

  //       // Hitung total per tahun

  //       const totalPerYear = {};
  //       json.forEach(row => {
  //         const tahun = row["Tahun_Perolehan"];
  //         const total = row["Jumlah_Barang"] || 0;
  //         if (!totalPerYear[tahun]) totalPerYear[tahun] = 0;
  //         totalPerYear[tahun] += total;
  //       });

  //       console.log("totalPerYear", totalPerYear);

  //       const tahunList = Object.keys(totalPerYear).sort();
  //       const totalList = tahunList.map(t => totalPerYear[t]);

  //       // Hitung pertumbuhan YoY (%)
  //       const growthList = [0]; // tahun pertama tidak punya growth
  //       for (let i = 1; i < totalList.length; i++) {
  //         const growth = ((totalList[i] - totalList[i - 1]) / totalList[i - 1]) * 100;
  //         growthList.push(parseFloat(growth.toFixed(2)));
  //       }

  //       // Siapkan data chart
  //       const data = {
  //         labels: tahunList,
  //         datasets: [
  //           {
  //             type: "line",
  //             label: "Pertumbuhan (%)",
  //             data: growthList,
  //             borderColor: "#FEBF63",
  //             backgroundColor: "#FEBF63",
  //             yAxisID: "y2",
  //           },
  //           {
  //             type: "bar",
  //             label: "Total Barang",
  //             data: totalList,
  //             backgroundColor: "#006733",
  //             yAxisID: "y",
  //           },
  //         ],
  //       };

  //       setChartData(data);
  //     });
  // }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 150,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Total Barang" },
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
        <h3>📈 Trend Pengadaan Barang per Tahun</h3>
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
          title="Cetak Gambar"
        >
          🖨️
        </button>
      </div>
      {chartData ? (
        <Line ref={chartRef} data={chartData} options={options} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default ChartAnggaran;
