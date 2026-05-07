import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext';

import { CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user } = useAuth();
  const { reviews, addReview, updateReview, deleteReview, songs, albums, updateSong } = useMusic();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'editorial'>('pending');
  const [editorialReview, setEditorialReview] = useState({
    itemId: '',
    itemType: 'song' as 'song' | 'album',
    rating: 5,
    title: '',
    comment: ''
  });

  if (!user || user.role !== 'staff') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl mb-4">Không có quyền truy cập</h2>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const pendingReviews = reviews.filter(r => !r.approved && !r.isEditorial);
  const approvedReviews = reviews.filter(r => r.approved && !r.isEditorial);
  const editorialReviews = reviews.filter(r => r.isEditorial);

  const handleApprove = (reviewId: string) => {
    updateReview(reviewId, { approved: true });
    toast.success('Đã duyệt đánh giá');
  };

  const handleReject = (reviewId: string) => {
    deleteReview(reviewId);
    toast.success('Đã từ chối đánh giá');
  };

  const handleSubmitEditorial = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editorialReview.itemId || !editorialReview.title || !editorialReview.comment) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newReview = {
      id: `r${Date.now()}`,
      userId: user.id,
      userName: user.name,
      itemId: editorialReview.itemId,
      itemType: editorialReview.itemType,
      rating: editorialReview.rating,
      title: editorialReview.title,
      comment: editorialReview.comment,
      date: new Date().toISOString().split('T')[0],
      approved: true,
      isEditorial: true
    };

    addReview(newReview);
    setEditorialReview({
      itemId: '',
      itemType: 'song',
      rating: 5,
      title: '',
      comment: ''
    });
    toast.success('Đã đăng nhận định biên tập');
  };

  const updateSongRating = (songId: string, rating: number) => {
    updateSong(songId, { rating });
    toast.success('Đã cập nhật số sao bài hát');
  };

  const renderReviewList = (reviewsList: typeof reviews) => {
    if (reviewsList.length === 0) {
      return <p className="text-gray-500 text-center py-8">Không có đánh giá nào</p>;
    }

    return (
      <div className="space-y-4">
        {reviewsList.map(review => {
          const item = review.itemType === 'song'
            ? songs.find(s => s.id === review.itemId)
            : albums.find(a => a.id === review.itemId);

          return (
            <div key={review.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
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
                    {review.isEditorial && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                        Biên tập
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {review.userName} • {review.date}
                  </p>
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  {item && (
                    <>
                      <Link
                        to={`/${review.itemType}/${review.itemId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {item.title} - {item.artist}
                      </Link>
                      {review.itemType === 'song' && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Chỉnh số sao bài hát
                          </p>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateSongRating(review.itemId, star)}
                                className={`w-8 h-8 rounded-full transition-colors ${
                                  star <= (item as any).rating
                                    ? 'bg-yellow-400 text-white'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {star}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!review.approved && !review.isEditorial && (
                <div className="flex gap-3 pt-3 border-t">
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReject(review.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/manage-music"
          className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quản lý nhạc</h3>
              <p className="text-sm text-gray-600">Thêm, sửa, xóa bài hát và album</p>
            </div>
          </div>
        </Link>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quản lý đánh giá</h3>
              <p className="text-sm text-gray-600">Duyệt và quản lý đánh giá</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Báo cáo</h3>
              <p className="text-sm text-gray-600">Thống kê và báo cáo</p>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-3xl mb-8">Quản lý đánh giá</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg overflow-hidden mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-6 py-3 font-medium ${
                  activeTab === 'pending'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Chờ duyệt ({pendingReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex-1 px-6 py-3 font-medium ${
                  activeTab === 'approved'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Đã duyệt ({approvedReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('editorial')}
                className={`flex-1 px-6 py-3 font-medium ${
                  activeTab === 'editorial'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Biên tập ({editorialReviews.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'pending' && renderReviewList(pendingReviews)}
              {activeTab === 'approved' && renderReviewList(approvedReviews)}
              {activeTab === 'editorial' && renderReviewList(editorialReviews)}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Viết nhận định biên tập
            </h2>

            <form onSubmit={handleSubmitEditorial} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Loại</label>
                <select
                  value={editorialReview.itemType}
                  onChange={e => setEditorialReview({ ...editorialReview, itemType: e.target.value as 'song' | 'album' })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="song">Bài hát</option>
                  <option value="album">Album</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Chọn {editorialReview.itemType === 'song' ? 'bài hát' : 'album'}</label>
                <select
                  value={editorialReview.itemId}
                  onChange={e => setEditorialReview({ ...editorialReview, itemId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn --</option>
                  {editorialReview.itemType === 'song'
                    ? songs.map(song => (
                        <option key={song.id} value={song.id}>
                          {song.title} - {song.artist}
                        </option>
                      ))
                    : albums.map(album => (
                        <option key={album.id} value={album.id}>
                          {album.title} - {album.artist}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Đánh giá</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditorialReview({ ...editorialReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= editorialReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={editorialReview.title}
                  onChange={e => setEditorialReview({ ...editorialReview, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tiêu đề nhận định"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Nội dung</label>
                <textarea
                  value={editorialReview.comment}
                  onChange={e => setEditorialReview({ ...editorialReview, comment: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Viết nhận định của bạn..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng nhận định
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
