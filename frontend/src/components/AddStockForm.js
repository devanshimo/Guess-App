// src/components/AddStockForm.js
import React, { useState } from "react";
import client from "../api/client";

export default function AddStockForm({ onAdded }) {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [change, setChange] = useState(null);

  const searchSymbol = async (value) => {
    setSearch(value);
    setSelected(null);

    if (value.length < 2) {
      setOptions([]);
      return;
    }

    const res = await client.get(`/portfolio/search-symbols/?q=${value}`);
    setOptions(res.data);
  };

  const fetchLivePrice = async (symbol) => {
    try {
      const res = await client.get(`/portfolio/live-price/?symbol=${symbol}`);
      setPrice(res.data.price);
      setChange(res.data.change);
    } catch (err) {
      console.error("Price fetch failed", err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return alert("Choose a stock");

    await client.post("/portfolio/stocks/", {
      symbol: selected.symbol,
      name: selected.name,
      quantity: Number(qty),
      avg_buy_price: Number(price),
    });

    setSearch("");
    setSelected(null);
    setOptions([]);
    setQty("");
    setPrice("");

    onAdded && onAdded();
  };

  return (
    <form onSubmit={submit} style={styles.form}>
      {/* SEARCH BOX */}
      <div style={{ position: "relative", width: 300 }}>
        <input
          style={styles.input}
          placeholder="Search stocks (AAPL…)"
          value={search}
          onChange={(e) => searchSymbol(e.target.value)}
        />

        {/* DROPDOWN */}
        {options.length > 0 && (
          <div style={styles.dropdown}>
            {options.map((opt) => (
              <div
                key={opt.symbol}
                style={styles.option}
                onClick={() => {
                  setSelected(opt);
                  setSearch(`${opt.symbol} — ${opt.name}`);
                  fetchLivePrice(opt.symbol);
                  setOptions([]);
                }}
              >
                <div style={styles.symbol}>{opt.symbol}</div>
                <div style={styles.name}>{opt.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AUTO-FILLED INFO */}
      {selected && (
        <div style={styles.card}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {selected.symbol}
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>{selected.name}</div>

          {price && (
            <div style={{ marginTop: 8 }}>
              <b>₹{Number(price).toFixed(2)}</b>{" "}
              <span style={{ color: change >= 0 ? "green" : "red" }}>
                ({change.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      )}

      {/* QUANTITY */}
      <input
        style={styles.smallInput}
        type="number"
        placeholder="Qty"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        required
      />

      {/* BUY PRICE (auto-filled but editable) */}
      <input
        style={styles.smallInput}
        type="number"
        placeholder="Buy Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <button style={styles.button} type="submit">
        Add
      </button>
    </form>
  );
}

const styles = {
  form: { display: "flex", gap: 12, alignItems: "center" },
  input: {
    padding: 8,
    width: "100%",
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  dropdown: {
    position: "absolute",
    width: "100%",
    top: "38px",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: 6,
    zIndex: 99,
    maxHeight: 220,
    overflowY: "auto",
  },
  option: {
    padding: 10,
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0",
  },
  symbol: { fontWeight: 600, fontSize: 14 },
  name: { fontSize: 12, color: "#666" },
  card: {
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 6,
    background: "#fafafa",
  },
  smallInput: {
    padding: 8,
    width: 90,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  button: {
    padding: "8px 16px",
    background: "#0f62fe",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
