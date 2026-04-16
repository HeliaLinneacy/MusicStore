import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { songs, albums } = useMusic();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ewallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [ewalletProvider, setEwalletProvider] = useState('');

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl mb-4">Vui lòng đăng nhập để thanh toán</h2>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl mb-4">Giỏ hàng trống</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        toast.error('Vui lòng điền đầy đủ thông tin thẻ');
        return;
      }
    } else {
      if (!ewalletProvider) {
        toast.error('Vui lòng chọn nhà cung cấp ví điện tử');
        return;
      }
    }

    if (cartItems.length === 0) {
      toast.error('Không có sản phẩm để đặt hàng');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          paymentMethod,
          total,
          items: cartItems.map(item => ({
            id: item.id,
            type: item.type,
            quantity: item.quantity,
            price: item.price || 0
          }))
        })
      });

      if (!response.ok) {
        toast.error('Đặt đơn hàng thất bại, vui lòng thử lại');
        return;
      }

      toast.success('Đơn hàng đã được đặt thành công!');
      await clearCart();
      navigate('/orders');
    } catch (error) {
      toast.error('Không thể kết nối đến máy chủ đặt hàng');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-8">Thanh toán</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl mb-4">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Họ tên</label>
                <input
                  type="text"
                  value={user.name}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Số điện thoại</label>
                <input
                  type="text"
                  value={user.phone || ''}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6">
            <h2 className="text-xl mb-4">Phương thức thanh toán</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span>Thẻ tín dụng</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ewallet')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod === 'ewallet'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Wallet className="w-6 h-6" />
                <span>Ví điện tử</span>
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Số thẻ</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Ngày hết hạn</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      placeholder="123"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm mb-2">Chọn ví điện tử</label>
                <select
                  value={ewalletProvider}
                  onChange={e => setEwalletProvider(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  <option value="momo">MoMo</option>
                  <option value="zalopay">ZaloPay</option>
                  <option value="vnpay">VNPay</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6"
            >
              Xác nhận thanh toán ${total.toFixed(2)}
            </button>

            <p className="text-sm text-gray-500 mt-4 text-center">
              * Đây là mock payment - không thực hiện giao dịch thực tế
            </p>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl mb-4">Đơn hàng của bạn</h2>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {cartItems.map((item, index) => {
                if (!item) return null;
                const data = item.data as any;

                return (
                  <div key={`${item.id}-${index}`} className="flex gap-3 pb-3 border-b">
                    <img
                      src={data.coverUrl}
                      alt={data.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{data.title}</p>
                      <p className="text-xs text-gray-500">{data.artist}</p>
                    </div>
                    <p className="text-sm font-semibold">${item.price?.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
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
          </div>
        </div>
      </div>
    </div>
  );
}
