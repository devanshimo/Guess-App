import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

import client from "../api/client";
import { toast } from "react-toastify";

export default function StockModal({ open, handleClose, refresh, editData }) {
  const [form, setForm] = useState({
    portfolio: "",
    symbol: "",
    name: "",
    quantity: "",
    avg_buy_price: "",
  });

  const [portfolios, setPortfolios] = useState([]);

  const loadPortfolios = async () => {
    try {
      const res = await client.get("/portfolio/portfolios/");
      setPortfolios(res.data);
    } catch (err) {
      toast.error("Failed to load portfolios");
    }
  };

  useEffect(() => {
    loadPortfolios();

    if (editData) {
      setForm(editData);
    } else {
      setForm({
        portfolio: "",
        symbol: "",
        name: "",
        quantity: "",
        avg_buy_price: "",
      });
    }
  }, [editData]);

  const submit = async () => {
    try {
      if (editData) {
        await client.put(`/portfolio/stocks/${editData.id}/`, form);
        toast.success("Stock updated");
      } else {
        await client.post(`/portfolio/stocks/`, form);
        toast.success("Stock added");
      }

      refresh();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save stock");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? "Edit Stock" : "Add Stock"}</DialogTitle>

      <DialogContent>

        {/* Portfolio selection */}
        <TextField
          select
          fullWidth
          margin="dense"
          label="Portfolio"
          value={form.portfolio}
          onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
        >
          {portfolios.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          margin="dense"
          fullWidth
          label="Symbol (AAPL)"
          value={form.symbol}
          onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
        />

        <TextField
          margin="dense"
          fullWidth
          label="Company Name (Apple Inc.)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <TextField
          margin="dense"
          fullWidth
          type="number"
          label="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />

        <TextField
          margin="dense"
          fullWidth
          type="number"
          label="Avg Buy Price (₹)"
          value={form.avg_buy_price}
          onChange={(e) => setForm({ ...form, avg_buy_price: e.target.value })}
        />

      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
