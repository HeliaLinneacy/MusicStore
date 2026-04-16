import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Play } from 'lucide-react';
import { Album } from '../data/mockData';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useMusic } from '../contexts/MusicContext';
import { toast } from 'sonner';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { reviews } = useMusic();
  const inWishlist = isInWishlist(album.id);

  const approvedAlbumReviews = reviews.filter(r => r.itemId === album.id && r.approved);
  const displayRating = approvedAlbumReviews.length
    ? approvedAlbumReviews.reduce((sum, r) => sum + r.rating, 0) / approvedAlbumReviews.length
    : album.rating;
  const displayReviewCount = approvedAlbumReviews.length || album.reviewCount;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(album.id, 'album');
    toast.success(`Đã thêm album "${album.title}" vào giỏ hàng`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(album.id);
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } else {
      addToWishlist(album.id, 'album');
      toast.success('Đã thêm vào danh sách yêu thích');
    }
  };

  return (
    <Link to={`/album/${album.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="bg-white rounded-full p-3 hover:bg-blue-600 hover:text-white transition-colors">
              <Play className="w-6 h-6" fill="currentColor" />
            </button>
          </div>
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Album
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium truncate">{album.title}</h3>
          <p className="text-sm text-gray-600 truncate">{album.artist}</p>

          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{displayRating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({displayReviewCount})</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="font-semibold text-blue-600">${album.price}</span>
            <div className="flex gap-2">
              <button
                onClick={handleToggleWishlist}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
              <button
                onClick={handleAddToCart}
                className="p-2 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
