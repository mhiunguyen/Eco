import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { 
  SparklesIcon, 
  CurrencyDollarIcon, 
  MapPinIcon, 
  TrophyIcon 
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(
    localStorage.getItem('autoLoginAdmin') === 'true'
  );

  const toggleAutoLogin = () => {
    const newValue = !autoLoginEnabled;
    setAutoLoginEnabled(newValue);
    localStorage.setItem('autoLoginAdmin', newValue.toString());
    if (newValue) {
      alert('✅ Auto-login enabled! Reload trang để đăng nhập tự động.');
    } else {
      alert('❌ Auto-login disabled!');
    }
  };

  const features = [
    {
      icon: <SparklesIcon className="w-12 h-12 text-green-600" />,
      title: 'Quét QR nhận Cashback',
      description: 'Quét mã QR trên bao bì sản phẩm và nhận tiền thưởng ngay lập tức',
      link: '/scan',
    },
    {
      icon: <CurrencyDollarIcon className="w-12 h-12 text-blue-600" />,
      title: 'Tái chế nhận thưởng',
      description: 'Mang bao bì đến điểm thu gom và nhận thêm phần thưởng tái chế',
      link: '/map',
    },
    {
      icon: <MapPinIcon className="w-12 h-12 text-purple-600" />,
      title: 'Điểm thu gom gần bạn',
      description: 'Tìm các điểm thu gom rác tái chế gần nhất với vị trí của bạn',
      link: '/map',
    },
    {
      icon: <TrophyIcon className="w-12 h-12 text-yellow-600" />,
      title: 'Bảng xếp hạng',
      description: 'Cạnh tranh với cộng đồng và nhận huy hiệu thành tích',
      link: '/leaderboard',
    },
  ];

  const stats = [
    { label: 'Người dùng', value: '10,000+', color: 'text-green-600' },
    { label: 'Sản phẩm xanh', value: '500+', color: 'text-blue-600' },
    { label: 'Điểm thu gom', value: '100+', color: 'text-purple-600' },
    { label: 'CO2 tiết kiệm', value: '50 tấn', color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-12">
      {/* Debug: Auto-login toggle - Only show on mobile screens */}
      <div className="md:hidden bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
        <p className="text-sm mb-2 font-semibold">🔧 Development Mode</p>
        <button
          onClick={toggleAutoLogin}
          className={`px-6 py-3 rounded-lg shadow-lg font-bold text-base ${
            autoLoginEnabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {autoLoginEnabled ? '🔓 Auto-login ENABLED' : '🔒 Auto-login DISABLED'}
        </button>
        <p className="text-xs mt-2 text-gray-600">
          {autoLoginEnabled ? 'Reload trang để tự động đăng nhập admin' : 'Click để bật tự động đăng nhập'}
        </p>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl text-white p-12 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Tái chế thông minh, nhận thưởng xứng đáng
        </h1>
        <p className="text-xl mb-8 text-green-50">
          Quét QR, tái chế bao bì và nhận cashback ngay lập tức
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/products"
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Khám phá sản phẩm
          </Link>
          {isAuthenticated ? (
            <Link
              to="/scan"
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              Quét QR ngay
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              Đăng ký ngay
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className={`text-3xl font-bold ${stat.color} mb-2`}>
              {stat.value}
            </div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">
          Tính năng nổi bật
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition group"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          Cách thức hoạt động
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Mua sản phẩm xanh</h3>
            <p className="text-gray-600">
              Chọn sản phẩm có mã QR EcoBack từ các thương hiệu bền vững
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">Quét QR nhận Cashback</h3>
            <p className="text-gray-600">
              Quét mã QR trên bao bì để nhận cashback ngay lập tức
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Tái chế nhận thêm thưởng</h3>
            <p className="text-gray-600">
              Mang bao bì đến điểm thu gom và nhận thêm phần thưởng tái chế
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          {isAuthenticated ? 'Bắt đầu tái chế ngay!' : 'Sẵn sàng bảo vệ môi trường?'}
        </h2>
        <p className="text-xl mb-8 text-green-100">
          {isAuthenticated 
            ? 'Quét QR sản phẩm hoặc tìm điểm thu gom gần bạn'
            : 'Tham gia cùng hàng ngàn người dùng đang tạo ra sự khác biệt'
          }
        </p>
        {isAuthenticated ? (
          <div className="flex justify-center space-x-4">
            <Link
              to="/scan"
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              Quét QR ngay
            </Link>
            <Link
              to="/wallet"
              className="inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition border-2 border-white"
            >
              Xem ví của tôi
            </Link>
          </div>
        ) : (
          <Link
            to="/register"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Bắt đầu ngay hôm nay
          </Link>
        )}
      </section>
    </div>
  );
}
