import React from "react";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#FF6384"];

export default function AllocationChart({ data }) {
  // data: [{symbol, value, id}, ...]
  const chartData = data.map((d) => ({ name: d.symbol, value: d.value }));

  return (
    <PieChart width={350} height={260}>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        label
      >
        {chartData.map((entry, idx) => (
          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
      <Legend />
    </PieChart>
  );
}
