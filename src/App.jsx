import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DataBarangPage from "./pages/DataBarangPage";
import UserPage from "./pages/UserPage";
import LaporanMasalahPage from "./pages/LaporanMasalahPage";
import PengaturanPage from "./pages/PengaturanPage";
import LaporanOtomatisPage from "./pages/LaporanOtomatisPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing-page" replace />} />
      <Route path="/landing-page" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/data-barang" element={<DataBarangPage />} />
      <Route path="/management-barang" element={<LaporanOtomatisPage />} />
      <Route path="/lapor-kerusakan" element={<LaporanMasalahPage />} />
      <Route path="/user-management" element={<UserPage />} />
      <Route path="/pengaturan" element={<PengaturanPage />} />
    </Routes>
  );
}

export default App;
