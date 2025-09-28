import React from "react";
import "../styles/DetailLaporanModal.css";

const DetailLaporanModal = ({ laporan, onClose, onSelesai }) => {
  if (!laporan) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>Detail Laporan Masalah</h2>
        <div className="laporan-info">
          <p>
            <strong>Barang:</strong> {laporan.namaBarang}
          </p>
          <p>
            <strong>Lokasi:</strong> {laporan.lokasi}
          </p>
          <p>
            <strong>Tanggal:</strong> {laporan.tanggal}
          </p>
          <p>
            <strong>Masalah:</strong> {laporan.masalah}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                laporan.status === "Selesai" ? "status selesai" : "status belum"
              }
            >
              {laporan.status}
            </span>
          </p>
        </div>
        {laporan.status !== "Selesai" && (
          <button className="btn-selesai" onClick={() => onSelesai(laporan.id)}>
            ✔ Tandai Selesai
          </button>
        )}
      </div>
    </div>
  );
};

export default DetailLaporanModal;
