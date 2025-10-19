import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUsers, FaTools, FaChartBar, FaUserCog, FaSignOutAlt } from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = useMemo(() => String(me?.role || "").toLowerCase() === "admin", [me]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/auth/me", { credentials: "include" });
        if (!r.ok) return;
        const json = await r.json();
        if (!cancelled) setMe(json);
      } catch {}
    })();
    return () => (cancelled = true);
  }, []);

  const initials = (me?.full_name || me?.username || "U").trim().charAt(0).toUpperCase();

  const menuItems = [
    { label: "Manajemen Barang", icon: FaChartBar, path: "/management-barang" },
    { label: "History Barang", icon: FaTools, path: "/history-barang" },
    // Tampilkan Pengguna hanya bila admin
    { label: "Pengguna", icon: FaUsers, path: "/user-management" },
    { label: "Pengaturan", icon: FaUserCog, path: "/pengaturan" },
  ];

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      console.error("Logout gagal:", e);
    } finally {
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside style={sx.sidebar}>
      <div style={sx.profile}>
        <div style={sx.avatar} aria-hidden>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={sx.name}>{me?.full_name || "User"}</div>
          <div style={sx.email}>{me?.email || `@${me?.username || "-"}`}</div>
        </div>
      </div>

      <nav aria-label="Sidelist">
        <ul style={sx.menu}>
          {menuItems.map(({ label, icon: Icon, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <li key={path}>
                <Link
                  to={path}
                  aria-current={active ? "page" : undefined}
                  style={{
                    ...sx.item,
                    ...(active ? sx.itemActive : null),
                  }}
                >
                  {/* indikator aktif di kiri */}
                  <span aria-hidden style={{ ...sx.activeBar, opacity: active ? 1 : 0 }} />
                  <Icon size={16} style={{ marginRight: 10, color: active ? "#0f766e" : "#343a40" }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        className="logout-btn"
        onClick={handleLogout}
        disabled={loggingOut}
        style={{
          ...sx.logout,
          ...(loggingOut ? { opacity: 0.7, cursor: "wait" } : null),
        }}
      >
        <FaSignOutAlt style={{ marginRight: 8 }} />
        {loggingOut ? "Logging out…" : "Logout"}
      </button>
    </aside>
  );
}

/* ---------- styles ---------- */
const sx = {
  sidebar: {
    width: 260,
    background: "#f8f9fa",
    padding: "18px",
    borderRight: "1px solid #e9ecef",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    position: "sticky",
    top: 0,
    height: "100dvh",
    boxSizing: "border-box",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 6px 14px",
    borderBottom: "1px solid #e9ecef",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#007e3a",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    letterSpacing: 0.3,
  },
  name: { fontWeight: 700, fontSize: 14, color: "#073b27" },
  email: { fontSize: 12, color: "#6c757d", overflow: "hidden", textOverflow: "ellipsis" },

  menu: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 },
  item: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#212529",
    outline: "none",
    transition: "background 120ms ease, transform 80ms ease",
  },
  itemActive: {
    background: "#e9f5f2",
    color: "#0f766e",
    fontWeight: 700,
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 6,
    bottom: 6,
    width: 4,
    borderRadius: 4,
    background: "#0f766e",
    transition: "opacity 120ms ease",
  },
  logout: {
    marginTop: "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
};
