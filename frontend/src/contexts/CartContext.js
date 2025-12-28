import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || `session-${Date.now()}`);

  useEffect(() => {
    localStorage.setItem('sessionId', sessionId);
    fetchCart();
  }, [token]);

  const fetchCart = async () => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { params: { session_id: sessionId } };
      const response = await axios.get(`${API}/cart`, config);
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (item) => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { params: { session_id: sessionId } };
      const response = await axios.post(`${API}/cart/items`, item, config);
      setCart(response.data);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { params: { session_id: sessionId } };
      await axios.put(`${API}/cart/items/${productId}?quantity=${quantity}`, {}, config);
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { params: { session_id: sessionId } };
      await axios.delete(`${API}/cart/items/${productId}`, config);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const clearCart = async () => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { params: { session_id: sessionId } };
      await axios.delete(`${API}/cart`, config);
      setCart({ items: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const cartTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      fetchCart,
      cartTotal,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);