import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Song, Album, Review, mockReviews, mockSongs, mockAlbums } from '../data/mockData';

interface MusicContextType {
  songs: Song[];
  albums: Album[];
  reviews: Review[];
  addSong: (song: Song) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  addAlbum: (album: Album) => void;
  updateAlbum: (id: string, updates: Partial<Album>) => void;
  deleteAlbum: (id: string) => void;
  addReview: (review: Review) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  getSongById: (id: string) => Song | undefined;
  getAlbumById: (id: string) => Album | undefined;
  resetToDefaults: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSongs = localStorage.getItem('music-songs');
    const savedAlbums = localStorage.getItem('music-albums');
    const savedReviews = localStorage.getItem('music-reviews');

    if (savedSongs) {
      setSongs(JSON.parse(savedSongs));
    } else {
      // Use mock data as default if no saved data exists
      setSongs(mockSongs);
    }

    if (savedAlbums) {
      setAlbums(JSON.parse(savedAlbums));
    } else {
      // Use mock data as default if no saved data exists
      setAlbums(mockAlbums);
    }

    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(mockReviews);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('music-songs', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('music-albums', JSON.stringify(albums));
  }, [albums]);

  useEffect(() => {
    localStorage.setItem('music-reviews', JSON.stringify(reviews));
  }, [reviews]);

  const addSong = (song: Song) => {
    setSongs(prev => [...prev, song]);
  };

  const updateSong = (id: string, updates: Partial<Song>) => {
    setSongs(prev => prev.map(song =>
      song.id === id ? { ...song, ...updates } : song
    ));
  };

  const deleteSong = (id: string) => {
    setSongs(prev => prev.filter(song => song.id !== id));
    // Also remove this song from any albums that contain it
    setAlbums(prev => prev.map(album => ({
      ...album,
      songIds: album.songIds.filter(songId => songId !== id)
    })));
  };

  const addAlbum = (album: Album) => {
    setAlbums(prev => [...prev, album]);
  };

  const updateAlbum = (id: string, updates: Partial<Album>) => {
    setAlbums(prev => prev.map(album =>
      album.id === id ? { ...album, ...updates } : album
    ));
  };

  const deleteAlbum = (id: string) => {
    setAlbums(prev => prev.filter(album => album.id !== id));
  };

  const addReview = (review: Review) => {
    setReviews(prev => [review, ...prev]);
  };

  const updateReview = (id: string, updates: Partial<Review>) => {
    setReviews(prev => prev.map(review =>
      review.id === id ? { ...review, ...updates } : review
    ));
  };

  const deleteReview = (id: string) => {
    setReviews(prev => prev.filter(review => review.id !== id));
  };

  const getSongById = (id: string) => {
    return songs.find(song => song.id === id);
  };

  const getAlbumById = (id: string) => {
    return albums.find(album => album.id === id);
  };

  const resetToDefaults = () => {
    setSongs(mockSongs);
    setAlbums(mockAlbums);
  };

  const value: MusicContextType = {
    songs,
    albums,
    reviews,
    addSong,
    updateSong,
    deleteSong,
    addAlbum,
    updateAlbum,
    deleteAlbum,
    addReview,
    updateReview,
    deleteReview,
    getSongById,
    getAlbumById,
    resetToDefaults,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};