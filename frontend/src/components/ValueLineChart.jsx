import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import client from "../api/client";

export default function ValueLineChart({ portfolioId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // For now we create a synthetic series using current values
    const fetchSeries = async () => {
      try {
        // TODO: replace with real historical data endpoint if you have price history
        const res = await client.get("/portfolio/stocks/");
        const stocks = res.data.filter((s) => s.portfolio === portfolioId);
        // produce last 7-day total values as flat line with small jitter
        const total = stocks.reduce((acc, s) => acc + s.quantity * (s.last_price || 0), 0);
        const series = Array.from({ length: 7 }).map((_, i) => ({
          date: `Day-${i + 1}`,
          value: total * (1 + (Math.sin(i) * 0.01)), // small variation
        }));
        setData(series);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSeries();
  }, [portfolioId]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(v) => `₹${Number(v).toFixed(2)}`} />
        <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
