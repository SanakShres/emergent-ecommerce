import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Package, User as UserIcon, Heart } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Account() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [ordersRes, wishlistRes] = await Promise.all([
        axios.get(`${API}/orders`, config),
        axios.get(`${API}/wishlist`, config)
      ]);
      setOrders(ordersRes.data);
      setWishlist(wishlistRes.data.product_ids || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-12" data-testid="account-page">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12" data-testid="account-title">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1" data-testid="account-sidebar">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 text-sm uppercase tracking-wider transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}
                data-testid="orders-tab-button"
              >
                <Package className="inline w-4 h-4 mr-2" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full text-left px-4 py-3 text-sm uppercase tracking-wider transition-colors ${activeTab === 'wishlist' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}
                data-testid="wishlist-tab-button"
              >
                <Heart className="inline w-4 h-4 mr-2" />
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 text-sm uppercase tracking-wider transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}
                data-testid="profile-tab-button"
              >
                <UserIcon className="inline w-4 h-4 mr-2" />
                Profile
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 text-sm uppercase tracking-wider hover:bg-destructive hover:text-white transition-colors"
                data-testid="logout-button"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div data-testid="orders-section">
                <h2 className="text-2xl font-semibold tracking-tight mb-6" data-testid="orders-heading">My Orders</h2>
                {loading ? (
                  <div data-testid="loading">Loading...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 bg-secondary" data-testid="no-orders">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border-2 border-border p-6" data-testid={`order-${order.id}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground" data-testid={`order-number-${order.id}`}>Order #{order.order_number}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`order-date-${order.id}`}>{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold" data-testid={`order-total-${order.id}`}>${order.total.toFixed(2)}</p>
                            <p className={`text-sm ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`} data-testid={`order-payment-status-${order.id}`}>
                              {order.payment_status}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm" data-testid={`order-item-${order.id}-${idx}`}>
                              <span data-testid={`order-item-name-${order.id}-${idx}`}>{item.product_name} x {item.quantity}</span>
                              <span data-testid={`order-item-price-${order.id}-${idx}`}>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <span className="inline-block px-3 py-1 bg-secondary text-xs uppercase tracking-wider" data-testid={`order-status-${order.id}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div data-testid="wishlist-section">
                <h2 className="text-2xl font-semibold tracking-tight mb-6" data-testid="wishlist-heading">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12 bg-secondary" data-testid="empty-wishlist">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No items in wishlist</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-testid="wishlist-items">
                    {wishlist.map((productId) => (
                      <div key={productId} className="border-2 border-border p-4" data-testid={`wishlist-item-${productId}`}>
                        <p className="text-sm" data-testid={`wishlist-product-id-${productId}`}>Product ID: {productId}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div data-testid="profile-section">
                <h2 className="text-2xl font-semibold tracking-tight mb-6" data-testid="profile-heading">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="profile-name-label">Name</label>
                    <p className="text-lg" data-testid="profile-name-value">{user.first_name} {user.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="profile-email-label">Email</label>
                    <p className="text-lg" data-testid="profile-email-value">{user.email}</p>
                  </div>
                  {user.is_admin && (
                    <div className="mt-6 p-4 bg-primary text-white" data-testid="admin-badge">
                      <p className="font-semibold">Admin Account</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
