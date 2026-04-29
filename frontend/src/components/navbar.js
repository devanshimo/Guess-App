import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 20px",
        background: "#222",
        color: "white",
        alignItems: "center",
      }}
    >
      <h2 style={{ margin: 0 }}>Guess</h2>

      {user && (
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link to="/stocks" style={{ color: "white", textDecoration: "none" }}>
            Stocks
          </Link>

          <Link
            to="/portfolio"
            style={{ color: "white", textDecoration: "none" }}
          >
            Portfolio
          </Link>

          <button
            onClick={logout}
            style={{
              background: "tomato",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
