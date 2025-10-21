// File: src/pages/LaporanMasalahPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/LaporanMasalah.css";
import PaginationBarang from "../components/pagination/Pagination";

// --- util kecil ---
const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const TYPE_COLORS = {
  BARU: "#16a34a", // green-600
  HAPUS: "#ef4444", // red-500
  KURANG: "#f59e0b", // amber-500
  TAMBAH: "#06b6d4", // cyan-500
};

const PageSizes = [10, 25, 50];

let DEFAULT_PAGE_SIZE = 10;

const LaporanMasalahPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [tipeFilter, setTipeFilter] = useState(""); // "" = semua
  const [tipeList, setTipeList] = useState([]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [me, setMe] = useState(null);
  const isAdmin = !!(me?.role === "ADMIN" || me?.roles?.includes?.("ADMIN"));

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [sortBy, setSortBy] = useState("tanggal");
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"

  const [confirmDelete, setConfirmDelete] = useState({ open: false, row: null });
  const closeConfirm = () => setConfirmDelete({ open: false, row: null });

  // --- fetch user (cek admin) ---
  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(json => setMe(json))
      .catch(() => {}); // diam saja kalau gagal, default non-admin
  }, []);

  // --- fetch data ---
  useEffect(() => {
    setLoading(true);
    setFetchError("");
    fetch("/api/history", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(Array.isArray(json) ? json : []);
        // buat opsi tipe dari data
        const setTipe = new Set();
        (json || []).forEach(it => {
          if (it?.tipe_history) setTipe.add(it.tipe_history);
        });
        setTipeList([...setTipe].sort());
      })
      .catch(err => setFetchError(err?.message || "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, []);

  // --- filter + sort (gabung dalam satu tempat agar konsisten) ---
  const filteredSorted = useMemo(() => {
    let rows = data.filter(item => {
      const matchTipe = tipeFilter ? item?.tipe_history === tipeFilter : true;

      const q = (debouncedSearch || "").trim().toLowerCase();
      const haystacks = [item?.nama_barang, item?.nup, item?.nama_ruangan, item?.keterangan].map(v => String(v || "").toLowerCase());
      const matchSearch = !q || haystacks.some(v => v.includes(q));

      return matchTipe && matchSearch;
    });

    const compare = (a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const val = (row, key) => {
        if (key === "tanggal") return new Date(row?.tanggal || 0).getTime() || 0;
        if (key === "tahun_perolehan") return Number(row?.tahun_perolehan || 0);
        return String(row?.[key] || "").toLowerCase();
      };
      const av = val(a, sortBy);
      const bv = val(b, sortBy);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    };

    rows.sort(compare);
    return rows;
  }, [data, debouncedSearch, tipeFilter, sortBy, sortDir]);

  // --- pagination ---
  const firstIdx = (currentPage - 1) * pageSize;
  const currentRows = useMemo(() => filteredSorted.slice(firstIdx, firstIdx + pageSize), [filteredSorted, firstIdx, pageSize]);

  // reset ke halaman 1 saat filter/search/pagesize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, tipeFilter, pageSize]);

  const toggleSort = key => {
    if (sortBy === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // --- helpers UI ---
  const badgeStyle = type => {
    const c = TYPE_COLORS[type] || "#64748b"; // slate-500 default
    return {
      display: "inline-flex",
      alignItems: "center",
      height: 22,
      padding: "0 10px",
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      border: `1px solid ${c}33`,
      background: `${c}14`,
      color: c,
      whiteSpace: "nowrap",
    };
  };

  const rowId = (it, idx) => it?.id ?? it?.history_id ?? `${it?.nup ?? "no-nup"}-${it?.tanggal ?? idx}-${idx}`;

  // --- delete ---
  const doDelete = useCallback(async () => {
    const row = confirmDelete.row;
    if (!row) return;
    const id = row?.id ?? row?.history_id;
    if (!id) {
      alert("ID tidak tersedia pada baris ini; penghapusan dibatalkan.");
      closeConfirm();
      return;
    }

    try {
      const res = await fetch(`/api/history/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // optimistic update
      setData(prev =>
        prev.filter((it, idx) => {
          const pid = it?.id ?? it?.history_id ?? `${it?.nup ?? "no-nup"}-${it?.tanggal ?? idx}-${idx}`;
          return pid !== id;
        })
      );
      closeConfirm();
    } catch (e) {
      alert("Gagal menghapus data: " + (e?.message || "Unknown error"));
    }
  }, [confirmDelete]);

  return (
    <div className="laporan-page">
      <Sidebar />
      <div className="laporan-container">
        <div className="laporan-header">
          <div>
            <h2>Laporan Masalah Inventaris</h2>
            <p className="subtle">Pantau perubahan inventaris dan riwayat aksi.</p>
          </div>
          {/* tempat tombol lain (Export, dsb) kalau diperlukan */}
        </div>

        {/* Filter bar */}
        <div className="laporan-filters">
          <div className="filters-left">
            <input type="text" placeholder="Cari nama barang/NUP/ruangan/keterangan…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Cari" />

            <select value={tipeFilter} onChange={e => setTipeFilter(e.target.value)} aria-label="Filter Tipe">
              <option value="">Semua Tipe</option>
              {tipeList.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {(search || tipeFilter) && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearch("");
                  setTipeFilter("");
                }}
                aria-label="Bersihkan filter"
              >
                Reset
              </button>
            )}
          </div>

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

        {/* Legend tipe */}
        <div className="tipe-legend">
          {["BARU", "HAPUS", "KURANG", "TAMBAH"].map(t => (
            <span key={t} style={badgeStyle(t)}>
              {t}
            </span>
          ))}
        </div>

        {/* Tabel */}
        <div className="table-wrapper">
          <table className="laporan-table">
            <thead>
              <tr>
                <th>No</th>
                <th className="th-sort" 
                //onClick={() => toggleSort("tanggal")}
                >
                  Tanggal 
                  {/* {sortBy === "tanggal" ? (sortDir === "asc" ? "▲" : "▼") : ""} */}
                </th>
                <th className="th-sort" 
                //onClick={() => toggleSort("nama_barang")}
                >
                  Nama Barang
                   {/* {sortBy === "nama_barang" ? (sortDir === "asc" ? "▲" : "▼") : ""} */}
                </th>
                <th>NUP</th>
                <th className="th-sort" 
                //onClick={() => toggleSort("nama_ruangan")}
                >
                  Ruangan
                   {/* {sortBy === "nama_ruangan" ? (sortDir === "asc" ? "▲" : "▼") : ""} */}
                </th>
                <th className="th-sort"
                 //onClick={() => toggleSort("tahun_perolehan")}
                 >
                  Tahun Perolehan
                   {/* {sortBy === "tahun_perolehan" ? (sortDir === "asc" ? "▲" : "▼") : ""} */}
                </th>
                <th>Tipe</th>
                <th>Keterangan</th>
                {isAdmin && <th style={{ width: 90, textAlign: "center" }}>Action</th>}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="skeleton-row">
                      <td colSpan={isAdmin ? 9 : 8}>&nbsp;</td>
                    </tr>
                  ))}
                </>
              )}

              {!loading && fetchError && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="empty">
                    {fetchError}
                  </td>
                </tr>
              )}

              {!loading && !fetchError && currentRows.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="empty">
                    Tidak ada data yang cocok dengan filter.
                  </td>
                </tr>
              )}

              {!loading &&
                !fetchError &&
                currentRows.map((item, index) => {
                  const absoluteNo = (currentPage - 1) * pageSize + index + 1;
                  const id = rowId(item, index);
                  return (
                    <tr key={id}>
                      <td>{absoluteNo}</td>
                      <td>{item?.tanggal}</td>
                      <td>{item?.nama_barang}</td>
                      <td>{item?.nup}</td>
                      <td>{item?.nama_ruangan}</td>
                      <td>{item?.tahun_perolehan}</td>
                      <td>
                        <span style={badgeStyle(item?.tipe_history)}>{item?.tipe_history || "-"}</span>
                      </td>
                      <td>{item?.keterangan}</td>
                      {isAdmin && (
                        <td style={{ textAlign: "center" }}>
                          <button className="btn-danger" onClick={() => setConfirmDelete({ open: true, row: item })} title="Hapus riwayat ini">
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="table-footer">
          <div className="count-info">
            {filteredSorted.length > 0 && (
              <>
                {firstIdx + 1}–{Math.min(firstIdx + pageSize, filteredSorted.length)} dari {filteredSorted.length}
              </>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
            <PaginationBarang className="pagination-bar" currentPage={currentPage} totalCount={filteredSorted.length} pageSize={pageSize} onPageChange={p => setCurrentPage(p)} />
          </div>
        </div>

        {/* Modal konfirmasi hapus */}
        {confirmDelete.open && (
          <div className="modal-backdrop" onClick={closeConfirm}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h4>Hapus riwayat?</h4>
              <p>
                Data <b>{confirmDelete.row?.nama_barang}</b> ({confirmDelete.row?.tipe_history}) pada <b>{confirmDelete.row?.tanggal}</b> akan dihapus permanen.
              </p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={closeConfirm}>
                  Batal
                </button>
                <button className="btn-danger" onClick={doDelete}>
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanMasalahPage;
