import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const PerformanceChart = ({ stocks, totals }) => {
  const data = {
    labels: ['Invested', 'Current Value'],
    datasets: [
      {
        label: 'Portfolio Value (₹)',
        data: [totals.invested, totals.current],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Portfolio Performance',
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export const AllocationChart = ({ stocks }) => {
  const data = {
    labels: stocks.map(stock => stock.symbol),
    datasets: [
      {
        label: 'Current Value (₹)',
        data: stocks.map(stock => stock.quantity * stock.last_price),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Portfolio Allocation',
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export const ProfitLossChart = ({ stocks }) => {
  const profitableStocks = stocks.filter(stock => {
    const pl = (stock.quantity * stock.last_price) - (stock.quantity * stock.avg_buy_price);
    return pl >= 0;
  });

  const lossStocks = stocks.filter(stock => {
    const pl = (stock.quantity * stock.last_price) - (stock.quantity * stock.avg_buy_price);
    return pl < 0;
  });

  const data = {
    labels: ['Profitable Stocks', 'Loss Stocks'],
    datasets: [
      {
        label: 'Number of Stocks',
        data: [profitableStocks.length, lossStocks.length],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Profit/Loss Distribution',
      },
    },
  };

  return <Bar data={data} options={options} />;
};