import { useMusic } from '../contexts/MusicContext';
import SongCard from '../components/SongCard';
import AlbumCard from '../components/AlbumCard';

export default function HomePage() {
  const { songs, albums } = useMusic();
  const featuredSongs = [...songs]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
  const featuredAlbums = albums.slice(0, 4);

  const genreCounts = songs.reduce<Record<string, number>>((acc, song) => {
    acc[song.genre] = (acc[song.genre] || 0) + 1;
    return acc;
  }, {});

  const popularGenres = Object.entries(genreCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 8)
    .map(([genre]) => genre);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h1 className="text-5xl mb-4">Khám phá âm nhạc</h1>
          <p className="text-xl opacity-90 mb-6">
            Hàng triệu bài hát và album chất lượng cao
          </p>
          <a
            href="#featured-songs"
            className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Bắt đầu nghe
          </a>
        </div>
      </section>

      <section id="featured-songs" className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl">Bài hát nổi bật</h2>
          <a href="/search?type=song" className="text-blue-600 hover:underline">
            Xem tất cả
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredSongs.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl">Album mới phát hành</h2>
          <a href="/search?type=album" className="text-blue-600 hover:underline">
            Xem tất cả
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredAlbums.map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl mb-6">Thể loại phổ biến</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularGenres.length > 0 ? (
            popularGenres.map(genre => (
              <a
                key={genre}
                href={`/search?genre=${genre}`}
                className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg p-6 text-white hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl">{genre}</h3>
              </a>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">Chưa có thể loại phổ biến.</p>
          )}
        </div>
      </section>
    </div>
  );
}
