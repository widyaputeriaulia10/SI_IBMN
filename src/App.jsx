import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
// import DashboardPage from "./pages/DashboardPage";
// import DataBarangPage from "./pages/DataBarangPage";
import UserPage from "./pages/UserPage";
import LaporanMasalahPage from "./pages/LaporanMasalahPage";
import PengaturanPage from "./pages/PengaturanPage";
import LaporanOtomatisPage from "./pages/LaporanOtomatisPage";
import LandingPage from "./pages/LandingPage";
import RequireAuth from "./auth/RequireAuth"; // <-- import

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing-page" replace />} />
      <Route path="/landing-page" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Kunci akses: bungkus dengan <RequireAuth> */}
      {/* <Route
        path="/data-barang"
        element={
          <RequireAuth>
            <DataBarangPage />
          </RequireAuth>
        }
      /> */}
      <Route
        path="/management-barang"
        element={
          <RequireAuth>
            <LaporanOtomatisPage />
          </RequireAuth>
        }
      />
      <Route
        path="/history-barang"
        element={
          <RequireAuth>
            <LaporanMasalahPage />
          </RequireAuth>
        }
      />
      <Route
        path="/user-management"
        element={
          <RequireAuth>
            <UserPage />
          </RequireAuth>
        }
      />
      <Route
        path="/pengaturan"
        element={
          <RequireAuth>
            <PengaturanPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
