import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    try {
      // Poll payment status
      let attempts = 0;
      const maxAttempts = 5;
      const pollInterval = 2000;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API}/payments/status/${sessionId}`);
        
        if (response.data.payment_status === 'paid') {
          await clearCart();
          setOrder(response.data);
          setLoading(false);
        } else {
          attempts++;
          setTimeout(poll, pollInterval);
        }
      };

      poll();
    } catch (error) {
      console.error('Failed to check payment status:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" data-testid="order-success-page">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" data-testid="success-icon" />
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="success-title">
            Order Confirmed!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8" data-testid="success-message">
            Thank you for your purchase. Your order has been successfully placed and is being processed.
          </p>

          {order && (
            <div className="bg-secondary p-8 mb-8 text-left" data-testid="order-details">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5" />
                <h2 className="text-xl font-semibold" data-testid="order-details-title">Order Details</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono" data-testid="order-session-id">{sessionId.slice(0, 16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold" data-testid="order-amount">${(order.amount_total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-600 font-semibold" data-testid="order-status">Paid</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link to="/account" className="block w-full btn-primary" data-testid="view-orders-button">
              View My Orders
            </Link>
            <Link to="/products" className="block w-full text-sm uppercase tracking-wider hover:text-primary transition-colors" data-testid="continue-shopping-link">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
