// import React from "react";

// const LoginPage = () => {
//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <img
//           src="/logo-uin.png"
//           alt="UIN Logo"
//           style={{ width: 80, marginBottom: 16 }}
//         />
//         <h2 style={styles.title}>Sistem Inventaris BMN</h2>
//         <p style={styles.subtitle}>Fakultas Sains dan Teknologi</p>
//         <form style={{ width: "100%" }}>
//           <input
//             type="text"
//             style={styles.input}
//             placeholder="Username / NIP"
//           />
//           <input
//             type="password"
//             style={styles.input}
//             placeholder="Kata Sandi"
//           />
//           <button type="submit" style={styles.button}>
//             Masuk
//           </button>
//         </form>
//         <p style={styles.footer}>© 2025 UIN Sunan Gunung Djati Bandung</p>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     background: "linear-gradient(to right, #007e3a, #00a8e8)",
//     height: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   card: {
//     backgroundColor: "white",
//     padding: "2rem",
//     borderRadius: "12px",
//     width: "100%",
//     maxWidth: "400px",
//     boxShadow: "0 0 15px rgba(0, 0, 0, 0.15)",
//     textAlign: "center",
//   },
//   title: {
//     margin: 0,
//     color: "#007e3a",
//   },
//   subtitle: {
//     marginTop: 4,
//     marginBottom: 24,
//     fontSize: "16px",
//     color: "#004d26",
//   },
//   input: {
//     width: "100%",
//     padding: "0.75rem",
//     margin: "0.5rem 0 1rem",
//     borderRadius: "8px",
//     border: "1px solid #ccc",
//     fontSize: "1rem",
//   },
//   button: {
//     width: "100%",
//     padding: "0.75rem",
//     backgroundColor: "#0077b6",
//     border: "none",
//     borderRadius: "8px",
//     color: "white",
//     fontSize: "1rem",
//     cursor: "pointer",
//   },
//   footer: {
//     fontSize: "0.8rem",
//     color: "#666",
//     marginTop: "1rem",
//   },
// };

// export default LoginPage;

import React from "react";
import "../styles/LoginPage.css";

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/logo-uin.png" alt="Logo UIN" className="login-logo" />
        <h2 className="login-title">
          Sistem Informasi Inventaris Barang Milik Negara
        </h2>
        <p className="login-subtitle">
          Fakultas Sains dan Teknologi
          <br />
          UIN Sunan Gunung Djati Bandung
        </p>

        <form className="login-form">
          <input type="text" placeholder="Username" className="login-input" />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="login-note">
          Belum punya akun? <a href="#">Hubungi admin</a>
        </p>
      </div>
      <div className="img-container">
        <img
          src="/login-ilust.webp"
          alt="Logo Overlay"
          className="logo-overlay"
          style={{ width: "585px" }}
        />
      </div>

      <div className="login-right">
        <img
          src="/login-bg.png"
          alt="Login Illustration"
          className="login-illustration"
        />
      </div>
    </div>
  );
};

export default LoginPage;
