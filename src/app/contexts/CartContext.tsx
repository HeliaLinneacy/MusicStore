import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem } from '../data/mockData';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (id: string, type: 'song' | 'album') => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        // Load guest cart from localStorage if needed, but state is fine for now
        return;
      }

      try {
        const response = await fetch(`/api/cart?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setCart(data);
        }
      } catch (error) {
        console.warn('API unavailable, using local state for cart');
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (id: string, type: 'song' | 'album') => {
    // Helper to update state locally
    const updateLocalCart = () => {
      setCart(prev => {
        const existing = prev.find(item => item.id === id && item.type === type);
        if (existing) {
          return prev.map(item =>
            item.id === id && item.type === type
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { id, type, quantity: 1 }];
      });
    };

    if (!user) {
      updateLocalCart();
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, itemId: id, type })
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return;
      }
    } catch (error) {
      console.warn('API unavailable, adding to cart locally');
    }
    updateLocalCart();
  };

  const removeFromCart = async (id: string) => {
    const updateLocalRemove = () => {
      setCart(prev => prev.filter(item => item.id !== id));
    };

    if (!user) {
      updateLocalRemove();
      return;
    }

    try {
      const response = await fetch(`/api/cart/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        return;
      }
    } catch (error) {
      console.warn('API unavailable, removing from cart locally');
    }
    updateLocalRemove();
  };

  const clearCart = async () => {
    const updateLocalClear = () => {
      setCart([]);
    };

    if (!user) {
      updateLocalClear();
      return;
    }

    try {
      const response = await fetch(`/api/cart/clear?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCart([]);
        return;
      }
    } catch (error) {
      console.warn('API unavailable, clearing cart locally');
    }
    updateLocalClear();
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
