// src/pages/PortfolioDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import { PerformanceChart, AllocationChart, ProfitLossChart } from '../components/PortfolioChart';
import { PredictionChart, PredictionSummary } from '../components/PredictionChart';
import "../styles/PortfolioDetail.css";

export default function PortfolioDetail() {
  const { portfolioId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔄 PortfolioDetail loading for ID:", portfolioId);
    loadPortfolioData();
  }, [portfolioId]);

  const loadPredictions = async (stocks) => {
    const predictionData = {};
    
    for (const stock of stocks) {
      try {
        console.log(`📊 Loading ML prediction for ${stock.symbol}`);
        const predictionRes = await client.get(`/portfolio/predict/${stock.symbol}/`);
        predictionData[stock.symbol] = predictionRes.data;
        console.log(`✅ ML prediction for ${stock.symbol}:`, predictionRes.data);
      } catch (err) {
        console.error(`❌ Failed to load prediction for ${stock.symbol}:`, err);
        predictionData[stock.symbol] = null;
      }
    }
    
    return predictionData;
  };

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📡 Loading portfolio data...");
      
      // METHOD 1: Try to get portfolio from the summary endpoint
      try {
        const summaryRes = await client.get("/portfolio/summary/");
        console.log("✅ Summary data:", summaryRes.data);
        
        const foundPortfolio = summaryRes.data.find(p => p.id === parseInt(portfolioId));
        if (foundPortfolio) {
          console.log("🎯 Found portfolio in summary:", foundPortfolio);
          setPortfolio(foundPortfolio);
        } else {
          throw new Error("Portfolio not found in summary");
        }
      } catch (err) {
        console.log("❌ Summary method failed, trying portfolios list");
        
        // METHOD 2: Try portfolios list endpoint
        try {
          const portfoliosRes = await client.get("/portfolio/portfolios/");
          console.log("✅ Portfolios list:", portfoliosRes.data);
          
          const foundPortfolio = portfoliosRes.data.find(p => p.id === parseInt(portfolioId));
          if (foundPortfolio) {
            console.log("🎯 Found portfolio in list:", foundPortfolio);
            setPortfolio(foundPortfolio);
          } else {
            throw new Error("Portfolio not found in list");
          }
        } catch (err2) {
          console.log("❌ Both methods failed, creating basic portfolio");
          // METHOD 3: Create basic portfolio object
          setPortfolio({ 
            id: parseInt(portfolioId), 
            name: `Portfolio ${portfolioId}`,
            invested: 0,
            current: 0,
            pl: 0,
            pl_percent: 0
          });
        }
      }

      // Load stocks for this portfolio
      console.log("📡 Loading stocks...");
      const stocksRes = await client.get("/portfolio/stocks/");
      console.log("✅ All stocks:", stocksRes.data);
      
      const portfolioStocks = stocksRes.data.filter(
        stock => stock.portfolio === parseInt(portfolioId)
      );
      console.log("🎯 Filtered stocks:", portfolioStocks);
      
      setStocks(portfolioStocks);
      
      // Load ML predictions for each stock
      console.log("🤖 Loading ML predictions...");
      const predictionsData = await loadPredictions(portfolioStocks);
      setPredictions(predictionsData);
      
    } catch (err) {
      console.error("❌ Error in PortfolioDetail:", err);
      setError(err.message);
      // Create basic portfolio on error
      setPortfolio({ 
        id: parseInt(portfolioId), 
        name: `Portfolio ${portfolioId}`,
        invested: 0,
        current: 0,
        pl: 0,
        pl_percent: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStockPrices = async () => {
    try {
      console.log("🔄 Manually refreshing stock prices...");
      const updatedStocks = [...stocks];
      
      for (let i = 0; i < updatedStocks.length; i++) {
        try {
          const stock = updatedStocks[i];
          const res = await client.get(`/portfolio/live-price/?symbol=${stock.symbol}`);
          console.log(`💰 ${stock.symbol} new price:`, res.data.price);
          updatedStocks[i].last_price = res.data.price;
        } catch (err) {
          console.error(`❌ Failed to refresh price for ${updatedStocks[i].symbol}`);
        }
      }
      
      setStocks(updatedStocks);
      alert("Prices refreshed successfully!");
    } catch (err) {
      console.error("Error refreshing prices:", err);
      alert("Failed to refresh prices");
    }
  };

  const calculateTotalValues = () => {
    const invested = stocks.reduce((sum, stock) => 
      sum + (stock.quantity * stock.avg_buy_price), 0
    );
    const current = stocks.reduce((sum, stock) => 
      sum + (stock.quantity * stock.last_price), 0
    );
    const pl = current - invested;
    const plPercent = invested > 0 ? (pl / invested) * 100 : 0;

    return { invested, current, pl, plPercent };
  };

  if (loading) {
    return (
      <div className="portfolio-detail">
        <div className="loading">Loading portfolio details...</div>
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="portfolio-detail">
        <div className="error-message">
          <h2>Portfolio Unavailable</h2>
          <p>Error: {error}</p>
          <p>We couldn't load the portfolio details. The portfolio data might not exist.</p>
          <Link to="/portfolio" className="btn">← Back to Portfolios</Link>
        </div>
      </div>
    );
  }

  const totals = calculateTotalValues();

  return (
    <div className="portfolio-detail">
      <div className="portfolio-header">
        <h1>{portfolio?.name || `Portfolio ${portfolioId}`}</h1>
        
        {/* Refresh Prices Button */}
        <div className="price-refresh-section">
          <button onClick={refreshStockPrices} className="btn refresh-btn">
            🔄 Refresh Prices
          </button>
          <span className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="portfolio-summary">
          <div className="summary-card">
            <span className="label">Invested</span>
            <span className="value">₹{totals.invested.toFixed(2)}</span>
          </div>
          <div className="summary-card">
            <span className="label">Current Value</span>
            <span className="value">₹{totals.current.toFixed(2)}</span>
          </div>
          <div className={`summary-card ${totals.pl >= 0 ? 'profit' : 'loss'}`}>
            <span className="label">P/L</span>
            <span className="value">
              ₹{totals.pl.toFixed(2)} ({totals.plPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Stocks List */}
      <div className="stocks-section">
        <h2>Stocks in Portfolio</h2>
        {stocks.length === 0 ? (
          <div className="no-stocks">
            <p>No stocks found in this portfolio.</p>
            <Link to="/stocks" className="btn">
              Add Stocks
            </Link>
          </div>
        ) : (
          <div className="stocks-grid">
            {stocks.map(stock => {
              const invested = stock.quantity * stock.avg_buy_price;
              const current = stock.quantity * stock.last_price;
              const pl = current - invested;
              const plPercent = invested > 0 ? (pl / invested) * 100 : 0;
              const prediction = predictions[stock.symbol];

              return (
                <div key={stock.id} className="stock-card">
                  <div className="stock-header">
                    <div className="stock-symbol">{stock.symbol}</div>
                    <div className="stock-name">{stock.name}</div>
                  </div>
                  
                  <div className="stock-details">
                    <div className="detail-row">
                      <span>Quantity:</span>
                      <span>{stock.quantity}</span>
                    </div>
                    <div className="detail-row">
                      <span>Avg Buy Price:</span>
                      <span>₹{Number(stock.avg_buy_price).toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Current Price:</span>
                      <span>₹{Number(stock.last_price).toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Invested:</span>
                      <span>₹{invested.toFixed(2)}</span>
                    </div>
                    <div className={`detail-row ${pl >= 0 ? 'profit' : 'loss'}`}>
                      <span>P/L:</span>
                      <span>
                        ₹{pl.toFixed(2)} ({plPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* ML Prediction Section */}
                  {prediction && (
                    <div className="prediction-section">
                      <PredictionSummary 
                        symbol={stock.symbol}
                        predictionData={prediction}
                        currentPrice={stock.last_price}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Charts Section */}
      {stocks.length > 0 && (
        <div className="charts-section">
          <h2>Portfolio Analytics</h2>
          
          <div className="charts-grid">
            <div className="chart-container">
              <h4>Portfolio Performance</h4>
              <PerformanceChart stocks={stocks} totals={totals} />
            </div>
            
            <div className="chart-container">
              <h4>Stock Allocation</h4>
              <AllocationChart stocks={stocks} />
            </div>
            
            <div className="chart-container">
              <h4>Profit/Loss Distribution</h4>
              <ProfitLossChart stocks={stocks} />
            </div>
          </div>
        </div>
      )}

      {/* ML Predictions Section */}
      {stocks.length > 0 && Object.keys(predictions).length > 0 && (
        <div className="ml-predictions-section">
          <h2>🤖 AI Stock Predictions</h2>
          <div className="predictions-grid">
            {stocks.map(stock => {
              const prediction = predictions[stock.symbol];
              if (!prediction) return null;
              
              return (
                <div key={stock.symbol} className="prediction-card">
                  <div className="prediction-header">
                    <h3>{stock.symbol} - 7-Day Forecast</h3>
                  </div>
                  <div className="prediction-chart">
                    <PredictionChart 
                      symbol={stock.symbol}
                      predictionData={prediction}
                      currentPrice={stock.last_price}
                    />
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>
      )}

      <div className="back-link">
        <Link to="/portfolio">← Back to Portfolios</Link>
      </div>
    </div>
  );
}