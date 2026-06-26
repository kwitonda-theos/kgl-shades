"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

interface KPIs {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface TopProduct {
  _id: string;
  totalQuantity: number;
  productName: string;
  productImage?: string;
}

interface RevenueDay {
  _id: string; // date string
  revenue: number;
  orders: number;
}

interface RecentOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    quantity: number;
    product?: { name: string };
  }>;
}

interface AnalyticsData {
  kpis: KPIs;
  ordersByStatus: Record<string, number>;
  topProducts: TopProduct[];
  revenueOverTime: RevenueDay[];
  recentOrders: RecentOrder[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const revenueCanvasRef = useRef<HTMLCanvasElement>(null);
  const statusCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("kgl-token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to load analytics");
        }

        const result = await res.json();
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Draw revenue chart
  const drawRevenueChart = useCallback(() => {
    if (!data || !revenueCanvasRef.current) return;

    const canvas = revenueCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    const days = data.revenueOverTime;
    if (days.length === 0) {
      ctx.fillStyle = "#666";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No revenue data yet", w / 2, h / 2);
      return;
    }

    const maxRevenue = Math.max(...days.map((d) => d.revenue), 1);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = maxRevenue - (maxRevenue / 4) * i;
      ctx.fillStyle = "#666";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`$${Math.round(val)}`, padding.left - 10, y + 4);
    }

    // Draw area + line
    const points = days.map((d, i) => ({
      x: padding.left + (chartW / (days.length - 1 || 1)) * i,
      y: padding.top + chartH - (d.revenue / maxRevenue) * chartH,
    }));

    // Area gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, "rgba(0, 120, 212, 0.3)");
    gradient.addColorStop(1, "rgba(0, 120, 212, 0.02)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padding.bottom);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = "#0078D4";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#0078D4";
      ctx.fill();
    });

    // X-axis labels (show first, middle, last)
    ctx.fillStyle = "#666";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    const labelIndices = [0, Math.floor(days.length / 2), days.length - 1];
    labelIndices.forEach((i) => {
      if (days[i]) {
        const date = new Date(days[i]._id);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, points[i].x, h - padding.bottom + 20);
      }
    });
  }, [data]);

  // Draw status donut chart
  const drawStatusChart = useCallback(() => {
    if (!data || !statusCanvasRef.current) return;

    const canvas = statusCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) / 2 - 30;
    const innerRadius = radius * 0.6;

    const statusColors: Record<string, string> = {
      PENDING: "#f59e0b",
      PAID: "#10b981",
      SHIPPED: "#0078D4",
      CANCELLED: "#ef4444",
    };

    const statuses = Object.entries(data.ordersByStatus);
    const total = statuses.reduce((sum, [, count]) => sum + count, 0);

    if (total === 0) {
      ctx.fillStyle = "#666";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No orders yet", centerX, centerY);
      return;
    }

    let startAngle = -Math.PI / 2;
    statuses.forEach(([status, count]) => {
      const sliceAngle = (count / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = statusColors[status] || "#666";
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = "#f5f5f5";
    ctx.font = "bold 24px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = "#999";
    ctx.fillText("orders", centerX, centerY + 14);
  }, [data]);

  useEffect(() => {
    if (data) {
      drawRevenueChart();
      drawStatusChart();

      const handleResize = () => {
        drawRevenueChart();
        drawStatusChart();
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [data, drawRevenueChart, drawStatusChart]);

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="admin-loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-error">
        <p>⚠ {error}</p>
      </div>
    );
  }

  if (!data) return null;

  const statusColors: Record<string, string> = {
    PENDING: "#f59e0b",
    PAID: "#10b981",
    SHIPPED: "#0078D4",
    CANCELLED: "#ef4444",
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Analytics Overview</h1>

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <div className="admin-kpi-data">
            <span className="admin-kpi-value">${data.kpis.totalRevenue.toLocaleString()}</span>
            <span className="admin-kpi-label">Total Revenue</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: "rgba(0, 120, 212, 0.1)", color: "#0078D4" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
          </div>
          <div className="admin-kpi-data">
            <span className="admin-kpi-value">{data.kpis.totalOrders}</span>
            <span className="admin-kpi-label">Total Orders</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div className="admin-kpi-data">
            <span className="admin-kpi-value">{data.kpis.totalUsers}</span>
            <span className="admin-kpi-label">Total Users</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
          </div>
          <div className="admin-kpi-data">
            <span className="admin-kpi-value">${data.kpis.avgOrderValue}</span>
            <span className="admin-kpi-label">Avg. Order Value</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="admin-charts-row">
        {/* Revenue Chart */}
        <div className="admin-chart-card admin-chart-card--wide">
          <h3 className="admin-card-title">Revenue — Last 30 Days</h3>
          <div className="admin-chart-wrapper">
            <canvas ref={revenueCanvasRef} className="admin-canvas" />
          </div>
        </div>

        {/* Status Donut */}
        <div className="admin-chart-card">
          <h3 className="admin-card-title">Orders by Status</h3>
          <div className="admin-chart-wrapper admin-chart-wrapper--donut">
            <canvas ref={statusCanvasRef} className="admin-canvas" />
          </div>
          <div className="admin-status-legend">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="admin-legend-item">
                <span className="admin-legend-dot" style={{ background: statusColors[status] || "#666" }} />
                <span className="admin-legend-label">{status}</span>
                <span className="admin-legend-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="admin-charts-row">
        {/* Top Products */}
        <div className="admin-chart-card">
          <h3 className="admin-card-title">Top Selling Products</h3>
          {data.topProducts.length === 0 ? (
            <p className="admin-empty-text">No sales data yet</p>
          ) : (
            <div className="admin-top-products">
              {data.topProducts.map((product, idx) => {
                const maxQty = data.topProducts[0]?.totalQuantity || 1;
                const barWidth = (product.totalQuantity / maxQty) * 100;
                return (
                  <div key={product._id} className="admin-top-product-row">
                    <span className="admin-top-product-rank">#{idx + 1}</span>
                    <div className="admin-top-product-info">
                      <span className="admin-top-product-name">{product.productName}</span>
                      <div className="admin-top-product-bar-bg">
                        <div
                          className="admin-top-product-bar"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    <span className="admin-top-product-qty">{product.totalQuantity} sold</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="admin-chart-card admin-chart-card--wide">
          <h3 className="admin-card-title">Recent Orders</h3>
          {data.recentOrders.length === 0 ? (
            <p className="admin-empty-text">No orders yet</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        {order.user
                          ? `${order.user.firstName} ${order.user.lastName}`
                          : "Deleted User"}
                      </td>
                      <td>{order.items.length}</td>
                      <td>${order.totalAmount}</td>
                      <td>
                        <span className={`admin-status-badge admin-status-badge--${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
