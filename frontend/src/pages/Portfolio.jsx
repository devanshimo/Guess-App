// src/pages/Portfolio.jsx - DEBUG VERSION
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import "../styles/PortfolioDetail.css";

export default function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🚀 Portfolio component mounted");
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test multiple possible endpoints
      const endpoints = [
        "/portfolio/summary/",
        "/portfolio/portfolios/", 
        "/portfolio/"
      ];
      
      let portfolioData = [];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Trying endpoint: ${endpoint}`);
          const res = await client.get(endpoint);
          console.log(`✅ ${endpoint} response:`, res.data);
          
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            portfolioData = res.data;
            console.log(`🎯 Found data from ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`❌ ${endpoint} failed:`, err.message);
        }
      }
      
      if (portfolioData.length > 0) {
        setPortfolios(portfolioData);
      } else {
        console.log("🔄 No API data found, using mock data");
        // Use comprehensive mock data
        setPortfolios([
          { 
            id: 1, 
            name: "US Market", 
            invested: 2781.88, 
            current: 1564.36, 
            pl: -1217.52, 
            pl_percent: -43.77 
          },
          { 
            id: 2, 
            name: "Long Term Holdings", 
            invested: 5000.00, 
            current: 5200.00, 
            pl: 200.00, 
            pl_percent: 4.00 
          },
          { 
            id: 3, 
            name: "Crypto Portfolio", 
            invested: 1000.00, 
            current: 1500.00, 
            pl: 500.00, 
            pl_percent: 50.00 
          }
        ]);
      }
      
    } catch (err) {
      console.error("💥 Major error loading portfolios:", err);
      setError(err.message);
      // Fallback to mock data
      setPortfolios([
        { 
          id: 1, 
          name: "US Market (Fallback)", 
          invested: 2781.88, 
          current: 1564.36, 
          pl: -1217.52, 
          pl_percent: -43.77 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  console.log("🔄 Current state:", { loading, portfolios: portfolios.length, error });

  if (loading) {
    return (
      <div className="portfolio-page">
        <h1>Your Portfolios</h1>
        <div className="loading">Loading portfolios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-page">
        <h1>Your Portfolios</h1>
        <div className="error-message">
          <h3>Error Loading Portfolios</h3>
          <p>{error}</p>
          <button onClick={loadPortfolios} className="btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <h1>Your Portfolios</h1>
      
      {/* Debug Info */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        marginBottom: '20px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Debug Info:</h3>
        <p><strong>Portfolios Found:</strong> {portfolios.length}</p>
        <p><strong>Data:</strong> {JSON.stringify(portfolios)}</p>
        <button onClick={loadPortfolios} className="btn" style={{marginRight: '10px'}}>
          Reload Data
        </button>
        <button onClick={() => console.log('Current portfolios:', portfolios)} className="btn">
          Log to Console
        </button>
      </div>
      
      <div className="portfolios-grid">
        {portfolios.map(portfolio => (
          <Link 
            key={portfolio.id} 
            to={`/portfolio/${portfolio.id}`}
            className="portfolio-card"
          >
            <h3>{portfolio.name}</h3>
            <div className="portfolio-stats">
              <div className="stat">
                <span className="label">Invested:</span>
                <span className="value">₹{portfolio.invested?.toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="label">Current:</span>
                <span className="value">₹{portfolio.current?.toFixed(2)}</span>
              </div>
              <div className={`stat ${portfolio.pl >= 0 ? 'profit' : 'loss'}`}>
                <span className="label">P/L:</span>
                <span className="value">
                  ₹{portfolio.pl?.toFixed(2)} ({portfolio.pl_percent?.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="view-details">View Details →</div>
          </Link>
        ))}
      </div>

      {portfolios.length === 0 && (
        <div className="no-portfolios">
          <p>No portfolios found. The API returned empty data.</p>
          <Link to="/stocks" className="btn">
            Add Stocks
          </Link>
        </div>
      )}
    </div>
  );
}