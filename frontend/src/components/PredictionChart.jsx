import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const PredictionChart = ({ symbol, predictionData, currentPrice }) => {
  if (!predictionData || !predictionData.prediction) {
    return (
      <div className="prediction-placeholder">
        <p>No prediction data available</p>
      </div>
    );
  }

  const { prediction, future_dates, last_price } = predictionData;
  
  const allPrices = [last_price || currentPrice, ...prediction];
  const allDates = [
    'Today',
    ...future_dates.map(date => new Date(date).toLocaleDateString())
  ];

  const data = {
    labels: allDates,
    datasets: [
      {
        label: `${symbol} Price Prediction`,
        data: allPrices,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        pointBackgroundColor: allPrices.map((price, index) => 
          index === 0 ? 'rgb(255, 99, 132)' : 'rgb(75, 192, 192)'
        ),
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
        text: `7-Day Price Prediction for ${symbol}`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
  };

  return <Line data={data} options={options} />;
};

export const PredictionSummary = ({ symbol, predictionData, currentPrice }) => {
  if (!predictionData || !predictionData.prediction) {
    return null;
  }

  const { prediction, last_price } = predictionData;
  const current = last_price || currentPrice;
  const predictedPrice = prediction[prediction.length - 1];
  const priceChange = predictedPrice - current;
  const percentChange = (priceChange / current) * 100;

  return (
    <div className={`prediction-summary ${percentChange >= 0 ? 'bullish' : 'bearish'}`}>
      <h4>🤖 ML Prediction (7 Days)</h4>
      <div className="prediction-stats">
        <div className="prediction-stat">
          <span>Current:</span>
          <strong>₹{current.toFixed(2)}</strong>
        </div>
        <div className="prediction-stat">
          <span>Predicted:</span>
          <strong>₹{predictedPrice.toFixed(2)}</strong>
        </div>
        <div className="prediction-stat">
          <span>Expected Change:</span>
          <strong className={percentChange >= 0 ? 'positive' : 'negative'}>
            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
          </strong>
        </div>
      </div>
    </div>
  );
};