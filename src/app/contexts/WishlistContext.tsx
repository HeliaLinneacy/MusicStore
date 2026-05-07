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
        return;
      }

      try {
        const response = await fetch(`/api/wishlist?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setWishlist(data);
        }
      } catch (error) {
        console.warn('API unavailable, using local state for wishlist');
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (id: string, type: 'song' | 'album') => {
    const updateLocalWishlist = () => {
      setWishlist(prev => {
        const exists = prev.some(item => item.id === id && item.type === type);
        if (!exists) {
          return [...prev, { id, type }];
        }
        return prev;
      });
    };

    if (!user) {
      updateLocalWishlist();
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, itemId: id, type })
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
        return;
      }
    } catch (error) {
      console.warn('API unavailable, adding to wishlist locally');
    }
    updateLocalWishlist();
  };

  const removeFromWishlist = async (id: string) => {
    const updateLocalRemove = () => {
      setWishlist(prev => prev.filter(item => item.id !== id));
    };

    if (!user) {
      updateLocalRemove();
      return;
    }

    try {
      const response = await fetch(`/api/wishlist/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
        return;
      }
    } catch (error) {
      console.warn('API unavailable, removing from wishlist locally');
    }
    updateLocalRemove();
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
