import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useMusic } from '../contexts/MusicContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const { songs, albums } = useMusic();

  const cartItems = cart.map(item => {
    if (item.type === 'song') {
      const song = songs.find(s => s.id === item.id);
      return song ? { ...item, data: song, price: song.price } : null;
    } else {
      const album = albums.find(a => a.id === item.id);
      return album ? { ...item, data: album, price: album.price } : null;
    }
  }).filter(Boolean);

  const total = cartItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 1), 0);
  const itemCount = cartItems.length;

  const handleRemove = (id: string) => {
    removeFromCart(id);
    toast.success('Đã xóa khỏi giỏ hàng');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Hãy thêm bài hát hoặc album vào giỏ hàng</p>
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Giỏ hàng ({itemCount} mục)</h1>
        <button
          onClick={() => {
            clearCart();
            toast.success('Đã xóa tất cả khỏi giỏ hàng');
          }}
          className="text-red-600 hover:text-red-700"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg overflow-hidden">
            {cartItems.map((item, index) => {
              if (!item) return null;
              const data = item.data as any;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex gap-4 p-4 border-b last:border-b-0"
                >
                  <img
                    src={data.coverUrl}
                    alt={data.title}
                    className="w-20 h-20 rounded object-cover"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/${item.type}/${item.id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {data.title}
                    </Link>
                    <p className="text-sm text-gray-600">{data.artist}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.type === 'song' ? 'Bài hát' : 'Album'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600 mb-2">
                      ${item.price?.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế:</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="font-semibold text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mb-3"
            >
              Thanh toán
            </button>

            <Link
              to="/"
              className="block text-center text-blue-600 hover:text-blue-700"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
