import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockSongs, mockAlbums } from '../data/mockData';
import { Package, CreditCard, Wallet, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  type: 'song' | 'album';
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refund_requested';
  paymentMethod: 'card' | 'ewallet';
  canCancel: boolean;
  date: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/orders?userId=${user.id}`);
        if (!response.ok) {
          const errorText = await response.text();
          setFetchError(`Không thể tải đơn hàng: ${errorText}`);
          setOrders([]);
        } else {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        setFetchError('Không thể kết nối đến máy chủ đơn hàng');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl mb-4">Vui lòng đăng nhập để xem đơn hàng</h2>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (response.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, status: 'cancelled', canCancel: false }
              : order
          )
        );
        toast.success('Đơn hàng đã được hủy');
      }
    } catch {
      toast.error('Hủy đơn hàng thất bại');
    }
  };

  const handleRefundRequest = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (response.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, status: 'refund_requested' }
              : order
          )
        );
        toast.success('Yêu cầu hoàn tiền đã được gửi');
      }
    } catch {
      toast.error('Yêu cầu hoàn tiền thất bại');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refund_requested: 'bg-purple-100 text-purple-800'
    };

    const labels = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      refund_requested: 'Yêu cầu hoàn tiền'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-700">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-xl text-red-600 mb-4">{fetchError}</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl mb-4">Chưa có đơn hàng nào</h2>
          <p className="text-gray-500 mb-6">Tài khoản hiện chưa có đơn hàng</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Khám phá
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-8">Đơn hàng của tôi</h1>

      <div className="space-y-6">
        {orders.map(order => {
          const orderItems = order.items.map(item => {
            if (item.type === 'song') {
              const song = mockSongs.find(s => s.id === item.id);
              return song ? { ...item, data: song } : null;
            } else {
              const album = mockAlbums.find(a => a.id === item.id);
              return album ? { ...item, data: album } : null;
            }
          }).filter(Boolean);

          return (
            <div key={order.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Đơn hàng #{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Đặt ngày: {new Date(order.date).toLocaleDateString('vi-VN')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {order.paymentMethod === 'card' ? (
                      <>
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Thẻ tín dụng</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Ví điện tử</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-blue-600">${order.total.toFixed(2)}</p>
                </div>
              </div>

                  <div className="border-t pt-4 mb-4">
                <div className="space-y-3">
                  {orderItems.length > 0 ? (
                    orderItems.map((item, index) => {
                      if (!item) return null;
                      const data = item.data as any;

                      if (data) {
                        return (
                          <div key={`${item.id}-${index}`} className="flex gap-3">
                            <img
                              src={data.coverUrl}
                              alt={data.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <Link
                                to={`/${item.type}/${item.id}`}
                                className="font-medium hover:text-blue-600"
                              >
                                {data.title}
                              </Link>
                              <p className="text-sm text-gray-600">{data.artist}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.type === 'song' ? 'Bài hát' : 'Album'}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={`${item.id}-${index}`} className="flex gap-3 items-center">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                            {item.type === 'song' ? 'B' : 'A'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.id}</p>
                            <p className="text-sm text-gray-600">{item.type === 'song' ? 'Bài hát' : 'Album'}</p>
                            <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="text-right text-sm text-gray-600">${item.price.toFixed(2)}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-sm text-gray-500">
                      Không có dữ liệu chi tiết đơn hàng.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {order.canCancel && order.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Hủy đơn hàng
                  </button>
                )}
                {order.status === 'completed' && (
                  <button
                    onClick={() => handleRefundRequest(order.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Yêu cầu hoàn tiền
                  </button>
                )}
                {order.status === 'completed' && (
                  <Link
                    to={`/download/${order.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Tải xuống
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
