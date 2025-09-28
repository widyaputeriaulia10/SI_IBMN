// import React from "react";

// const BigNumberCards = ({ totalBarang, totalAnggaran }) => {
//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <p style={styles.label}>📦 Total Barang</p>
//         <h1 style={styles.value}>{totalBarang.toLocaleString("id-ID")}</h1>
//       </div>
//       <div style={styles.card}>
//         <p style={styles.label}>💰Total Anggaran</p>
//         <h1 style={styles.value}>Rp {totalAnggaran.toLocaleString("id-ID")}</h1>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     display: "flex",
//     gap: "2rem",
//     marginBottom: "2rem",
//     flexWrap: "wrap",
//   },
//   card: {
//     flex: 1,
//     backgroundColor: "#ffffff",
//     borderRadius: "12px",
//     padding: "1.5rem 2rem",
//     boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
//     textAlign: "center",
//   },
//   label: {
//     fontSize: "1.1rem",
//     color: "#555",
//     marginBottom: "0.5rem",
//   },
//   value: {
//     fontSize: "2.5rem",
//     color: "#2c3e50",
//     margin: 0,
//   },
// };

// export default BigNumberCards;

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const BigNumberCards = () => {
  const [totalBarang, setTotalBarang] = useState(0);
  const [jumlahRuang, setJumlahRuang] = useState(0);
  const [tahunTerbaru, setTahunTerbaru] = useState(0);

  useEffect(() => {
    fetch("/data/all_data_ibmn_2.xlsx") // letakkan file ini di /public/data/
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Hitung total barang
        const total = data.reduce(
          (sum, row) => sum + (Number(row["Jumlah_Barang"]) || 0),
          0
        );
        setTotalBarang(total);

        // Hitung jumlah ruang unik
        const ruangSet = new Set(
          data.map((row) => row["Nama_Ruangan"]).filter(Boolean)
        );
        setJumlahRuang(ruangSet.size);

        const tahunList = data
          .map((row) => Number(row["Tahun_Perolehan"]))
          .filter((tahun) => !isNaN(tahun));
        const maxTahun = Math.max(...tahunList);
        setTahunTerbaru(maxTahun);
      })
      .catch((err) => console.error("Gagal memuat data:", err));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p style={styles.label}>📦 Total Barang</p>
        <h1 style={styles.value}>{totalBarang.toLocaleString("id-ID")}</h1>
      </div>
      <div style={styles.card}>
        <p style={styles.label}>🏢 Jumlah Ruangan</p>
        <h1 style={styles.value}>{jumlahRuang}</h1>
      </div>
      <div style={styles.card}>
        <p style={styles.label}>📅 Tahun Pengadaan Terbaru</p>
        <h1 style={styles.value}>{tahunTerbaru}</h1>
      </div>
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

export default BigNumberCards;
