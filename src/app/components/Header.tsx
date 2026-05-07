import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { cart, getCartTotal } = useCart();
  const { wishlist } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Music className="w-8 h-8 text-blue-600" />
            <span className="font-semibold text-xl">MusicStore</span>
          </Link>

          <Link to="/search" className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/wishlist" className="relative">
              <Heart className="w-6 h-6 text-gray-700 hover:text-blue-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-blue-600" />
              {getCartTotal() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartTotal()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-2 w-48 z-50">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      Hồ sơ
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                      Đơn hàng
                    </Link>
                    {user.role === 'staff' && (
                      <>
                        <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">
                          Quản lý đánh giá
                        </Link>
                        <Link to="/manage-music" className="block px-4 py-2 hover:bg-gray-100">
                          Quản lý nhạc
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-blue-600 hover:text-blue-700">
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
