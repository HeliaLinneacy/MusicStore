// Mock data for the music store application

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  price: number;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  keywords: string[];
  rating: number;
  reviewCount: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  genre: string;
  price: number;
  releaseDate: string;
  coverUrl: string;
  songIds: string[];
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  itemId: string;
  itemType: 'song' | 'album';
  rating: number;
  title: string;
  comment: string;
  date: string;
  approved: boolean;
  isEditorial: boolean;
}

export interface User {
  id: string | number;
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'staff' | 'vendor';
}

export interface CartItem {
  id: string;
  type: 'song' | 'album';
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refund_requested';
  paymentMethod: 'card' | 'ewallet';
  date: string;
  canCancel: boolean;
}

// Mock Songs
export const mockSongs: Song[] = [
  {
    id: 's1',
    title: 'Midnight Dreams',
    artist: 'The Echoes',
    album: 'Nocturnal',
    genre: 'Pop',
    price: 1.29,
    duration: '3:45',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['dream', 'night', 'emotional'],
    rating: 4.5,
    reviewCount: 128
  },
  {
    id: 's2',
    title: 'Electric Soul',
    artist: 'Neon Lights',
    album: 'Voltage',
    genre: 'Electronic',
    price: 0.99,
    duration: '4:12',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['electronic', 'energy', 'dance'],
    rating: 4.8,
    reviewCount: 256
  },
  {
    id: 's3',
    title: 'Sunset Boulevard',
    artist: 'Jazz Collective',
    album: 'City Nights',
    genre: 'Jazz',
    price: 1.49,
    duration: '5:30',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['jazz', 'smooth', 'instrumental'],
    rating: 4.7,
    reviewCount: 89
  },
  {
    id: 's4',
    title: 'Thunder Road',
    artist: 'Rock Warriors',
    album: 'Storm',
    genre: 'Rock',
    price: 1.29,
    duration: '4:05',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['rock', 'powerful', 'guitar'],
    rating: 4.6,
    reviewCount: 195
  },
  {
    id: 's5',
    title: 'Ocean Waves',
    artist: 'Calm Sounds',
    album: 'Tranquility',
    genre: 'Ambient',
    price: 0.99,
    duration: '6:20',
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['ambient', 'relaxing', 'meditation'],
    rating: 4.9,
    reviewCount: 412
  },
  {
    id: 's6',
    title: 'Urban Rhythm',
    artist: 'MC Flow',
    album: 'Street Poetry',
    genre: 'Hip Hop',
    price: 1.29,
    duration: '3:28',
    coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['hip hop', 'urban', 'rhythm'],
    rating: 4.4,
    reviewCount: 167
  },
  {
    id: 's7',
    title: 'Lạc Trôi',
    artist: 'Sơn Tùng M-TP',
    album: 'Lạc Trôi Single',
    genre: 'Pop Việt',
    price: 1.49,
    duration: '4:38',
    coverUrl: 'https://images.unsplash.com/photo-1631084713295-ab3f745a55bc?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['pop việt', 'vpop', 'ballad', 'sơn tùng'],
    rating: 4.9,
    reviewCount: 2845
  },
  {
    id: 's8',
    title: 'Nơi Này Có Anh',
    artist: 'Sơn Tùng M-TP',
    album: 'Nơi Này Có Anh',
    genre: 'Ballad',
    price: 1.29,
    duration: '5:12',
    coverUrl: 'https://images.unsplash.com/photo-1567635950571-8bed89a733e8?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['ballad', 'tình yêu', 'vpop', 'sơn tùng'],
    rating: 4.8,
    reviewCount: 3120
  },
  {
    id: 's9',
    title: 'See Tình',
    artist: 'Hoàng Thùy Linh',
    album: 'See Tình',
    genre: 'Pop Việt',
    price: 1.39,
    duration: '3:45',
    coverUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['pop việt', 'dance', 'edm', 'hoàng thùy linh'],
    rating: 4.7,
    reviewCount: 1876
  },
  {
    id: 's10',
    title: 'Bigcityboi',
    artist: 'Binz',
    album: 'Bigcityboi',
    genre: 'Rap Việt',
    price: 1.29,
    duration: '3:32',
    coverUrl: 'https://images.unsplash.com/photo-1625732869386-4e1d6106bb10?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['rap việt', 'hip hop', 'trap', 'binz'],
    rating: 4.6,
    reviewCount: 1542
  },
  {
    id: 's11',
    title: 'Anh Ơi Ở Lại',
    artist: 'Chi Pu',
    album: 'Anh Ơi Ở Lại',
    genre: 'Ballad',
    price: 1.19,
    duration: '4:28',
    coverUrl: 'https://images.unsplash.com/photo-1577200447725-cb57a45af49e?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['ballad', 'tình yêu', 'buồn', 'chi pu'],
    rating: 4.5,
    reviewCount: 987
  },
  {
    id: 's12',
    title: 'Em Của Ngày Hôm Qua',
    artist: 'Sơn Tùng M-TP',
    album: 'Em Của Ngày Hôm Qua',
    genre: 'Ballad',
    price: 1.49,
    duration: '4:16',
    coverUrl: 'https://images.unsplash.com/photo-1767969456802-9701de10528c?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['ballad', 'tình yêu', 'chia tay', 'sơn tùng'],
    rating: 4.9,
    reviewCount: 4562
  },
  {
    id: 's13',
    title: 'Bống Bống Bang Bang',
    artist: '789 Survival',
    album: 'Bống Bống Bang Bang',
    genre: 'Pop Việt',
    price: 1.29,
    duration: '3:18',
    coverUrl: 'https://images.unsplash.com/photo-1767969456717-5d0cdf1f1c18?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['pop việt', 'dance', 'vui nhộn', '789'],
    rating: 4.4,
    reviewCount: 756
  },
  {
    id: 's14',
    title: 'Chạy Ngay Đi',
    artist: 'Sơn Tùng M-TP',
    album: 'Chạy Ngay Đi',
    genre: 'EDM Việt',
    price: 1.39,
    duration: '3:42',
    coverUrl: 'https://images.unsplash.com/photo-1593665376977-065244b70bed?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['edm', 'dance', 'party', 'sơn tùng'],
    rating: 4.8,
    reviewCount: 2934
  },
  {
    id: 's15',
    title: 'Đừng Làm Trái Tim Anh Đau',
    artist: 'Sơn Tùng M-TP',
    album: 'Đừng Làm Trái Tim Anh Đau',
    genre: 'Pop Việt',
    price: 1.29,
    duration: '4:52',
    coverUrl: 'https://images.unsplash.com/photo-1726555474758-37ffb98cadf5?w=500',
    audioUrl: 'mock-audio-url',
    keywords: ['pop việt', 'tình yêu', 'buồn', 'sơn tùng'],
    rating: 4.7,
    reviewCount: 2156
  }
];

