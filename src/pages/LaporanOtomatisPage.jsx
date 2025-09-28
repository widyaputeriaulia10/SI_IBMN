import React, { useEffect, useLayoutEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../styles/LaporanOtomatisPage.css"; // kamu bisa buat file CSS-nya juga
import Sidebar from "../components/sidebar";
import { useMemo } from "react";
import { FaTrash } from "react-icons/fa";

import PaginationBarang from "../components/pagination/Pagination";
let PageSize = 10;

const LaporanOtomatisPage = () => {
  const [data, setData] = useState([]);
  const [tahunList, setTahunList] = useState([]);
  const [nupList, setNupList] = useState([]);
  const [filterTahun, setFilterTahun] = useState("");
  const [filterNup, setFilterNup] = useState("");
  const [filteredData, setfilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  //  currentTableData untuk ini
  //  <tbody>
  //         {currentTableData.map(item => {
  //           return (
  //             <tr>
  //               <td>{item.id}</td>
  //               <td>{item.first_name}</td>
  //               <td>{item.last_name}</td>
  //               <td>{item.email}</td>
  //               <td>{item.phone}</td>
  //             </tr>
  //           );
  //         })}
  //       </tbody>

  useEffect(() => {
    // Reset halaman ke 1 saat filteredData berubah
    setCurrentPage(1);
  }, [filteredData]);
  useEffect(() => {
    fetch("/data/all_data_ibmn_2.xlsx")
      .then((res) => res.arrayBuffer())
      .then((ab) => {
        const workbook = XLSX.read(ab, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        setData(json);

        // generate dropdown options
        const tahunSet = new Set();
        const nupSet = new Set();

        json.forEach((item) => {
          tahunSet.add(item["Tahun Pengadaan"]);
          nupSet.add(item["NUP"]);
        });

        setTahunList(Array.from(tahunSet).sort());
        setNupList(Array.from(nupSet).sort());
      });
  }, []);

  // filter logic

  useEffect(() => {
    const filteredData = data.filter((item) => {
      const matchTahun = filterTahun
        ? item["Tahun Pengadaan"] === filterTahun
        : true;
      const matchNup = filterNup ? item["NUP"] === filterNup : true;
      return matchTahun && matchNup;
    });
    setfilteredData(filteredData);

    // const indexOfLastItem = currentPage * itemsPerPage;
    // const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  }, [filterTahun, filterNup, data]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredData]);

  useEffect(() => {
 
    const debouncetime = setTimeout(() => {
      const filtered = data.filter((item) =>
        item["Nama_Barang"].toLowerCase().includes(search.toLowerCase())
      );

   
      setfilteredData(filtered);
    }, 1000);

    return () => clearTimeout(debouncetime);
  }, [search, data]);

  return (
    <div className="laporan-page">
      <Sidebar />

      <div className="laporan-container">
        <h2>Laporan Inventaris Otomatis</h2>

        <div className="filter-bar" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", width: "50%", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "60%",
              }}
            >
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "0.5rem",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
            </div>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
            >
              <option value="">Semua Tahun</option>
              {tahunList.map((tahun, i) => (
                <option key={i} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>

            <select
              value={filterNup}
              onChange={(e) => setFilterNup(e.target.value)}
            >
              <option value="">Semua NUP</option>
              {nupList.map((nup, i) => (
                <option key={i} value={nup}>
                  {nup}
                </option>
              ))}
            </select>
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
        </div>

        <table className="laporan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>NUP</th>
              <th>Nama Ruangan</th>
              <th>Merk/Tipe</th>
              <th>Tahun Perolehan</th>
              <th>Penguasaan</th>
              <th>Jumlah Barang</th>
              <th>Kondisi</th>
              <th style={{ textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentTableData.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item["Kode_Barang"]}</td>
                <td>{item["Nama_Barang"]}</td>
                <td>{item["NUP"]}</td>
                <td>{item["Nama Ruangan"]}</td>
                <td>{item["Merk_Tipe"]}</td>
                <td>{item["Tahun_Perolehan"]}</td>
                <td>{item["Penguasaan"]}</td>
                <td>{item["Jumlah_Barang"]}</td>
                <td>{item["Keterangan"]}</td>
                <td style={{ textAlign: "center" }}>
                  <FaTrash />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PaginationBarang
            className="pagination-bar"
            currentPage={currentPage}
            totalCount={filteredData.length}
            pageSize={PageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &laquo; Prev
          </button>
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default LaporanOtomatisPage;
