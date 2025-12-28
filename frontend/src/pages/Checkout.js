import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: ''
  });

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/products');
    }
  }, [cart.items, navigate]);

  const subtotal = cartTotal;
  const tax = subtotal * 0.1;
  const shipping = shippingMethod === 'pickup' ? 0 : (shippingMethod === 'standard' ? 10 : 25);
  const total = subtotal + tax + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: cart.items,
        shipping_info: formData,
        shipping_method: shippingMethod
      };

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const orderResponse = await axios.post(`${API}/orders`, orderData, config);
      const order = orderResponse.data;

      // Create checkout session
      const checkoutResponse = await axios.post(
        `${API}/payments/create-checkout?order_id=${order.id}`,
        {},
        config
      );

      // Redirect to Stripe
      window.location.href = checkoutResponse.data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12" data-testid="checkout-page">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12" data-testid="checkout-title">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8" data-testid="checkout-form">
              {/* Shipping Info */}
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-6" data-testid="shipping-info-title">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="first-name-label">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full input-underline"
                      required
                      data-testid="first-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="last-name-label">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full input-underline"
                      required
                      data-testid="last-name-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" data-testid="email-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full input-underline"
                      required
                      data-testid="email-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" data-testid="street-label">Street Address</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full input-underline"
                      required
                      data-testid="street-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="city-label">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full input-underline"
                      required
                      data-testid="city-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="state-label">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full input-underline"
                      required
                      data-testid="state-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="postal-code-label">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full input-underline"
                      required
                      data-testid="postal-code-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="phone-label">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full input-underline"
                      data-testid="phone-input"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-6" data-testid="shipping-method-title">Shipping Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border-2 border-border cursor-pointer hover:border-foreground transition-colors">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      data-testid="standard-shipping-radio"
                    />
                    <div className="flex-1">
                      <p className="font-medium" data-testid="standard-shipping-label">Standard Shipping</p>
                      <p className="text-sm text-muted-foreground" data-testid="standard-shipping-time">5-7 business days</p>
                    </div>
                    <p className="font-semibold" data-testid="standard-shipping-price">$10.00</p>
                  </label>
                  <label className="flex items-center gap-4 p-4 border-2 border-border cursor-pointer hover:border-foreground transition-colors">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      data-testid="express-shipping-radio"
                    />
                    <div className="flex-1">
                      <p className="font-medium" data-testid="express-shipping-label">Express Shipping</p>
                      <p className="text-sm text-muted-foreground" data-testid="express-shipping-time">2-3 business days</p>
                    </div>
                    <p className="font-semibold" data-testid="express-shipping-price">$25.00</p>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
                data-testid="proceed-payment-button"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border-2 border-border p-8" data-testid="order-summary">
              <h2 className="text-2xl font-semibold tracking-tight mb-6" data-testid="order-summary-title">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm" data-testid={`summary-item-${index}`}>
                    <span data-testid={`summary-item-name-${index}`}>Product x {item.quantity}</span>
                    <span data-testid={`summary-item-total-${index}`}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span data-testid="subtotal-label">Subtotal</span>
                  <span data-testid="subtotal-amount">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span data-testid="tax-label">Tax (10%)</span>
                  <span data-testid="tax-amount">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span data-testid="shipping-cost-label">Shipping</span>
                  <span data-testid="shipping-cost-amount">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t border-border">
                  <span data-testid="total-label">Total</span>
                  <span data-testid="total-amount">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
