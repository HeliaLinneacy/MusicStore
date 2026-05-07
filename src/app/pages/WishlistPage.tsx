import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useMusic } from '../contexts/MusicContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { songs, albums } = useMusic();

  const wishlistItems = wishlist.map(item => {
    if (item.type === 'song') {
      const song = songs.find(s => s.id === item.id);
      return song ? { ...item, data: song } : null;
    } else {
      const album = albums.find(a => a.id === item.id);
      return album ? { ...item, data: album } : null;
    }
  }).filter(Boolean);

  const handleAddToCart = (id: string, type: 'song' | 'album', title: string) => {
    addToCart(id, type);
    toast.success(`Đã thêm "${title}" vào giỏ hàng`);
  };

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
    toast.success('Đã xóa khỏi danh sách yêu thích');
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl mb-4">Danh sách yêu thích trống</h2>
          <p className="text-gray-500 mb-6">Hãy thêm bài hát hoặc album yêu thích của bạn</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Khám phá ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-8">Danh sách yêu thích ({wishlist.length})</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => {
          if (!item) return null;
          const data = item.data as any;

          return (
            <div key={item.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/${item.type}/${item.id}`}>
                <img
                  src={data.coverUrl}
                  alt={data.title}
                  className="w-full aspect-square object-cover"
                />
              </Link>

              <div className="p-4">
                <Link to={`/${item.type}/${item.id}`} className="hover:text-blue-600">
                  <h3 className="font-medium truncate">{data.title}</h3>
                </Link>
                <p className="text-sm text-gray-600 truncate">{data.artist}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className="font-semibold text-blue-600">
                    ${item.type === 'song' ? data.price : data.price}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.id, item.type, data.title)}
                      className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                      title="Xóa khỏi danh sách"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
