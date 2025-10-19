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
    let aborted = false;

    // Pakai full URL biar gak bentrok sama proxy Vite-mu yang /api ke ThingWorx
    fetch("/api/inventaris/stats")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ Total_Barang, Jumlah_Ruangan, Tahun_Terbaru }) => {
        if (aborted) return;

        setTotalBarang(Number(Total_Barang) || 0);
        setJumlahRuang(Number(Jumlah_Ruangan) || 0);
        setTahunTerbaru(Tahun_Terbaru === null || Tahun_Terbaru === undefined ? null : Number(Tahun_Terbaru));
      })
      .catch(err => console.error("Gagal memuat stats:", err));

    return () => {
      aborted = true;
    };
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
