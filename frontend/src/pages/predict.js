import React, { useState } from "react";
import client from "../api/client";
import {
  TextField,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Predict() {
  const [symbol, setSymbol] = useState("AAPL");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true);
    setData(null);

    try {
      const res = await client.post("/predict/", { symbol });
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed. Check symbol or backend.");
    }

    setLoading(false);
  };

  const chartData =
    data?.future_dates?.map((date, i) => ({
      date,
      price: data.prediction[i],
    })) || [];

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        7-Day Stock Forecast
      </Typography>

      {/* Input Row */}
      <Box display="flex" gap={2} alignItems="center" mb={3}>
        <TextField
          label="Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          sx={{ width: "200px" }}
        />

        <Button
          variant="contained"
          size="large"
          onClick={predict}
          disabled={loading}
        >
          Predict
        </Button>
      </Box>

      {/* Loading Spinner */}
      {loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Result Section */}
      {data && !loading && (
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {symbol} — Forecast Result
            </Typography>

            <Typography variant="body1" sx={{ mb: 3 }}>
              <b>Last Price:</b> ${data.last_price.toFixed(2)}
            </Typography>

            {/* Chart */}
            <Box sx={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
