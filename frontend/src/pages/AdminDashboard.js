import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API}/admin/analytics`, config);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-h-screen py-12" data-testid="admin-dashboard">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12" data-testid="admin-dashboard-title">Admin Dashboard</h1>

        {loading ? (
          <div data-testid="loading">Loading...</div>
        ) : analytics ? (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12" data-testid="stats-grid">
              <div className="border-2 border-border p-6" data-testid="total-revenue-card">
                <DollarSign className="w-8 h-8 mb-4 text-primary" />
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold" data-testid="total-revenue">${analytics.total_revenue.toFixed(2)}</p>
              </div>
              <div className="border-2 border-border p-6" data-testid="total-orders-card">
                <Package className="w-8 h-8 mb-4 text-primary" />
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-3xl font-bold" data-testid="total-orders">{analytics.total_orders}</p>
              </div>
              <div className="border-2 border-border p-6" data-testid="total-products-card">
                <ShoppingBag className="w-8 h-8 mb-4 text-primary" />
                <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                <p className="text-3xl font-bold" data-testid="total-products">{analytics.total_products}</p>
              </div>
              <div className="border-2 border-border p-6" data-testid="total-users-card">
                <Users className="w-8 h-8 mb-4 text-primary" />
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold" data-testid="total-users">{analytics.total_users}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div data-testid="recent-orders-section">
              <h2 className="text-2xl font-semibold tracking-tight mb-6" data-testid="recent-orders-title">Recent Orders</h2>
              <div className="border-2 border-border overflow-x-auto">
                <table className="w-full" data-testid="recent-orders-table">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-4 text-sm uppercase tracking-wider" data-testid="order-number-header">Order #</th>
                      <th className="text-left p-4 text-sm uppercase tracking-wider" data-testid="date-header">Date</th>
                      <th className="text-left p-4 text-sm uppercase tracking-wider" data-testid="total-header">Total</th>
                      <th className="text-left p-4 text-sm uppercase tracking-wider" data-testid="status-header">Status</th>
                      <th className="text-left p-4 text-sm uppercase tracking-wider" data-testid="payment-header">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recent_orders.map((order) => (
                      <tr key={order.id} className="border-t border-border" data-testid={`order-row-${order.id}`}>
                        <td className="p-4" data-testid={`order-number-${order.id}`}>{order.order_number}</td>
                        <td className="p-4" data-testid={`order-date-${order.id}`}>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-4 font-semibold" data-testid={`order-total-${order.id}`}>${order.total.toFixed(2)}</td>
                        <td className="p-4" data-testid={`order-status-${order.id}`}>
                          <span className="px-2 py-1 bg-secondary text-xs uppercase tracking-wider">
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4" data-testid={`order-payment-${order.id}`}>
                          <span className={`px-2 py-1 text-xs uppercase tracking-wider ${
                            order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div data-testid="no-data">No data available</div>
        )}
      </div>
    </div>
  );
}
