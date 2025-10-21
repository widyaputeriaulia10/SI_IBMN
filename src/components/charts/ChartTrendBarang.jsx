import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from "chart.js";

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

const ChartTrendBarang = () => {
  const [chartData, setChartData] = useState(null);
  const [tahunList, setTahunList] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [dataMap, setDataMap] = useState({});
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
    let alive = true;
    const controller = new AbortController();

    // Pilih salah satu:
    // 1) Langsung ke server Express:
    const url = "/api/inventaris/years";
    // 2) Jika sudah set proxy Vite (/local-api -> http://localhost:4000):
    // const url = "/local-api/inventaris/years";

    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // expected: [2002, 2006, ...]
        if (!alive) return;

        // Normalisasi: pastikan number & urut (harusnya sudah urut dari SQL)
        const normalized = (Array.isArray(data) ? data : [])
          .map(Number)
          .filter(n => !Number.isNaN(n))
          .sort((a, b) => a - b);

        setTahunList(normalized);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Gagal memuat years:", e);
        }
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    // Pilih salah satu:
    const url = "/api/inventaris/floors";
    // atau jika pakai proxy Vite seperti sebelumnya:
    // const url = "/local-api/inventaris/floors";

    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // expected: [1,2,3,4,...]
        if (!alive) return;

        // Normalisasi (pastikan number & urut)
        const normalized = (Array.isArray(data) ? data : [])
          .map(Number)
          .filter(n => !Number.isNaN(n))
          .sort((a, b) => a - b);

        setJenisList(normalized);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Gagal memuat floors:", e);
        }
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    // Pilih salah satu:
    const url = "/api/inventaris/matrix";
    // Jika pakai proxy Vite seperti sebelumnya:
    // const url = "/local-api/inventaris/matrix";

    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // expected: { "1":[...], "2":[...], ... }
        if (!alive) return;

        // Normalisasi ringan: pastikan array berisi number
        const normalized = Object.fromEntries(Object.entries(data || {}).map(([k, arr]) => [String(k), (Array.isArray(arr) ? arr : []).map(n => Number(n) || 0)]));

        setDataMap(normalized);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Gagal memuat matrix:", e);
        }
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (tahunList.length > 0 && jenisList.length > 0 && Object.keys(dataMap).length > 0) {
      const colorPalette = ["#006733", "#4D96FF", "#F4C542", "#E74C3C", "#9B59B6", "#2ECC71", "#F39C12", "#CD8D7B", "#95A5A6", "#34495E"];

      const warnaJenisBarang = {};
      jenisList.forEach((jenis, i) => {
        warnaJenisBarang[jenis] = colorPalette[i % colorPalette.length];
      });

      const datasets = jenisList.map(jenis => ({
        label: jenis,
        data: dataMap[jenis],
        fill: false,
        borderColor: warnaJenisBarang[jenis],
        backgroundColor: warnaJenisBarang[jenis],
        tension: 0.2,
      }));

      setChartData({
        labels: tahunList,
        datasets,
      });
    }
  }, [tahunList, jenisList, dataMap]);

  // useEffect(() => {
  //   fetch("/data/all_data_ibmn_2.xlsx")
  //     .then(res => res.arrayBuffer())
  //     .then(arrayBuffer => {
  //       const workbook = XLSX.read(arrayBuffer, { type: "array" });
  //       const sheet = workbook.Sheets[workbook.SheetNames[0]];
  //       const json = XLSX.utils.sheet_to_json(sheet);

  //       const tahunSet = new Set();
  //       const jenisSet = new Set();

  //       json.forEach(row => {
  //         tahunSet.add(row["Tahun_Perolehan"]);
  //         jenisSet.add(row["Lantai"]);
  //       });

  //       const tahunList = Array.from(tahunSet).sort();
  //       const jenisList = Array.from(jenisSet);

  //       const dataMap = {};
  //       jenisList.forEach(jenis => {
  //         dataMap[jenis] = tahunList.map(tahun => {
  //           return json.filter(row => row["Lantai"] === jenis && row["Tahun_Perolehan"] === tahun).reduce((sum, row) => sum + row["Jumlah_Barang"], 0);
  //         });
  //       });

  //       const colorPalette = ["#006733", "#4D96FF", "#F4C542", "#E74C3C", "#9B59B6", "#2ECC71", "#F39C12", "#CD8D7B", "#95A5A6", "#34495E"];

  //       const warnaJenisBarang = {};
  //       jenisList.forEach((jenis, i) => {
  //         warnaJenisBarang[jenis] = colorPalette[i % colorPalette.length];
  //       });

  //       const datasets = jenisList.map((jenis, idx) => ({
  //         label: jenis,
  //         data: dataMap[jenis],
  //         fill: false,
  //         borderColor: warnaJenisBarang[jenis],
  //         backgroundColor: warnaJenisBarang[jenis],
  //         tension: 0.2,
  //       }));

  //       setChartData({
  //         labels: tahunList,
  //         datasets,
  //       });
  //     });
  // }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 150,
    plugins: {
      legend: { position: "bottom" },
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
        <h3>📈 Trend Jumlah Barang per Jenis per Tahun</h3>
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
          onMouseOver={e => (e.currentTarget.style.backgroundColor = "#006733")}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = "#007E3A")}
          // onMouseEnter={() => setShowTooltip(true)}
          // onMouseLeave={() => setShowTooltip(false)}
          title="Cetak Gambar" // jika ingin tooltip bawaan browser
        >
          🖨️
        </button>
      </div>
      <div style={{ position: "relative", width: "100%", height: 420 }}>{chartData ? <Line ref={chartRef}  data={chartData} options={options} /> : <p>Loading chart...</p>}</div>{" "}
    </div>
  );
};

export default ChartTrendBarang;
