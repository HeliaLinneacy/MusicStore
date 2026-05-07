import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext';
import SongCard from '../components/SongCard';
import AlbumCard from '../components/AlbumCard';
import { Search, Filter } from 'lucide-react';

export default function SearchPage() {
  const { songs, albums } = useMusic();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [selectedType, setSelectedType] = useState<'all' | 'song' | 'album'>(
    (searchParams.get('type') as 'all' | 'song' | 'album') || 'all'
  );

  const genres = Array.from(new Set([...songs.map(s => s.genre), ...albums.map(a => a.genre)]));

  const filteredSongs = songs.filter(song => {
    const matchesQuery = !searchQuery ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = !selectedGenre || song.genre === selectedGenre;

    return matchesQuery && matchesGenre;
  });

  const filteredAlbums = albums.filter(album => {
    const matchesQuery = !searchQuery ||
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = !selectedGenre || album.genre === selectedGenre;

    return matchesQuery && matchesGenre;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedGenre) params.genre = selectedGenre;
    if (selectedType !== 'all') params.type = selectedType;
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-6">Tìm kiếm</h1>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tiêu đề, nghệ sĩ, từ khóa..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Bộ lọc:</span>
          </div>

          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả thể loại</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <div className="flex gap-2 border rounded-lg p-1">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-1 rounded ${selectedType === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedType('song')}
              className={`px-4 py-1 rounded ${selectedType === 'song' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              Bài hát
            </button>
            <button
              onClick={() => setSelectedType('album')}
              className={`px-4 py-1 rounded ${selectedType === 'album' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              Album
            </button>
          </div>
        </div>
      </div>

      {(selectedType === 'all' || selectedType === 'song') && filteredSongs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl mb-4">
            Bài hát ({filteredSongs.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredSongs.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {(selectedType === 'all' || selectedType === 'album') && filteredAlbums.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl mb-4">
            Album ({filteredAlbums.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAlbums.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {filteredSongs.length === 0 && filteredAlbums.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy kết quả nào</p>
        </div>
      )}
    </div>
  );
}
