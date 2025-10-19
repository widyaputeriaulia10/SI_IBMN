// src/auth/RequireAuth.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

async function checkSession() {
  // coba /auth/me
  let r = await fetch("/auth/me", { credentials: "include" });
  if (r.ok) return r.json();

  // kalau 401, coba refresh lalu ulang /auth/me
  const ref = await fetch("/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!ref.ok) throw new Error("unauthenticated");

  r = await fetch("/auth/me", { credentials: "include" });
  if (!r.ok) throw new Error("unauthenticated");
  return r.json();
}

export default function RequireAuth({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, ok: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await checkSession();
        if (alive) setState({ loading: false, ok: true });
      } catch {
        if (alive) setState({ loading: false, ok: false });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) {
    return <div style={{ display: "grid", placeItems: "center", minHeight: "50vh", color: "#64748b" }}>Memuat…</div>;
  }

  if (!state.ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
