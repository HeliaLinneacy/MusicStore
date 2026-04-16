import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: string;
  type: 'song' | 'album';
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (id: string, type: 'song' | 'album') => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }

      try {
        const response = await fetch(`/api/wishlist?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setWishlist(data);
        }
      } catch {
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (id: string, type: 'song' | 'album') => {
    if (!user) {
      setWishlist(prev => {
        const exists = prev.some(item => item.id === id && item.type === type);
        if (!exists) {
          return [...prev, { id, type }];
        }
        return prev;
      });
      return;
    }

    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, itemId: id, type })
    });
    if (response.ok) {
      const data = await response.json();
      setWishlist(data);
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (!user) {
      setWishlist(prev => prev.filter(item => item.id !== id));
      return;
    }

    const response = await fetch(`/api/wishlist/${id}?userId=${user.id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      const data = await response.json();
      setWishlist(data);
    }
  };

  const isInWishlist = (id: string): boolean => {
    return wishlist.some(item => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
