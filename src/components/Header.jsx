import { Link, useNavigate } from "react-router-dom";

export default function Header({ onLogout }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    onLogout();
    navigate("/"); // optional safety redirect
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 16px",
        borderBottom: "1px solid #ddd",
        marginBottom: 12,
      }}
    >
      {/* 👇 Clickable app title */}
      <Link
        to="/daily-logs"
        style={{
          fontSize: 20,
          fontWeight: 800,
          textDecoration: "none",
          color: "#ffffff",
          cursor: "pointer",
        }}
      >
        Trading Journal
      </Link>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/daily-logs">Daily Logs</Link>
        <Link to="/analytics">Analytics</Link>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{ marginLeft: "auto" }}
      >
        Logout
      </button>
    </header>
  );
}