// Mock Albums
export const mockAlbums: Album[] = [
  {
    id: 'a1',
    title: 'Nocturnal',
    artist: 'The Echoes',
    genre: 'Pop',
    price: 9.99,
    releaseDate: '2025-01-15',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
    songIds: ['s1'],
    rating: 4.6,
    reviewCount: 45
  },
  {
    id: 'a2',
    title: 'Voltage',
    artist: 'Neon Lights',
    genre: 'Electronic',
    price: 12.99,
    releaseDate: '2024-11-20',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500',
    songIds: ['s2'],
    rating: 4.8,
    reviewCount: 78
  },
  {
    id: 'a3',
    title: 'City Nights',
    artist: 'Jazz Collective',
    genre: 'Jazz',
    price: 14.99,
    releaseDate: '2024-09-10',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500',
    songIds: ['s3'],
    rating: 4.7,
    reviewCount: 34
  },
  {
    id: 'a4',
    title: 'Storm',
    artist: 'Rock Warriors',
    genre: 'Rock',
    price: 11.99,
    releaseDate: '2025-03-01',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500',
    songIds: ['s4'],
    rating: 4.5,
    reviewCount: 56
  },
  {
    id: 'a5',
    title: 'Sky Tour',
    artist: 'Sơn Tùng M-TP',
    genre: 'Pop Việt',
    price: 15.99,
    releaseDate: '2019-07-01',
    coverUrl: 'https://images.unsplash.com/photo-1631084713295-ab3f745a55bc?w=500',
    songIds: ['s7', 's8', 's12', 's14', 's15'],
    rating: 4.9,
    reviewCount: 1823
  },
  {
    id: 'a6',
    title: 'Hoàng',
    artist: 'Hoàng Thùy Linh',
    genre: 'Pop Việt',
    price: 13.99,
    releaseDate: '2019-05-20',
    coverUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=500',
    songIds: ['s9'],
    rating: 4.7,
    reviewCount: 654
  },
  {
    id: 'a7',
    title: 'Bigcityboi Album',
    artist: 'Binz',
    genre: 'Rap Việt',
    price: 12.99,
    releaseDate: '2019-09-15',
    coverUrl: 'https://images.unsplash.com/photo-1625732869386-4e1d6106bb10?w=500',
    songIds: ['s10'],
    rating: 4.6,
    reviewCount: 432
  }
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'Nguyễn Văn A',
    itemId: 's1',
    itemType: 'song',
    rating: 5,
    title: 'Bài hát tuyệt vời!',
    comment: 'Giai điệu rất hay và cảm xúc. Tôi đã nghe đi nghe lại nhiều lần. Lời bài hát sâu sắc và ý nghĩa. Giọng ca của The Echoes thật xuất sắc, phối khí cũng rất tốt. Đây chắc chắn là một trong những bài hát yêu thích của tôi trong năm nay.',
    date: '2026-03-20',
    approved: true,
    isEditorial: false
  },
  {
    id: 'r2',
    userId: 'staff1',
    userName: 'Biên tập viên',
    itemId: 's2',
    itemType: 'song',
    rating: 5,
    title: 'Siêu phẩm Electronic',
    comment: 'Neon Lights đã tạo ra một tác phẩm electronic đỉnh cao với Electric Soul. Beat mạnh mẽ, bass sâu và synth đầy sáng tạo.',
    date: '2026-02-15',
    approved: true,
    isEditorial: true
  },
  {
    id: 'r3',
    userId: 'u2',
    userName: 'Trần Thị B',
    itemId: 'a1',
    itemType: 'album',
    rating: 4,
    title: 'Album đáng mua',
    comment: 'Toàn bộ album rất hay, tôi thích phong cách của The Echoes.',
    date: '2026-03-25',
    approved: true,
    isEditorial: false
  },
  {
    id: 'r4',
    userId: 'u3',
    userName: 'Lê Văn C',
    itemId: 's5',
    itemType: 'song',
    rating: 5,
    title: 'Thư giãn tuyệt vời',
    comment: 'Ocean Waves giúp tôi thư giãn sau những giờ làm việc căng thẳng.',
    date: '2026-04-01',
    approved: false,
    isEditorial: false
  },
  {
    id: 'r5',
    userId: 'u1',
    userName: 'Nguyễn Văn A',
    itemId: 's7',
    itemType: 'song',
    rating: 5,
    title: 'Siêu phẩm Vpop!',
    comment: 'Lạc Trôi là một trong những bài hát hay nhất của Vpop. MV đẹp, ca từ ý nghĩa, giai điệu bắt tai. Sơn Tùng M-TP thật sự là nghệ sĩ tài năng!',
    date: '2026-03-28',
    approved: true,
    isEditorial: false
  },
  {
    id: 'r6',
    userId: 'staff1',
    userName: 'Biên tập viên',
    itemId: 's8',
    itemType: 'song',
    rating: 5,
    title: 'Ballad đỉnh cao',
    comment: 'Nơi Này Có Anh là một ballad tuyệt vời với lời ca sâu lắng và giai điệu cảm động. Giọng hát của Sơn Tùng M-TP thể hiện rất tốt cảm xúc của bài hát.',
    date: '2026-03-15',
    approved: true,
    isEditorial: true
  },
  {
    id: 'r7',
    userId: 'u2',
    userName: 'Trần Thị B',
    itemId: 's9',
    itemType: 'song',
    rating: 5,
    title: 'Bài hát cực kỳ nghiện!',
    comment: 'See Tình của Hoàng Thùy Linh thật sự rất catchy! Tôi nghe đi nghe lại mãi không chán. Beat EDM sôi động, lời bài hát vui tươi.',
    date: '2026-04-05',
    approved: true,
    isEditorial: false
  },
  {
    id: 'r8',
    userId: 'u1',
    userName: 'Nguyễn Văn A',
    itemId: 's10',
    itemType: 'song',
    rating: 4,
    title: 'Rap Việt đỉnh cao',
    comment: 'Bigcityboi là bài rap Việt hay nhất tôi từng nghe. Flow của Binz rất smooth, beat trap cực chất!',
    date: '2026-04-08',
    approved: true,
    isEditorial: false
  },
  {
    id: 'r9',
    userId: 'u3',
    userName: 'Lê Văn C',
    itemId: 'a5',
    itemType: 'album',
    rating: 5,
    title: 'Album tuyệt vời nhất năm',
    comment: 'Sky Tour là một album đáng mua nhất. Tất cả các bài hát đều hay, không có bài nào bị lỗi. Sơn Tùng M-TP đã làm rất tốt!',
    date: '2026-03-30',
    approved: true,
    isEditorial: false
  },
  {
    id: 'r10',
    userId: 'staff1',
    userName: 'Biên tập viên',
    itemId: 's12',
    itemType: 'song',
    rating: 5,
    title: 'Bài hát ballad hay nhất',
    comment: 'Em Của Ngày Hôm Qua là một trong những bài ballad hay nhất của Vpop. Ca từ sâu sắc về tình yêu đã qua, giai điệu buồn nhưng rất đẹp. Đây là một tác phẩm đáng nhớ trong sự nghiệp của Sơn Tùng M-TP.',
    date: '2026-02-20',
    approved: true,
    isEditorial: true
  }
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'u1',
    email: 'customer@example.com',
    password: 'password123',
    name: 'Nguyễn Văn A',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    role: 'customer'
  },
  {
    id: 'staff1',
    email: 'staff@example.com',
    password: 'staff123',
    name: 'Nhân viên Kiểm duyệt',
    address: '',
    role: 'staff'
  },
  {
    id: 'vendor1',
    email: 'vendor@example.com',
    password: 'vendor123',
    name: 'Nhà phân phối XYZ',
    address: '',
    role: 'vendor'
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'o1',
    userId: 'u1',
    items: [
      { id: 's1', type: 'song', quantity: 1 },
      { id: 'a1', type: 'album', quantity: 1 }
    ],
    total: 11.28,
    status: 'completed',
    paymentMethod: 'card',
    date: '2026-03-15',
    canCancel: false
  },
  {
    id: 'o2',
    userId: 'u1',
    items: [
      { id: 's2', type: 'song', quantity: 1 }
    ],
    total: 0.99,
    status: 'pending',
    paymentMethod: 'ewallet',
    date: '2026-04-10',
    canCancel: true
  }
];
