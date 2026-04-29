// src/components/AddPortfolioForm.js
import React, { useState } from "react";
import client from "../api/client";

export default function AddPortfolioForm({ onAdded }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await client.post("/portfolio/portfolios/", { name });

      setName("");

      // Refresh dropdown in parent
      onAdded && onAdded();
    } catch (err) {
      console.error(err);
      alert("Failed to create portfolio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <input
        placeholder="New Portfolio Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Portfolio"}
      </button>
    </form>
  );
}
