import React, { useState } from "react";
import client from "../api/client";

export default function BuySellModal({ open, onClose, config = {}, onDone, stocks = [] }) {
  const { type, stockId } = config;
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const stock = stocks.find((s) => s.id === stockId) || {};

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await client.post("/portfolio/transactions/", {
        stock: stockId,
        type,
        quantity: Number(quantity),
        price: Number(price),
      });
      onDone && onDone();
    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", left: 0, right: 0, top: 0, bottom: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.3)"
    }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 20, borderRadius: 8, minWidth: 320 }}>
        <h3>{type} — {stock.symbol || "Stock"}</h3>
        <div style={{ marginBottom: 10 }}>
          <label>Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Price (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" required />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading}>{loading ? "Processing..." : type}</button>
        </div>
      </form>
    </div>
  );
}
