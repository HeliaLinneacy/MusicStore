import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, MapPin, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl mb-4">Vui lòng đăng nhập</h2>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    toast.success('Cập nhật thông tin thành công');
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Đã đăng xuất');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-8">Hồ sơ cá nhân</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-3">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {user.role === 'customer' ? 'Khách hàng' : user.role === 'staff' ? 'Nhân viên' : 'Nhà phân phối'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to="/orders"
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đơn hàng của tôi
              </Link>
              <Link
                to="/wishlist"
                className="block w-full text-center border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Danh sách yêu thích
              </Link>
              {user.role === 'staff' && (
                <Link
                  to="/admin"
                  className="block w-full text-center border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Quản lý
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-center border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Thông tin tài khoản</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="w-4 h-4" />
                  Họ tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditing
                      ? 'focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditing
                      ? 'focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Bảo mật</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Mật khẩu</p>
                    <p className="text-sm text-gray-500">••••••••</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
