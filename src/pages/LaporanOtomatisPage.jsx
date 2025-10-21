import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import "../styles/LaporanOtomatisPage.css"; // kamu bisa buat file CSS-nya juga
import Sidebar from "../components/Sidebar";
import { useMemo } from "react";
import { FaTrash } from "react-icons/fa";

import PaginationBarang from "../components/pagination/Pagination";
import AddItemModalExport from "../components/AddItemModalExport";
import ExportExcelButton from "../components/ExportExcelButton";
let DEFAULT_PAGE_SIZE = 10;
const PageSizes = [10, 25, 50];

const LaporanOtomatisPage = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [tahunList, setTahunList] = useState([]);
  const [nupList, setNupList] = useState([]);
  const [filterTahun, setFilterTahun] = useState("");
  const [filterNup, setFilterNup] = useState("");
  const [filteredData, setfilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [changes, setChanges] = useState([]);

  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const baselineRef = useRef(new Map());
  const changesMap = useMemo(() => new Map(changes.map(c => [c.id, c])), [changes]);
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
  }, [search, filterNup, filterTahun]);

  const byId = useMemo(() => new Map(data.map(r => [r.id, r])), [data]);

  // daftar perubahan siap tampil (ada delta & nama)
  const changesView = useMemo(() => {
    return changes
      .map(ch => {
        const item = byId.get(ch.id);
        const nama = item?.["Nama_Barang"] ?? `ID ${ch.id}`;
        const nup = item?.["NUP"] ?? "";
        const nama_ruangan = item?.["Nama_Barang"] ?? "";
        const tahun_perolehan = item?.["Tahun_Perolehan"] ?? "";

        const delta = (Number(ch.value_changed) || 0) - (Number(ch.value_first) || 0);
        let keterangan = "";
        let tipe_history = "";

        if (delta < 0) {
          keterangan = `Mengurangi ${Math.abs(delta)} barang (dari ${ch.value_first} ke ${ch.value_changed} )`;
          tipe_history = "KURANG";
        } else {
          keterangan = `Menambahkan ${Math.abs(delta)} barang (dari ${ch.value_first} ke ${ch.value_changed} )`;
          tipe_history = "TAMBAH";
        }

        return { ...ch, delta, nama, nup, keterangan, nama_ruangan, tahun_perolehan, tipe_history };
      })
      .filter(c => c.delta !== 0);
  }, [changes, byId]);

  // useEffect(() => {
  //   fetch("/data/all_data_ibmn_2.xlsx")
  //     .then(res => res.arrayBuffer())
  //     .then(ab => {
  //       const workbook = XLSX.read(ab, { type: "array" });
  //       const sheet = workbook.Sheets[workbook.SheetNames[0]];
  //       let json = XLSX.utils.sheet_to_json(sheet);
  //       // beri id
  //       const withIds = json.map((row, i) => ({ ...row, id: i + 1 }));

  //       // baseline qty awal per id (untuk perbandingan)
  //       baselineRef.current = new Map(withIds.map(r => [r.id, Number(r["Jumlah_Barang"]) || 0]));

  //       setData(withIds);

  //       // generate dropdown options
  //       const tahunSet = new Set();
  //       const nupSet = new Set();

  //       json.forEach(item => {
  //         tahunSet.add(item["Tahun_Perolehan"]);
  //         nupSet.add(item["NUP"]);
  //       });

  //       setTahunList(Array.from(tahunSet).sort());
  //       setNupList(Array.from(nupSet).sort());
  //     });
  // }, []);

  async function addHistoryBulk(itemstemp) {
    const rest = await fetch("/api/history/bulk", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: itemstemp }), // bisa juga kirim payload langsung tanpa {items}, endpoint mendukung keduanya
    });
    if (!rest.ok) {
      const e = await rest.json().catch(() => ({}));
      console.error("Gagal insert:", e);
    }
    return rest.json();
  }

  async function deleteInventaris(id) {
    const res = await fetch(`/api/inventaris/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || `Gagal hapus (HTTP ${res.status})`);
    }
    return res.json(); // { deleted: {...} }
  }

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    // Pilih salah satu:
    const url = "/api/inventaris?normalized=true";
    // atau jika sudah set proxy Vite:
    // const url = "/local-api/inventaris?normalized=true";

    fetch(url, { signal: controller.signal, credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(withIds => {
        if (!alive) return;

        // baseline qty awal per id (untuk perbandingan)
        baselineRef.current = new Map(withIds.map(r => [r.id, Number(r["Jumlah_Barang"]) || 0]));

        setData(withIds);

        // generate dropdown options
        const tahunSet = new Set();
        const nupSet = new Set();

        withIds.forEach(item => {
          tahunSet.add(item["Tahun_Perolehan"]);
          nupSet.add(item["NUP"]);
        });

        setTahunList(Array.from(tahunSet).sort());
        setNupList(Array.from(nupSet).sort());
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error("Gagal memuat data inventaris:", err);
        }
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  // filter logic

  useEffect(() => {
    const filteredData = data.filter(item => {
      const matchTahun = filterTahun ? item["Tahun_Perolehan"] === parseInt(filterTahun) : true;
      const matchNup = filterNup ? item["NUP"] === filterNup : true;
      return matchTahun && matchNup;
    });
    setfilteredData(filteredData);

    // const indexOfLastItem = currentPage * itemsPerPage;
    // const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  }, [filterTahun, filterNup, data]);

  const firstIdx = (currentPage - 1) * pageSize;
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredData, pageSize]);

  const [pendingId, setPendingId] = useState(null);

  const askDelete = id => setPendingId(id);
  const closeModal = () => setPendingId(null);

  const confirmDelete = async () => {
    const { deleted } = await deleteInventaris(pendingId);
    const id = deleted.id;

    if (id) {
      const today = new Date();
      const ymd = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");

      let itemstemp = [];

      itemstemp.push({
        tanggal: ymd,
        nama_barang: byId.get(id)?.["Nama_Barang"] || "", // pastikan kamu punya nama di changesView
        nup: byId.get(id)?.NUP || "", // ambil dari data asli
        keterangan: "Barang Ini telah di 'Hapus'",
        nama_ruangan: byId.get(id)?.["Nama_Ruangan"] ?? byId.get(id)?.["Nama Ruangan"] ?? "",
        tahun_perolehan: Number(byId.get(id)?.["Tahun_Perolehan"]),
        tipe_history: "HAPUS",
      });

      const { updateddata } = await addHistoryBulk(itemstemp);
    }
    closeModal();

    // (Opsional) Panggil API backend di sini
    // await fetch(`/api/barang/${id}`, { method: "DELETE" });

    setData(prev => prev.filter(r => r.id !== id));
  };

  const itemToDelete = currentTableData.find(r => r.id === pendingId);

  useEffect(() => {
    const debouncetime = setTimeout(() => {
      const filtered = data.filter(item => item["Nama_Barang"].toLowerCase().includes(search.toLowerCase()));

      setfilteredData(filtered);
    }, 1000);

    return () => clearTimeout(debouncetime);
  }, [search, data]);

  const adjustQty = (id, delta) => {
    let cur = 0;
    let next = 0;

    setData(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        cur = Number(r["Jumlah_Barang"]) || 0;
        next = Math.max(0, cur + delta);
        return { ...r, ["Jumlah_Barang"]: next };
      })
    );

    // update changes
    setChanges(prev => {
      const value_first = (() => {
        const existing = prev.find(p => p.id === id);
        if (existing) return existing.value_first;
        const baseline = baselineRef.current.get(id);
        return baseline != null ? baseline : cur; // fallback aman
      })();

      if (next === value_first) {
        // jika kembali ke nilai awal, hapus dari daftar perubahan
        return prev.filter(p => p.id !== id);
      }

      const existed = prev.some(p => p.id === id);
      if (existed) {
        return prev.map(p => (p.id === id ? { ...p, value_changed: next } : p));
      }
      return [...prev, { id, value_first, value_changed: next }];
    });
  };

  // tambahkan di atas return (setelah deklarasi state & baselineRef)
  const handleAddSave = async payload => {
    // payload sudah dinormalisasi dari modal (tipe & required valid)

    const res = await fetch("/api/inventaris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // boleh kirim versi yang sudah kamu punya
      credentials: "include",
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || "Gagal simpan");
    }
    const { id } = await res.json();

    if (id) {
      let itemstemp = [];

      const today = new Date();
      const ymd = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
      itemstemp.push({
        tanggal: ymd,
        nama_barang: payload["Nama_Barang"],
        nup: payload["NUP"],
        keterangan: "Menambahkan Barang Baru",
        nama_ruangan: payload["Nama_Ruangan"],
        tahun_perolehan: payload["Tahun_Perolehan"],
        tipe_history: "BARU",
      });

      const { updated } = await addHistoryBulk(itemstemp);
    }

    setData(prev => {
      const newRow = { ...payload, id: id };

      // baseline untuk fitur highlight perubahan
      baselineRef.current.set(newRow.id, Number(newRow["Jumlah_Barang"]) || 0);

      return [...prev, newRow];
    });

    // update dropdown options (tahun & NUP) bila perlu
    setTahunList(prev => {
      const t = Number(payload["Tahun_Perolehan"]);
      const s = new Set(prev);
      if (!Number.isNaN(t)) s.add(t);
      return Array.from(s).sort((a, b) => a - b);
    });
    setNupList(prev => {
      const s = new Set(prev);
      if (payload["NUP"]) s.add(payload["NUP"]);
      return Array.from(s).sort();
    });

    setModalOpen(false);
  };

  useEffect(() => {
    console.log("filteredData", filteredData.slice(0, 3));
  }, [filteredData]);

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
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: "0.5rem",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
            </div>
            <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)}>
              <option value="">Semua Tahun</option>
              {tahunList.map((tahun, i) => (
                <option key={i} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>

            <select value={filterNup} onChange={e => setFilterNup(e.target.value)}>
              <option value="">Semua NUP</option>
              {nupList.map((nup, i) => (
                <option key={i} value={nup}>
                  {nup}
                </option>
              ))}
            </select>
            <ExportExcelButton data={filteredData} fileName="data-barang.xlsx" />
          </div>

          <div className="button_groups">
            <button
              onClick={() => {
                // setEditItem(null);
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

            {changes.length > 0 && (
              <button
                onClick={() => setConfirmOpen(true)}
                style={{
                  backgroundColor: "#EAAA34",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Simpan Perubahan
              </button>
            )}

            <div className="filters-right">
              <label className="rows-per-page">
                Rows per page:&nbsp;
                <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                  {PageSizes.map(n => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <table className="laporan-table">
          <thead>
            <tr>
              <th>No</th>
              {/* <th>ID</th> */}
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>NUP</th>
              <th>Nama Ruangan</th>
              <th>Merk/Tipe</th>
              <th>Tahun Perolehan</th>
              <th>Penguasaan</th>
              <th>Jumlah Barang</th>
              <th>Keterangan</th>
              <th style={{ textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentTableData.map((item, i) => {
              const qty = Number(item["Jumlah_Barang"]) || 0;

              // cek apakah baris ini ada di daftar perubahan
              const ch = changesMap.get(item.id);
              let rowClass = "";
              if (ch) {
                if (ch.value_changed > ch.value_first) rowClass = "row-inc";
                else if (ch.value_changed < ch.value_first) rowClass = "row-dec";
              }

              return (
                <tr key={item.id ?? i} className={rowClass}>
                  <td>{pageSize * (currentPage - 1) + i + 1}</td>
                  {/* <td>{item["id"]}</td> */}
                  <td>{item["Kode_Barang"]}</td>
                  <td>{item["Nama_Barang"]}</td>
                  <td>{item["NUP"]}</td>
                  <td>{item["Nama_Ruangan"]}</td>
                  <td>{item["Merek_Tipe"]}</td>
                  <td>{item["Tahun_Perolehan"]}</td>
                  <td>{item["Penguasaan"]}</td>
                  <td>
                    <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                      <button type="button" onClick={() => adjustQty(item.id, -1)} disabled={qty <= 0} aria-label={`Kurangi jumlah ${item["Nama_Barang"]}`} style={{ padding: "2px 8px" }}>
                        −
                      </button>
                      <span style={{ minWidth: 24, textAlign: "center", display: "inline-block" }}>{qty}</span>
                      <button type="button" onClick={() => adjustQty(item.id, +1)} aria-label={`Tambah jumlah ${item["Nama_Barang"]}`} style={{ padding: "2px 8px" }}>
                        +
                      </button>
                    </div>
                  </td>
                  <td>{item["Keterangan"]}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        askDelete(item.id);
                      }}
                      aria-label={`Hapus ${item["Nama_Barang"]}`}
                      title="Hapus"
                      style={{ background: "transparent", border: 0, cursor: "pointer" }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* <div style={{ display: "flex", justifyContent: "center" }}>
          <PaginationBarang className="pagination-bar" currentPage={currentPage} totalCount={filteredData.length} pageSize={pageSize} onPageChange={page => setCurrentPage(page)} />
        </div> */}
        <div className="table-footer">
          <div className="count-info">
            {filteredData.length > 0 && (
              <>
                {firstIdx + 1}–{Math.min(firstIdx + pageSize, filteredData.length)} dari {filteredData.length}
              </>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
            <PaginationBarang className="pagination-bar" currentPage={currentPage} totalCount={filteredData.length} pageSize={pageSize} onPageChange={p => setCurrentPage(p)} />
          </div>
        </div>

        <ConfirmChangesModal
          open={isConfirmOpen}
          changes={changesView}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            // TODO: panggil API persist di sini bila perlu (bulk update)
            // await fetch("/local-api/inventaris/bulk-qty", { method:"POST", body: JSON.stringify(changes) })

            // Setelah disimpan: jadikan nilai sekarang sebagai baseline baru,
            // lalu bersihkan daftar changes agar warna baris kembali normal

            const items = changesView.map(c => ({
              id: c.id,
              jumlah_barang: Number(c.value_changed) || 0,
            }));

            const res = await fetch("/api/inventaris/bulk-qty", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items }),
              credentials: "include",
            });
            if (!res.ok) {
              const e = await res.json().catch(() => ({}));
              alert("Gagal menyimpan perubahan");
              return;
            }
            const { items: updated } = await res.json();

            const today = new Date();
            const ymd = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");

            const itemstemp = changesView.map(c => ({
              tanggal: ymd,
              nama_barang: c.nama,
              nup: c.nup,
              keterangan: c.keterangan,
              nama_ruangan: c.nama_ruangan,
              tahun_perolehan: c.tahun_perolehan,
              tipe_history: c.tipe_history,
            }));

            const { updateddata } = await addHistoryBulk(itemstemp);

            baselineRef.current = new Map(data.map(r => [r.id, Number(r["Jumlah_Barang"]) || 0]));
            setChanges([]);
            setConfirmOpen(false);
          }}
        />

        <AddItemModal open={isModalOpen} onCancel={() => setModalOpen(false)} onSave={handleAddSave} />

        <ConfirmModal open={pendingId != null} title="Hapus Data" message={itemToDelete ? `Yakin menghapus "${itemToDelete.Nama_Barang}" (ID: ${itemToDelete.id})?` : "Yakin menghapus item ini?"} onCancel={closeModal} onConfirm={confirmDelete} />
      </div>
    </div>
  );
};

function ConfirmModal({
  open,
  title = "Hapus Data",
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Ya, hapus",
  cancelLabel = "Batal",
  variant = "danger", // "danger" | "info"
}) {
  if (!open) return null;

  const confirmBtnRef = useRef(null);

  useEffect(() => {
    // fokus ke tombol konfirmasi & keyboard shortcuts
    confirmBtnRef.current?.focus();
    const onKey = e => {
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, onConfirm]);

  const palette = variant === "danger" ? { accent: "#dc2626", accentHover: "#b91c1c", softBg: "#fee2e2", softText: "#991b1b" } : { accent: "#0284c7", accentHover: "#0369a1", softBg: "#e0f2fe", softText: "#075985" };

  return (
    <div
      className="cm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cm-title"
      aria-describedby="cm-desc"
      onClick={onCancel} // klik backdrop = batal
    >
      {/* style internal biar self-contained */}
      <style>{`
        @keyframes cm-overlay-in { from {opacity:0} to {opacity:1} }
        @keyframes cm-modal-in { 
          0% { opacity:0; transform: translateY(8px) scale(.98) }
          100% { opacity:1; transform: translateY(0) scale(1) }
        }
        .cm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.45);
          display:flex; align-items:center; justify-content:center; z-index:9999;
          animation: cm-overlay-in 140ms ease-out;
        }
        .cm-card {
          background:#fff; padding:18px 18px 14px; border-radius:12px; min-width:360px; max-width:92vw;
          box-shadow: 0 12px 32px rgba(0,0,0,.18);
          animation: cm-modal-in 160ms cubic-bezier(.2,.8,.2,1);
        }
        .cm-header { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .cm-icon {
          width:38px; height:38px; border-radius:999px;
          display:flex; align-items:center; justify-content:center; flex:0 0 auto;
        }
        .cm-title { margin:0; font-size:18px; font-weight:700; color:#111827; }
        .cm-message { margin:8px 0 0; color:#374151; line-height:1.55; }
        .cm-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:16px; }
        .cm-btn {
          appearance:none; border:1px solid #d1d5db; background:#fff; color:#111827;
          padding:.45rem .8rem; border-radius:8px; cursor:pointer; font-weight:600;
          transition: transform .06s ease, background .12s ease, border-color .12s ease;
        }
        .cm-btn:hover { background:#f3f4f6; }
        .cm-btn:active { transform: translateY(1px); }
        .cm-btn:focus-visible { outline: 3px solid rgba(59,130,246,.35); outline-offset: 2px; }

        .cm-btn-primary {
          border-color: transparent; color:#fff;
        }
        .cm-btn-primary:hover { filter: brightness(.98); }
        .cm-btn-primary:active { transform: translateY(1px); }
      `}</style>

      <div
        className="cm-card"
        role="document"
        onClick={e => e.stopPropagation()} // jangan close saat klik isi modal
      >
        <div className="cm-header">
          <div className="cm-icon" style={{ background: palette.softBg, color: palette.softText }}>
            {/* ikon segitiga warning */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v5m0 4h.01" />
            </svg>
          </div>
          <h3 id="cm-title" className="cm-title">
            {title}
          </h3>
        </div>

        <p id="cm-desc" className="cm-message">
          {message}
        </p>

        <div className="cm-actions">
          <button className="cm-btn" onClick={onCancel}>
            {" "}
            {cancelLabel}{" "}
          </button>
          <button ref={confirmBtnRef} className="cm-btn cm-btn-primary" onClick={onConfirm} style={{ background: palette.accent }} onMouseOver={e => (e.currentTarget.style.background = palette.accentHover)} onMouseOut={e => (e.currentTarget.style.background = palette.accent)}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmChangesModal({ open, changes, onCancel, onConfirm }) {
  if (!open) return null;

  const inc = changes.filter(c => c.delta > 0);
  const dec = changes.filter(c => c.delta < 0);

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };
  const modalStyle = {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    minWidth: 420,
    maxWidth: "90vw",
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h3 style={{ margin: 0 }}>Konfirmasi Perubahan</h3>

        {inc.length === 0 && dec.length === 0 ? (
          <p>Tidak ada perubahan.</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            {inc.length > 0 && (
              <>
                <strong>Penambahan</strong>
                <ul style={{ marginTop: 6 }}>
                  {inc.map(c => (
                    <li key={`inc-${c.id}`} style={{ color: "#1B5E20" }}>
                      Menambahkan {c.delta} {c.nama}{" "}
                      <small style={{ color: "#4CAF50" }}>
                        (dari {c.value_first} → {c.value_changed})
                      </small>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {dec.length > 0 && (
              <>
                <strong>Pengurangan</strong>
                <ul style={{ marginTop: 6 }}>
                  {dec.map(c => (
                    <li key={`dec-${c.id}`} style={{ color: "#B71C1C" }}>
                      Mengurangi {Math.abs(c.delta)} {c.nama}{" "}
                      <small style={{ color: "#E57373" }}>
                        (dari {c.value_first} → {c.value_changed})
                      </small>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onCancel}>Batal</button>
          <button onClick={onConfirm} style={{ background: "#007e3a", color: "#fff", padding: "0.4rem 0.8rem", borderRadius: 6 }}>
            Konfirmasi & Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ open, onCancel, onSave }) {
  const [form, setForm] = React.useState({
    Kode_Barang: "",
    Nama_Barang: "",
    NUP: "",
    Nama_Ruangan: "",
    Merek_Tipe: "",
    Tahun_Perolehan: "",
    Penguasaan: "",
    Jumlah_Barang: 0,
    // opsional:
    Keterangan: "BAIK",
  });
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (open) {
      setForm({
        Kode_Barang: "",
        Nama_Barang: "",
        NUP: "",
        Nama_Ruangan: "",
        Merek_Tipe: "",
        Tahun_Perolehan: "",
        Penguasaan: "",
        Jumlah_Barang: 0,
        Keterangan: "",
      });
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const e = {};
    if (!String(form["Nama_Barang"]).trim()) e["Nama_Barang"] = "Wajib diisi";
    if (!String(form["NUP"]).trim()) e["NUP"] = "Wajib diisi";
    if (!String(form["Nama_Ruangan"]).trim()) e["Nama_Ruangan"] = "Wajib diisi";
    if (String(form["Tahun_Perolehan"]).trim() === "") e["Tahun_Perolehan"] = "Wajib diisi";
    else if (!/^\d+$/.test(String(form["Tahun_Perolehan"]))) e["Tahun_Perolehan"] = "Harus angka bulat";
    if (!String(form["Penguasaan"]).trim()) e["Penguasaan"] = "Wajib diisi";

    const jb = String(form["Jumlah_Barang"]).trim();
    if (jb === "") e["Jumlah_Barang"] = "Wajib diisi (boleh 0)";
    else if (!/^\d+$/.test(jb)) e["Jumlah_Barang"] = "Harus angka bulat ≥ 0";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = ev => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      Kode_Barang: String(form["Kode_Barang"] || "").trim(),
      Nama_Barang: String(form["Nama_Barang"]).trim(),
      NUP: String(form["NUP"]).trim(),
      Nama_Ruangan: String(form["Nama_Ruangan"]).trim(),
      Merek_Tipe: String(form["Merek_Tipe"] || "").trim(),
      Tahun_Perolehan: parseInt(form["Tahun_Perolehan"], 10),
      Penguasaan: String(form["Penguasaan"]).trim(),
      Jumlah_Barang: parseInt(form["Jumlah_Barang"], 10),
      Keterangan: String(form["Keterangan"] || "BAIK").trim(),
    };

    onSave(payload); // serahkan ke parent
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="modal-card modal-form">
        <h3 className="modal-title">Tambah Barang</h3>

        <div className="form-grid">
          <Field label="Kode Barang" error={errors["Kode_Barang"]}>
            <input className="input-lg" placeholder="3.05.02.01.003" value={form["Kode_Barang"]} onChange={e => set("Kode_Barang", e.target.value)} />
          </Field>

          <Field label="Nama Barang *" error={errors["Nama_Barang"]}>
            <input className="input-lg" placeholder="Kursi Direksi" value={form["Nama_Barang"]} onChange={e => set("Nama_Barang", e.target.value)} required />
          </Field>

          <Field label="NUP *" error={errors["NUP"]}>
            <input className="input-lg" placeholder="R.1.01" value={form["NUP"]} onChange={e => set("NUP", e.target.value)} required />
          </Field>

          <Field label="Nama Ruangan *" error={errors["Nama_Ruangan"]}>
            <input className="input-lg" placeholder="Aula" value={form["Nama_Ruangan"]} onChange={e => set("Nama_Ruangan", e.target.value)} required />
          </Field>

          <Field label="Merek Tipe" error={errors["Merek_Tipe"]}>
            <input className="input-lg" placeholder="LG" value={form["Merek_Tipe"]} onChange={e => set("Merek_Tipe", e.target.value)} />
          </Field>

          <Field label="Tahun Perolehan *" error={errors["Tahun_Perolehan"]}>
            <input className="input-lg" type="number" inputMode="numeric" pattern="\d*" placeholder="2021" value={form["Tahun_Perolehan"]} onChange={e => set("Tahun_Perolehan", e.target.value)} required />
          </Field>

          <Field label="Penguasaan *" error={errors["Penguasaan"]}>
            <input className="input-lg" placeholder="FST" value={form["Penguasaan"]} onChange={e => set("Penguasaan", e.target.value)} required />
          </Field>

          <Field label="Jumlah Barang *" error={errors["Jumlah_Barang"]}>
            <input className="input-lg" type="number" inputMode="numeric" pattern="\d*" placeholder="0" value={form["Jumlah_Barang"]} onChange={e => set("Jumlah_Barang", e.target.value)} required />
          </Field>

          <Field label="Keterangan (opsional)">
            <input className="input-lg" placeholder="BAIK" value={form["Keterangan"]} onChange={e => set("Keterangan", e.target.value)} />
          </Field>
        </div>

        <div style={footer}>
          <button type="button" onClick={onCancel} style={btnSecondary}>
            Batal
          </button>
          <button type="submit" style={btnPrimary}>
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

const footer = { display: "flex", justifyContent: "flex-end", gap: 8, padding: 16, borderTop: "1px solid #e5e7eb" };
const btnPrimary = { background: "#007e3a", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
const btnSecondary = { background: "#f1f5f9", color: "#111827", border: "1px solid #e5e7eb", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 };

export default LaporanOtomatisPage;
