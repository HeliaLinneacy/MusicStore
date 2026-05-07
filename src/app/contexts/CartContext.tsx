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
        setCart([]);
        return;
      }

      try {
        const response = await fetch(`/api/cart?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setCart(data);
        }
      } catch {
        setCart([]);
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (id: string, type: 'song' | 'album') => {
    if (!user) {
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
      return;
    }

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, itemId: id, type })
    });
    if (response.ok) {
      const data = await response.json();
      setCart(data);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }

    const response = await fetch(`/api/cart/${id}?userId=${user.id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      const data = await response.json();
      setCart(data);
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }

    const response = await fetch(`/api/cart/clear?userId=${user.id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      setCart([]);
    }
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
