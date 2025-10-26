import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  MapPinIcon, 
  TrophyIcon,
  QrCodeIcon,
  WalletIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo-full.png" 
              alt="EcoBack Logo" 
              className="h-40 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-1 hover:text-green-200 transition"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Trang chủ</span>
            </Link>
            
            <Link 
              to="/products" 
              className="flex items-center space-x-1 hover:text-green-200 transition"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>Sản phẩm</span>
            </Link>

            <Link 
              to="/map" 
              className="flex items-center space-x-1 hover:text-green-200 transition"
            >
              <MapPinIcon className="w-5 h-5" />
              <span>Bản đồ</span>
            </Link>

            <Link 
              to="/leaderboard" 
              className="flex items-center space-x-1 hover:text-green-200 transition"
            >
              <TrophyIcon className="w-5 h-5" />
              <span>Bảng xếp hạng</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link 
                  to="/scan" 
                  className="flex items-center space-x-1 hover:text-green-200 transition"
                >
                  <QrCodeIcon className="w-5 h-5" />
                  <span>Quét QR</span>
                </Link>

                <Link 
                  to="/wallet" 
                  className="flex items-center space-x-1 hover:text-green-200 transition"
                >
                  <WalletIcon className="w-5 h-5" />
                  <span>Ví</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>

            {/* Desktop user menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 hover:text-green-200 transition"
                  >
                    <UserCircleIcon className="w-6 h-6" />
                    <span>{user?.fullName || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-green-200 transition"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="hover:text-green-200 transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link 
              to="/" 
              onClick={closeMobileMenu}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Trang chủ</span>
            </Link>
            
            <Link 
              to="/products" 
              onClick={closeMobileMenu}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>Sản phẩm</span>
            </Link>

            <Link 
              to="/map" 
              onClick={closeMobileMenu}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition"
            >
              <MapPinIcon className="w-5 h-5" />
              <span>Bản đồ</span>
            </Link>

            <Link 
              to="/leaderboard" 
              onClick={closeMobileMenu}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition"
            >
              <TrophyIcon className="w-5 h-5" />
              <span>Bảng xếp hạng</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link 
                  to="/scan" 
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition"
                >
                  <QrCodeIcon className="w-5 h-5" />
                  <span>Quét QR</span>
                </Link>

                <Link 
                  to="/wallet" 
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition"
                >
                  <WalletIcon className="w-5 h-5" />
                  <span>Ví</span>
                </Link>

                <Link 
                  to="/profile" 
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition"
                >
                  <UserCircleIcon className="w-6 h-6" />
                  <span>{user?.fullName || 'Profile'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition w-full text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link 
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-green-700 rounded transition"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-green-600 rounded-lg font-semibold mx-4"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
