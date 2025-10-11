import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MarketPrices() {
  const [commodity, setCommodity] = useState("");
  const [states, setStates] = useState([]);
  const [state, setState] = useState("");
  const [markets, setMarkets] = useState([]);
  const [market, setMarket] = useState("");
  const [quantity, setQuantity] = useState("");
  const [prices, setPrices] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
  const baseUrl = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

  const fetchStates = async (crop) => {
    setState(""); setMarket(""); setMarkets([]); setPrices([]); setTotalRevenue(null);
    if (!crop) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}?api-key=${apiKey}&format=json&limit=100&filters[commodity]=${crop}`);
      const data = await res.json();
      if (data.records) {
        const uniqueStates = [...new Set(data.records.map((r) => r.state))];
        setStates(uniqueStates);
      }
    } catch (err) {
      console.error(err); alert("Failed to fetch states.");
    } finally { setLoading(false); }
  };

  const fetchMarkets = async (crop, stateName) => {
    setMarket(""); setMarkets([]); setPrices([]); setTotalRevenue(null);
    if (!crop || !stateName) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}?api-key=${apiKey}&format=json&limit=100&filters[commodity]=${crop}&filters[state]=${stateName}`);
      const data = await res.json();
      if (data.records) {
        const uniqueMarkets = [...new Set(data.records.map((r) => `${r.market} (${r.arrivals_in_qtl} qtl)`))];
        setMarkets(uniqueMarkets);
      }
    } catch (err) {
      console.error(err); alert("Failed to fetch markets.");
    } finally { setLoading(false); }
  };

  const fetchPrices = async () => {
    if (!commodity || !state || !market || !quantity) {
      alert("Please fill all fields!"); return;
    }
    setLoading(true);
    try {
      const marketName = market.split(" (")[0];
      const res = await fetch(`${baseUrl}?api-key=${apiKey}&format=json&limit=10&filters[commodity]=${commodity}&filters[state]=${state}&filters[market]=${marketName}`);
      const data = await res.json();
      if (!data.records || data.records.length === 0) {
        alert("No prices found!"); setPrices([]); setTotalRevenue(null); return;
      }
      setPrices(data.records);
      const latestPrice = parseInt(data.records[0]["modal_price"]);
      setTotalRevenue(latestPrice * quantity);
    } catch (err) {
      console.error(err); alert("Failed to fetch prices.");
    } finally { setLoading(false); }
  };

  return (
    <div className="market-page">
      <div className="container">
        <h2>🌾 Farm2Home Market Prices</h2>

        <div className="form-grid">
          <div className="field">
            <label>Crop:</label>
            <select
              value={commodity}
              onChange={(e) => { setCommodity(e.target.value); fetchStates(e.target.value); }}
            >
              <option value="">Select Crop</option>
              <option value="Onion">Onion</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Maize">Maize</option>
            </select>
          </div>

          <div className="field">
            <label>Quantity (quintals):</label>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>

          <div className="field">
            <label>State:</label>
            <select value={state} onChange={e => { setState(e.target.value); fetchMarkets(commodity, e.target.value); }} disabled={!commodity}>
              <option value="">Select State</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Market:</label>
            <select value={market} onChange={e => setMarket(e.target.value)} disabled={!state}>
              <option value="">Select Market</option>
              {markets.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <button onClick={fetchPrices} disabled={loading}>{loading ? "Fetching..." : "Get Prices"}</button>

        {prices.length > 0 && (
          <div className="table-container">
            <h3>Market Prices for {commodity} in {market}, {state}</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Min Price</th><th>Modal Price</th><th>Max Price</th><th>Arrivals (qtl)</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.arrival_date}</td>
                    <td>₹{p.min_price}</td>
                    <td>₹{p.modal_price}</td>
                    <td>₹{p.max_price}</td>
                    <td>{p.arrivals_in_qtl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalRevenue !== null && <div className="revenue">💰 Estimated Revenue: ₹{totalRevenue}</div>}
      </div>
      

      <style>{`
        .market-page { display: flex; flex-direction: column; min-height: 100vh; background: linear-gradient(145deg, #e0f0ff, #c1e5ff); }
        .container { flex: 1; max-width: 950px; margin: 50px auto; padding: 30px; background: linear-gradient(to right, #ffffff, #f0f8ff); border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); transition: all 0.3s ease; }
        h2 { text-align: center; font-size: 30px; font-weight: 700; background: linear-gradient(90deg, #2563eb, #1e40af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: fadeInText 1.5s ease forwards; margin-bottom: 30px; }
        @keyframes fadeInText { 0% { opacity:0; transform: translateY(-20px); } 100% { opacity:1; transform: translateY(0); } }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .field label { font-weight: 600; margin-bottom: 5px; display: block; color: #1e3a8a; transition: color 0.3s ease; }
        .field label:hover { color: #2563eb; }
        input, select { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ccc; transition: 0.4s; background: #f5faff; font-size: 15px; }
        input:focus, select:focus { border-color: #1e40af; box-shadow: 0 0 12px rgba(37,99,235,0.3); outline: none; transform: scale(1.02); }
        button { width: 100%; padding: 14px; background: linear-gradient(90deg, #1e40af, #2563eb); color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 16px; transition: all 0.3s ease; }
        button:hover { transform: scale(1.05); box-shadow: 0 8px 25px rgba(37,99,235,0.4); background: linear-gradient(90deg, #2563eb, #1e3a8a); }
        .table-container { margin-top: 30px; overflow-x: auto; border-radius: 16px; animation: fadeIn 1s ease; }
        table { width: 100%; border-collapse: collapse; background: #f9faff; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
        th, td { padding: 14px; border: 1px solid #ddd; text-align: center; font-size: 15px; transition: background 0.3s; }
        th { background: linear-gradient(90deg, #93c5fd, #60a5fa); color: #1e3a8a; }
        tr:hover { background: linear-gradient(90deg, #bfdbfe, #93c5fd); }
        .revenue { margin-top: 25px; text-align: center; font-size: 22px; font-weight: 700; color: #1e40af; animation: bounce 1.5s infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @media(max-width: 700px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
