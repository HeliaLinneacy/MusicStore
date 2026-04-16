import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Music } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'reset'>('request');
  const { login, requestPasswordReset, verifyPasswordReset, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(email, password);
    if (success) {
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } else {
      toast.error('Email hoặc mật khẩu không đúng');
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Vui lòng nhập email hoặc số điện thoại');
      return;
    }

    const success = await requestPasswordReset(identifier.trim());
    if (success) {
      toast.success('Mã xác nhận đã được gửi. Vui lòng kiểm tra email hoặc SMS.');
      setForgotStep('verify');
    } else {
      toast.error('Không thể gửi mã xác nhận. Vui lòng kiểm tra thông tin và thử lại.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Vui lòng nhập mã xác nhận');
      return;
    }

    const success = await verifyPasswordReset(identifier.trim(), otp.trim());
    if (success) {
      toast.success('Mã xác nhận hợp lệ. Vui lòng tạo mật khẩu mới.');
      setForgotStep('reset');
    } else {
      toast.error('OTP không hợp lệ hoặc đã hết hạn');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const success = await confirmPasswordReset(identifier.trim(), otp.trim(), newPassword);
    if (success) {
      toast.success('Đặt lại mật khẩu thành công');
      setShowForgotPassword(false);
      setForgotStep('request');
      setIdentifier('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('Xác thực không thành công. Vui lòng thử lại');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Music className="w-10 h-10 text-blue-600" />
            <span className="text-2xl font-semibold">MusicStore</span>
          </Link>
          <h1 className="text-3xl mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {!showForgotPassword ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đăng nhập
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={forgotStep === 'request' ? handleRequestReset : forgotStep === 'verify' ? handleVerifyOtp : handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm mb-2">Email hoặc số điện thoại</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="you@example.com hoặc 0912345678"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={forgotStep !== 'request'}
                />
              </div>

              {forgotStep !== 'request' && (
                <div>
                  <label className="block text-sm mb-2">Mã xác nhận</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {forgotStep === 'reset' && (
                <>
                  <div>
                    <label className="block text-sm mb-2">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {forgotStep === 'request'
                  ? 'Gửi mã xác nhận'
                  : forgotStep === 'verify'
                  ? 'Xác minh mã OTP'
                  : 'Đặt lại mật khẩu'}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotStep('request');
                    setIdentifier('');
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

          {!showForgotPassword && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
