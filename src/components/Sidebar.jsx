import React from "react";
import {
  FaBox,
  FaUsers,
  FaTools,
  FaExchangeAlt,
  FaChartBar,
  FaUserCog,
  FaHome,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    // { label: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    // { label: "Data Barang", icon: <FaBox />, path: "/data-barang" },
    {
      label: "Manajemen Barang",
      icon: <FaChartBar />,
      path: "/management-barang",
    },
    { label: "Lapor Kerusakan", icon: <FaTools />, path: "/lapor-kerusakan" },
    { label: "Pengguna", icon: <FaUsers />, path: "/user-management" },
    { label: "Pengaturan", icon: <FaUserCog />, path: "/pengaturan" }, // Optional
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.profile}>
        <div style={styles.avatar}>K</div>
        <div>
          <strong style={{ fontSize: "0.95rem" }}>Kevin Dukkon</strong>
          <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
            hey@kevdu.co
          </div>
        </div>
      </div>

      <nav>
        <ul style={styles.menu}>
          {menuItems.map((item) => (
            <li
              key={item.path}
              style={
                location.pathname === item.path
                  ? styles.active
                  : styles.menuItem
              }
            >
              <Link to={item.path} style={styles.link}>
                {item.icon} <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "260px",
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    borderRight: "1px solid #dee2e6",
    height: "100vh",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    marginBottom: "2rem",
    gap: "0.75rem",
  },
  avatar: {
    width: "40px",
    height: "40px",
    backgroundColor: "#007e3a",
    borderRadius: "50%",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    textDecoration: "none",
    color: "inherit",
  },
  active: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: "#e9ecef",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "bold",
    color: "#007e3a",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
};

export default Sidebar;
