import { useParams, Link } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext';
import { ShoppingCart, Heart, Play, Star, Music2, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';
import AudioPlayer from '../components/AudioPlayer';

export default function AlbumDetailPage() {
  const { id } = useParams();
  const { getAlbumById, songs, reviews } = useMusic();
  const album = getAlbumById(id || '');
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [showFullReview, setShowFullReview] = useState<string | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  if (!album) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Không tìm thấy album</div>;
  }

  const albumSongs = songs.filter(s => album?.songIds.includes(s.id));
  const inWishlist = isInWishlist(album.id);
  const approvedAlbumReviews = reviews.filter(r => r.itemId === album.id && r.approved);
  const editorialReviews = approvedAlbumReviews.filter(r => r.isEditorial);
  const customerReviews = approvedAlbumReviews.filter(r => !r.isEditorial);

  const displayRating = approvedAlbumReviews.length
    ? approvedAlbumReviews.reduce((sum, r) => sum + r.rating, 0) / approvedAlbumReviews.length
    : album.rating;
  const displayReviewCount = approvedAlbumReviews.length || album.reviewCount;

  const handleAddToCart = () => {
    addToCart(album.id, 'album');
    toast.success(`Đã thêm album "${album.title}" vào giỏ hàng`);
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(album.id);
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } else {
      addToWishlist(album.id, 'album');
      toast.success('Đã thêm vào danh sách yêu thích');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div>
          <div className="mb-2">
            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              Album • {album.genre}
            </span>
          </div>
          <h1 className="text-4xl mb-2">{album.title}</h1>
          <Link to={`/search?artist=${album.artist}`} className="text-xl text-gray-600 hover:text-blue-600 mb-4 inline-block">
            {album.artist}
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg">{displayRating.toFixed(1)}</span>
              <span className="text-gray-500">({displayReviewCount} đánh giá)</span>
            </div>
            <div className="text-gray-600">
              <span>{albumSongs.length} bài hát</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">Ngày phát hành:</p>
            <p>{new Date(album.releaseDate).toLocaleDateString('vi-VN')}</p>
          </div>

          <div className="mb-6">
            <p className="text-3xl text-blue-600 mb-4">${album.price}</p>
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`px-6 py-3 rounded-lg border transition-colors ${
                  inWishlist
                    ? 'bg-red-50 border-red-500 text-red-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <Play className="w-5 h-5" fill="currentColor" />
            Phát album
          </button>
        </div>
      </div>

      {albumSongs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl mb-4">Danh sách bài hát</h2>
          <div className="bg-white border rounded-lg overflow-hidden">
            {albumSongs.map((song, index) => (
              <div key={song.id} className="border-b last:border-b-0">
                <Link
                  to={`/song/${song.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50"
                >
                  <span className="text-gray-500 w-8 text-center">{index + 1}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPlayingSongId(playingSongId === song.id ? null : song.id);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Play className="w-5 h-5" fill="currentColor" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-gray-600">{song.artist}</p>
                  </div>
                  <span className="text-gray-500">{song.duration}</span>
                  <span className="text-blue-600 font-semibold">${song.price}</span>
                </Link>
                {playingSongId === song.id && (
                  <div className="px-4 pb-4">
                    <AudioPlayer src={song.audioUrl} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {editorialReviews.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl mb-4">Nhận định biên tập</h2>
          {editorialReviews.map(review => (
            <div key={review.id} className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{review.rating}/5</span>
                <span className="text-gray-500">- {review.title}</span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="text-sm text-gray-500 mt-2">
                Bởi {review.userName} • {review.date}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="mb-12">
        <h2 className="text-2xl mb-4">Đánh giá của khách hàng</h2>
        {customerReviews.length === 0 ? (
          <p className="text-gray-500">Chưa có đánh giá nào.</p>
        ) : (
          <div className="space-y-4">
            {customerReviews.map(review => {
              const isLong = review.comment.length > 200;
              const shouldTruncate = isLong && showFullReview !== review.id;

              return (
                <div key={review.id} className="border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{review.title}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {review.userName} • {review.date}
                  </p>
                  <p className="text-gray-700">
                    {shouldTruncate ? `${review.comment.slice(0, 200)}...` : review.comment}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => setShowFullReview(showFullReview === review.id ? null : review.id)}
                      className="text-blue-600 hover:underline mt-2 flex items-center gap-1"
                    >
                      {showFullReview === review.id ? 'Thu gọn' : 'Xem thêm'}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showFullReview === review.id ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
