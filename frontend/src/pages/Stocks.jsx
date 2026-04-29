// src/pages/Stocks.jsx
import React, { useState, useEffect, useRef } from "react";
import client from "../api/client";
import "../styles/Stocks.css";

export default function Stocks() {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [stocks, setStocks] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    quantity: "",
    price: "",
  });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load portfolios
  useEffect(() => {
    client.get("/portfolio/portfolios/").then((res) => {
      setPortfolios(res.data);
    });
  }, []);

  // Load stocks
  const loadStocks = () => {
    client.get("/portfolio/stocks/").then((res) => {
      setStocks(res.data);
    });
  };

  useEffect(() => {
    loadStocks();
  }, []);

  // Search autocomplete - USING YAHOO FINANCE API
  useEffect(() => {
    const doSearch = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Searching Yahoo Finance for:", query);
        const res = await client.get(`/portfolio/search-symbols/?q=${query}`);
        console.log("Yahoo Finance search results:", res.data);
        
        if (res.data && Array.isArray(res.data)) {
          setSuggestions(res.data);
          setShowDropdown(true);
        } else {
          console.warn("Unexpected response format:", res.data);
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Yahoo Finance search error:", err);
        
        if (err.response) {
          console.error("API Error Status:", err.response.status);
          console.error("API Error Data:", err.response.data);
          
          if (err.response.status === 401) {
            console.error("Authentication error - please check if you're logged in");
            // You might want to redirect to login here
          } else if (err.response.status === 404) {
            console.error("Search endpoint not found - check backend URL");
          }
        } else if (err.request) {
          console.error("Network error - no response received from server");
        } else {
          console.error("Unexpected error:", err.message);
        }
        
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(doSearch, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle stock selection from dropdown
  const handleStockSelect = (stock) => {
    setQuery(stock.symbol);
    setForm({ 
      ...form, 
      symbol: stock.symbol, 
      name: stock.name 
    });
    setShowDropdown(false);
    setSuggestions([]);
  };

  // Add stock
  const addStock = async () => {
    if (!selectedPortfolio) {
      alert("Please select a portfolio");
      return;
    }
    if (!form.symbol || !form.quantity || !form.price) {
      alert("Please fill all fields");
      return;
    }

    try {
      await client.post("/portfolio/stocks/", {
        portfolio: Number(selectedPortfolio),
        symbol: form.symbol,
        name: form.name,
        quantity: Number(form.quantity),
        avg_buy_price: Number(form.price),
        last_price: Number(form.price),
      });

      setForm({ symbol: "", name: "", quantity: "", price: "" });
      setQuery("");
      setSuggestions([]);
      loadStocks();
      alert("Stock added successfully!");
    } catch (err) {
      console.error("Add stock error:", err);
      alert("Failed to add stock");
    }
  };

  // Handle Enter key in search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleStockSelect(suggestions[0]);
    }
  };

  // Test API connection
  const testSearchAPI = () => {
    console.log("Testing Yahoo Finance search API...");
    client.get("/portfolio/search-symbols/?q=AAPL")
      .then(res => {
        console.log("✅ Yahoo Finance search API test successful:", res.data);
        if (res.data && res.data.length > 0) {
          alert(`Search API is working! Found ${res.data.length} results for AAPL.`);
        } else {
          alert("Search API returned no results. Check backend Yahoo Finance integration.");
        }
      })
      .catch(err => {
        console.error("❌ Yahoo Finance search API test failed:", err);
        if (err.response?.status === 401) {
          alert("Authentication failed. Please log in again.");
        } else if (err.response?.status === 404) {
          alert("Search endpoint not found. Check backend URL configuration.");
        } else {
          alert("Search API failed. Check console for details.");
        }
      });
  };

  // Clear search and form
  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setForm({ symbol: "", name: "", quantity: "", price: "" });
  };

  return (
    <div className="stocks-page">
      <h1>Stocks</h1>

      {/* Debug Section - Temporary */}
      <div style={{ 
        margin: '10px 0', 
        padding: '10px', 
        background: '#f5f5f5', 
        borderRadius: '5px',
        border: '1px solid #ddd'
      }}>
        <button 
          onClick={testSearchAPI}
          style={{ 
            padding: '8px 16px', 
            marginRight: '10px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Search API
        </button>
        <button 
          onClick={() => {
            const token = localStorage.getItem("access");
            console.log("Auth token exists:", !!token);
            console.log("Current state:", { query, suggestions, showDropdown, loading });
          }}
          style={{ 
            padding: '8px 16px',
            marginRight: '10px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Debug State
        </button>
        <button 
          onClick={clearSearch}
          style={{ 
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Search
        </button>
      </div>

      {/* FORM SECTION */}
      <div className="form-container">
        <div className="form-row">
          
          {/* Portfolio Dropdown */}
          <div className="input-group">
            <label>Portfolio</label>
            <select
              className="input"
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
            >
              <option value="">Select Portfolio</option>
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Search Box - USING YAHOO FINANCE */}
          <div className="input-group" ref={dropdownRef}>
            <label>Stock Search</label>
            <div className="autocomplete-wrapper">
              <input
                className="input search-input"
                placeholder="Search stocks (AAPL, TSLA, etc.)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0 || query.length >= 2) {
                    setShowDropdown(true);
                  }
                }}
                onKeyPress={handleKeyPress}
              />
              
              {loading && <div className="search-loading">🔍 Searching Yahoo Finance...</div>}

              {showDropdown && (
                <div className="enhanced-dropdown">
                  {suggestions.length > 0 ? (
                    suggestions.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="enhanced-item"
                        onClick={() => handleStockSelect(stock)}
                      >
                        <div className="stock-symbol">{stock.symbol}</div>
                        <div className="stock-name">{stock.name}</div>
                      </div>
                    ))
                  ) : query.length >= 2 && !loading ? (
                    <div className="no-results">No stocks found for "{query}"</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="input-group">
            <label>Quantity</label>
            <input
              className="input"
              placeholder="Quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>

          {/* Price Input */}
          <div className="input-group">
            <label>Buy Price (₹)</label>
            <input
              className="input"
              placeholder="Buy Price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          {/* Add Button */}
          <div className="input-group">
            <label>&nbsp;</label>
            <button className="btn" onClick={addStock}>
              Add Stock
            </button>
          </div>
        </div>

        {/* Selected Stock Info */}
        {form.symbol && (
          <div className="selected-stock-info">
            <strong>Selected Stock:</strong> {form.symbol} - {form.name}
          </div>
        )}
      </div>

      {/* STOCK LIST SECTION */}
      <div className="stock-list-section">
        <h2>Your Stocks</h2>
        <div className="stock-list">
          {stocks.length === 0 ? (
            <div className="no-stocks">
              <p>No stocks added yet. Add your first stock above!</p>
            </div>
          ) : (
            stocks.map((stock) => (
              <div key={stock.id} className="stock-card">
                <div className="stock-header">
                  <span className="stock-symbol-large">{stock.symbol}</span>
                  <span className="stock-name">{stock.name}</span>
                </div>
                <div className="stock-details">
                  <div className="stock-detail">
                    <span>Quantity:</span>
                    <strong>{stock.quantity}</strong>
                  </div>
                  <div className="stock-detail">
                    <span>Avg Buy Price:</span>
                    <strong>₹{Number(stock.avg_buy_price).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}