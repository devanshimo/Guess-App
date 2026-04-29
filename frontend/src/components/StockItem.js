// src/components/StockItem.js
import React from "react";

export default function StockItem({ stock, onEdit, onDelete }) {
  return (
    <li style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <strong>{stock.symbol}</strong> — {stock.name} — ₹{Number(stock.price).toFixed(2)}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onEdit(stock)}>Edit</button>
        <button onClick={() => onDelete(stock)}>Delete</button>
      </div>
    </li>
  );
}
