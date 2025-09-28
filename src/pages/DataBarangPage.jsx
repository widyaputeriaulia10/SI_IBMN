import React, { useLayoutEffect, useState } from "react";
import Sidebar from "../components/sidebar";

// import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DetailBarangModal from "../components/DetailBarangModal";
import BarangFormModal from "../components/BarangFormModal";
import "../styles/DataBarangPage.css";
import "../styles/DetailBarang.css";
import { useEffect } from "react";

const dummyData = [
  {
    id: 1,
    kode: "INV-001",
    nama: "Kursi Lipat",
    lokasi: "Ruang 3A",
    gambar: "/kursi-lipat.webp",
  },
  {
    id: 2,
    kode: "INV-002",
    nama: "Meja Belajar",
    lokasi: "Ruang 3A",
    gambar: "/meja.webp",
  },
  {
    id: 3,
    kode: "INV-003",
    nama: "Lemari Arsip",
    lokasi: "Ruang 2B",
    gambar: "/lemari-arsip.jpg",
  },
  {
    id: 4,
    kode: "INV-004",
    nama: "Printer Epson",
    lokasi: "Ruang 1A",
    gambar: "/printer.jpg",
  },
];
const dummyRiwayat = {
  "INV-001": [
    { tanggal: "2023-01-10", keterangan: "Barang dibeli" },
    { tanggal: "2023-05-20", keterangan: "Dipindahkan ke Lab Komputer" },
  ],
  "INV-002": [
    { tanggal: "2022-11-15", keterangan: "Barang dibeli" },
    { tanggal: "2023-03-10", keterangan: "Rusak ringan, sedang perbaikan" },
  ],
  "INV-003": [
    { tanggal: "2023-02-05", keterangan: "Dibeli oleh Bagian Umum" },
    { tanggal: "2023-07-01", keterangan: "Dipindahkan ke Ruang 2B" },
  ],
  "INV-004": [
    { tanggal: "2023-03-12", keterangan: "Barang baru diterima" },
    { tanggal: "2023-06-18", keterangan: "Digunakan di Ruang 1A" },
  ],
};
const DataBarangPage = () => {
  const [search, setSearch] = useState("");
  const [barangList, setBarangList] = useState(dummyData);
  const [riwayatOpen, setRiwayatOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [riwayatData, setRiwayatData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setRiwayatOpen(true);
  };

  // set untuk update
  const [filtered, setFiltered] = useState(dummyData);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const handleSave = (item) => {
    if (editItem) {
      const updated = barangList.map((b) => (b.kode === item.kode ? item : b));
      setBarangList(updated);
    } else {
      setBarangList([...barangList, item]);
    }
  };

  useEffect(() => {
    const debouncetime = setTimeout(() => {
      const filtered = dummyData.filter((item) =>
        item.nama.toLowerCase().includes(search.toLowerCase())
      );

      setFiltered(filtered);
    }, 1000);

    return () => clearTimeout(debouncetime);
  }, [search]);

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <Sidebar />
      <BarangFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        defaultData={editItem}
      />
      <div style={{ padding: "2rem", fontFamily: "Segoe UI", width: "100%" }}>
        <h2>Data Barang Inventaris</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "0.5rem",
              width: "50%",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
          <div></div>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
          style={{
            backgroundColor: "#007e3a",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          + Tambah Barang
        </button>

        <div className="container">
          <div className="grid">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="card"
                onClick={() => handleCardClick(item)}
              >
                <img src={item.gambar} alt={item.nama} className="card-image" />
                <div className="card-content">
                  <div className="card-code">{item.kode}</div>
                  <div className="card-name">{item.nama}</div>
                  <div className="card-location">{item.lokasi}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {riwayatOpen && selectedItem && (
        <DetailBarangModal
          item={selectedItem}
          riwayat={dummyRiwayat[selectedItem.kode] || []}
          onClose={() => setRiwayatOpen(false)}
        />
      )}
    </div>
  );
};
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },

  main: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "2rem",
  },
};
export default DataBarangPage;
