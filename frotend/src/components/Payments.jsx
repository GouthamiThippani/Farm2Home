import React, { useState, useEffect } from "react";

export default function Payments({ farmerId }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem("ib_orders") || "[]");
    // Filter only orders belonging to this farmer
    const farmerSales = allOrders.filter(order => order.farmerId === farmerId);
    setSales(farmerSales);
  }, [farmerId]);

  const totalRevenue = sales.reduce((acc, order) => acc + order.price * order.quantity, 0);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>Payments / Revenue</h2>
      {sales.length === 0 ? (
        <p>No products sold yet!</p>
      ) : (
        <>
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity Sold (kg)</th>
                <th>Price per kg (₹)</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((order, index) => (
                <tr key={index}>
                  <td>{order.name}</td>
                  <td>{order.quantity}</td>
                  <td>{order.price}</td>
                  <td>{order.price * order.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={{ marginTop: 20 }}>Total Revenue: ₹{totalRevenue}</h3>
        </>
      )}
    </div>
  );
}
