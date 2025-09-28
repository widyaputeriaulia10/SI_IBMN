// File: src/pages/LaporanMasalahPage.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import "../styles/LaporanMasalah.css";
import * as XLSX from "xlsx";
import DetailBarangModal from "../components/DetailBarangModal";
import DetailLaporanModal from "../components/DetailLaporanModal";
import TambahLaporanModal from "../components/TambahlaporanModal";

const LaporanMasalahPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [laporan, setLaporan] = useState([]);

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
  const getColor = (status) => {
    switch (status) {
      case "Belum Ditangani":
        return "red";
      case "Ditangani":
        return "orange";
      case "Selesai":
        return "green";
      default:
        return "black";
    }
  };
  // Fungsi handleSelesai
  const handleSelesai = (id) => {
    const updated = laporan.map((item) =>
      item.id === id ? { ...item, Status: "Selesai" } : item
    );
    setLaporan(updated);
    setSelectedLaporan(null);
  };

  // Fungsi handleTambahLaporan
  const handleTambahLaporan = (dataBaru) => {
    const newId = laporan.length + 1;
    setLaporan([
      ...laporan,
      {
        id: newId,
        ...dataBaru,
      },
    ]);
  };

  // Filter data, harus di luar return
  const filtered = laporan.filter((item) => {
    const namaBarang = String(item["Nama Barang"] || "");
    const matchSearch = namaBarang.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "Semua" || item.Status === statusFilter;

    return matchSearch && matchStatus;
  });
  return (
    <div className="laporan-page">
      <Sidebar />
      <div className="laporan-container">
        <div className="laporan-header">
          <h2>Laporan Masalah Inventaris</h2>
          <button
            className="btn-tambah-laporan"
            onClick={() => setModalOpen(true)}
            style={{
              backgroundColor: "#007e3a",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            + Lapor Kerusakan
          </button>
          <button className="btn-export">Export Excel</button>
        </div>
        <div className="laporan-filters">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Semua">Semua</option>
            <option value="Belum Ditangani">Belum Ditangani</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
        <table className="laporan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Nama Barang</th>
              <th>Lokasi</th>
              <th>Masalah</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => (
              <tr key={item.No}>
                <td>{index + 1}</td>
                <td>{item.Tanggal}</td>
                <td>{item["Nama Barang"]}</td>
                <td>{item.Lokasi}</td>
                <td>{item.Masalah}</td>
                <td>
                  <span
                    style={{ color: getColor(item.Status), fontWeight: "bold" }}
                  >
                    {item.Status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-aksi"
                    onClick={() => setSelectedLaporan(item)}
                  >
                    🔍
                  </button>
                  {item.status !== "Selesai" && (
                    <button className="btn-aksi">✔️</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TambahLaporanModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleTambahLaporan}
        />
        {selectedLaporan && (
          <DetailLaporanModal
            laporan={selectedLaporan}
            onClose={() => setSelectedLaporan(null)}
            onSelesai={handleSelesai}
          />
        )}
        <TambahLaporanModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleTambahLaporan}
        />
      </div>
    </div>
  );
};

export default LaporanMasalahPage;
