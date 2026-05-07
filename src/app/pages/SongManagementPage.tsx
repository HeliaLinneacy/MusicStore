import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { Link } from 'react-router-dom';
import { Song, Album } from '../data/mockData';
import { Music, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import AudioPlayer from '../components/AudioPlayer';

interface FormData {
  title: string;
  artist: string;
  genre: string;
  price: number;
  coverUrl: string;
  album: string;
  duration: string;
  audioUrl: string;
  releaseDate: string;
  songIds: string[];
}

export default function SongManagementPage() {
  const { user } = useAuth();
  const { songs, albums, addSong, updateSong, deleteSong, addAlbum, updateAlbum, deleteAlbum, resetToDefaults } = useMusic();
  const [activeTab, setActiveTab] = useState<'songs' | 'albums'>('songs');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    artist: '',
    genre: '',
    price: 0,
    coverUrl: '',
    album: '',
    duration: '',
    audioUrl: '',
    releaseDate: '',
    songIds: []
  });

  // Auto-calculate album price when songs are selected
  useEffect(() => {
    if (activeTab === 'albums' && formData.songIds.length > 0) {
      const albumPrice = formData.songIds.reduce((total, songId) => {
        const song = songs.find(s => s.id === songId);
        return total + (song?.price || 0);
      }, 0);
      setFormData(prev => ({ ...prev, price: albumPrice }));
    } else if (activeTab === 'albums' && formData.songIds.length === 0) {
      setFormData(prev => ({ ...prev, price: 0 }));
    }
  }, [formData.songIds, songs, activeTab]);

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

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      artist: '',
      genre: '',
      price: 0,
      coverUrl: '',
      album: '',
      duration: '',
      audioUrl: '',
      releaseDate: '',
      songIds: []
    });
    setShowForm(true);
  };

  const handleEdit = (item: Song | Album) => {
    setEditingId(item.id);
    if ('album' in item) {
      // It's a song
      setFormData({
        title: item.title,
        artist: item.artist,
        genre: item.genre,
        price: item.price,
        coverUrl: item.coverUrl,
        album: item.album,
        duration: item.duration,
        audioUrl: item.audioUrl,
        releaseDate: '',
        songIds: []
      });
    } else {
      // It's an album
      setFormData({
        title: item.title,
        artist: item.artist,
        genre: item.genre,
        price: item.price,
        coverUrl: item.coverUrl,
        album: '',
        duration: '',
        audioUrl: '',
        releaseDate: item.releaseDate,
        songIds: item.songIds
      });
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.artist) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (activeTab === 'songs') {
      if (!formData.genre || !formData.price) {
        toast.error('Vui lòng điền đầy đủ thông tin bài hát (Thể loại, Giá)');
        return;
      }
      if (!formData.album || !formData.audioUrl) {
        toast.error('Vui lòng điền đầy đủ thông tin bài hát (Album, Link YouTube)');
        return;
      }

      if (editingId) {
        updateSong(editingId, {
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre,
          price: formData.price,
          coverUrl: formData.coverUrl,
          audioUrl: formData.audioUrl,
          album: formData.album,
          duration: formData.duration,
        });
        toast.success('Cập nhật bài hát thành công');
      } else {
        const newSong: Song = {
          id: `s${Date.now()}`,
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre,
          price: formData.price,
          coverUrl: formData.coverUrl,
          audioUrl: formData.audioUrl,
          album: formData.album,
          duration: formData.duration,
          keywords: [formData.title, formData.artist, formData.album],
          rating: 0,
          reviewCount: 0,
        };
        addSong(newSong);
        toast.success('Thêm bài hát thành công');
      }
    } else {
      if (!formData.releaseDate) {
        toast.error('Vui lòng nhập ngày phát hành cho album');
        return;
      }

      if (!formData.songIds.length) {
        toast.error('Vui lòng chọn ít nhất một bài hát cho album');
        return;
      }

      // Calculate album price as sum of selected songs
      const albumPrice = formData.songIds.reduce((total, songId) => {
        const song = songs.find(s => s.id === songId);
        return total + (song?.price || 0);
      }, 0);

      if (editingId) {
        updateAlbum(editingId, {
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre,
          price: albumPrice,
          coverUrl: formData.coverUrl,
          releaseDate: formData.releaseDate,
          songIds: formData.songIds,
        });
        toast.success('Cập nhật album thành công');
      } else {
        const newAlbum: Album = {
          id: `a${Date.now()}`,
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre,
          price: albumPrice,
          coverUrl: formData.coverUrl,
          releaseDate: formData.releaseDate,
          songIds: formData.songIds,
          rating: 0,
          reviewCount: 0,
        };
        addAlbum(newAlbum);
        toast.success('Thêm album thành công');
      }
    }

    setFormData({
      title: '',
      artist: '',
      genre: '',
      price: 0,
      coverUrl: '',
      album: '',
      duration: '',
      audioUrl: '',
      releaseDate: '',
      songIds: []
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      if (activeTab === 'songs') {
        deleteSong(id);
      } else {
        deleteAlbum(id);
      }
      toast.success('Đã xóa thành công');
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn phục hồi dữ liệu mặc định? Tất cả dữ liệu hiện tại sẽ bị thay thế.')) {
      resetToDefaults();
      toast.success('Đã phục hồi dữ liệu mặc định');
    }
  };

  const renderTable = () => {
    if (activeTab === 'songs') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Ảnh bìa</th>
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-left">Nghệ sĩ</th>
                <th className="px-4 py-3 text-left">Album</th>
                <th className="px-4 py-3 text-left">Thể loại</th>
                <th className="px-4 py-3 text-left">Giá</th>
                <th className="px-4 py-3 text-left">Thời lượng</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{song.title}</td>
                  <td className="px-4 py-3">{song.artist}</td>
                  <td className="px-4 py-3">{song.album}</td>
                  <td className="px-4 py-3">{song.genre}</td>
                  <td className="px-4 py-3">${song.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{song.duration}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(song)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(song.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Ảnh bìa</th>
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-left">Nghệ sĩ</th>
                <th className="px-4 py-3 text-left">Thể loại</th>
                <th className="px-4 py-3 text-left">Giá</th>
                <th className="px-4 py-3 text-left">Ngày phát hành</th>
                <th className="px-4 py-3 text-left">Số bài hát</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {albums.map((album) => (
                <tr key={album.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{album.title}</td>
                  <td className="px-4 py-3">{album.artist}</td>
                  <td className="px-4 py-3">{album.genre}</td>
                  <td className="px-4 py-3">${album.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{album.releaseDate}</td>
                  <td className="px-4 py-3">{album.songIds.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(album)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(album.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Music className="w-8 h-8" />
          Quản lý Bài hát & Album
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Thêm mới
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Phục hồi dữ liệu
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === 'songs'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bài hát ({songs.length})
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === 'albums'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Album ({albums.length})
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {editingId
                  ? activeTab === 'songs'
                    ? 'Sửa bài hát'
                    : 'Sửa album'
                  : activeTab === 'songs'
                  ? 'Thêm bài hát'
                  : 'Thêm album'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Hướng dẫn:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Dán link YouTube để lấy âm thanh: <code>https://youtube.com/watch?v=VIDEO_ID</code></li>
                <li>• Hoặc link ngắn: <code>https://youtu.be/VIDEO_ID</code></li>
                <li>• Ảnh bìa: Dán URL hình ảnh bất kỳ</li>
                <li>• Player sẽ chỉ phát âm thanh với thanh thời gian</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nghệ sĩ *
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={e =>
                      setFormData({ ...formData, artist: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên nghệ sĩ"
                  />
                </div>

                {activeTab === 'songs' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Thể loại *
                    </label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={e =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Pop, Rock, Jazz"
                    />
                  </div>
                )}

                {activeTab === 'songs' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Giá *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e =>
                        setFormData({ ...formData, price: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL ảnh bìa
                </label>
                <input
                  type="url"
                  value={formData.coverUrl}
                  onChange={e =>
                    setFormData({ ...formData, coverUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.coverUrl && (
                  <img
                    src={formData.coverUrl}
                    alt="Cover preview"
                    className="mt-3 h-32 rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      toast.error('URL ảnh không hợp lệ');
                    }}
                  />
                )}
              </div>

              {/* Song-specific fields */}
              {activeTab === 'songs' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Album *
                    </label>
                    <input
                      type="text"
                      value={formData.album}
                      onChange={e =>
                        setFormData({ ...formData, album: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tên album"
                    />
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Link YouTube *
                    </label>
                    <input
                      type="url"
                      value={formData.audioUrl}
                      onChange={e =>
                        setFormData({ ...formData, audioUrl: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://youtube.com/watch?v=VIDEO_ID hoặc https://youtu.be/VIDEO_ID"
                    />
                    {formData.audioUrl && (
                      <div className="mt-3">
                        <AudioPlayer
                          src={formData.audioUrl}
                          title="Preview bài hát"
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Album-specific fields */}
              {activeTab === 'albums' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ngày phát hành *
                    </label>
                    <input
                      type="date"
                      value={formData.releaseDate}
                      onChange={e =>
                        setFormData({ ...formData, releaseDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Chọn bài hát cho album *
                    </label>
                    {songs.length === 0 ? (
                      <p className="text-sm text-gray-500">Hiện chưa có bài hát nào. Vui lòng thêm bài hát trước khi tạo album.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                        {songs.map((song) => (
                          <label key={song.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.songIds.includes(song.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev) => ({
                                  ...prev,
                                  songIds: checked
                                    ? [...prev.songIds, song.id]
                                    : prev.songIds.filter((id) => id !== song.id),
                                }));
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <div>
                              <div className="font-medium">{song.title}</div>
                              <div className="text-xs text-gray-500">{song.artist} • {song.duration}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {renderTable()}

      {((activeTab === 'songs' && songs.length === 0) ||
        (activeTab === 'albums' && albums.length === 0)) && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            Chưa có {activeTab === 'songs' ? 'bài hát' : 'album'} nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu bằng cách thêm {activeTab === 'songs' ? 'bài hát' : 'album'} đầu tiên
          </p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Thêm {activeTab === 'songs' ? 'bài hát' : 'album'} đầu tiên
          </button>
        </div>
      )}
    </div>
  );
}