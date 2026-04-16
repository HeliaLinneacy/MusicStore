import { useParams, Link } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext';
import { ShoppingCart, Heart, Play, Star, Clock, Music2, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';
import AudioPlayer from '../components/AudioPlayer';

export default function SongDetailPage() {
  const { id } = useParams();
  const { getSongById, addReview, reviews } = useMusic();
  const song = getSongById(id || '');
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [showFullReview, setShowFullReview] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [userReviewTitle, setUserReviewTitle] = useState('');

  if (!song) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Không tìm thấy bài hát</div>;
  }

  const inWishlist = isInWishlist(song.id);
  const approvedSongReviews = reviews.filter(r => r.itemId === song.id && r.approved);
  const editorialReviews = approvedSongReviews.filter(r => r.isEditorial);
  const customerReviews = approvedSongReviews.filter(r => !r.isEditorial);

  const displayRating = approvedSongReviews.length
    ? approvedSongReviews.reduce((sum, r) => sum + r.rating, 0) / approvedSongReviews.length
    : song.rating;
  const displayReviewCount = approvedSongReviews.length || song.reviewCount;

  const handleAddToCart = () => {
    addToCart(song.id, 'song');
    toast.success(`Đã thêm "${song.title}" vào giỏ hàng`);
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(song.id);
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } else {
      addToWishlist(song.id, 'song');
      toast.success('Đã thêm vào danh sách yêu thích');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (userRating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }

    const newReview = {
      id: `r${Date.now()}`,
      userId: String(user.id),
      userName: user.name,
      itemId: song.id,
      itemType: 'song' as const,
      rating: userRating,
      title: userReviewTitle,
      comment: userReview,
      date: new Date().toISOString().split('T')[0],
      approved: false,
      isEditorial: false,
    };

    addReview(newReview);
    toast.success('Đánh giá của bạn đã được gửi và đang chờ kiểm duyệt');
    setUserRating(0);
    setUserReview('');
    setUserReviewTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div>
          <div className="mb-2">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {song.genre}
            </span>
          </div>
          <h1 className="text-4xl mb-2">{song.title}</h1>
          <Link to={`/search?artist=${song.artist}`} className="text-xl text-gray-600 hover:text-blue-600 mb-4 inline-block">
            {song.artist}
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg">{displayRating.toFixed(1)}</span>
              <span className="text-gray-500">({displayReviewCount} đánh giá)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>{song.duration}</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">Album:</p>
            <Link to={`/search?album=${song.album}`} className="text-blue-600 hover:underline">
              {song.album}
            </Link>
          </div>

          <div className="mb-6">
            <p className="text-3xl text-blue-600 mb-4">${song.price}</p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                className="flex-1 min-w-[180px] bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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

            <div className="mt-4 max-w-2xl">
              <AudioPlayer src={song.audioUrl} />
            </div>
          </div>
        </div>
      </div>

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

        {user && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3">Viết đánh giá của bạn</h3>
            <div className="mb-4">
              <label className="block text-sm mb-2">Đánh giá:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= userRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Tiêu đề:</label>
              <input
                type="text"
                value={userReviewTitle}
                onChange={e => setUserReviewTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tóm tắt đánh giá của bạn"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Nội dung:</label>
              <textarea
                value={userReview}
                onChange={e => setUserReview(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Chia sẻ suy nghĩ của bạn về bài hát này..."
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gửi đánh giá
            </button>
            <p className="text-sm text-gray-500 mt-2">
              * Đánh giá của bạn sẽ được kiểm duyệt trước khi xuất bản
            </p>
          </form>
        )}

        {customerReviews.length === 0 ? (
          <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
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
