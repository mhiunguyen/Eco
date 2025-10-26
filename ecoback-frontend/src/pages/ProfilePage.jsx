import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CalendarIcon,
  PencilIcon,
  TrophyIcon,
  SparklesIcon,
  FireIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [impact, setImpact] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Only fetch profile, impact and badges are part of profile
      const profileRes = await api.get('/users/profile');

      console.log('Profile Response:', profileRes);

      // Backend returns { success, data }, api service extracts response.data
      const profileData = profileRes.data || profileRes;

      setProfile(profileData);
      
      // Map impact data from profile.impact
      if (profileData.impact) {
        setImpact({
          materials: {
            plastic: profileData.impact.totalPlasticRecycled || 0,
            glass: profileData.impact.totalGlassRecycled || 0,
            paper: profileData.impact.totalPaperRecycled || 0,
            metal: profileData.impact.totalMetalRecycled || 0
          },
          environmental: {
            co2SavedKg: profileData.impact.co2Saved || 0,
            treesEquivalent: profileData.impact.treesEquivalent || 0,
            waterSavedLiters: profileData.impact.waterSaved || 0
          }
        });
      }

      // Mock badges data (15 badges, all unlocked for admin)
      const mockBadges = [
        { _id: '1', name: 'Người mới', description: 'Hoàn thành scan đầu tiên', icon: '🌱', unlocked: true },
        { _id: '2', name: 'Tích cực', description: 'Scan 10 lần', icon: '⭐', unlocked: true },
        { _id: '3', name: 'Chiến binh', description: 'Scan 50 lần', icon: '🛡️', unlocked: true },
        { _id: '4', name: 'Siêu sao', description: 'Scan 100 lần', icon: '⚡', unlocked: true },
        { _id: '5', name: 'Huyền thoại', description: 'Scan 500 lần', icon: '👑', unlocked: true },
        { _id: '6', name: 'Eco Master', description: 'Tiết kiệm 100kg CO2', icon: '🌍', unlocked: true },
        { _id: '7', name: 'Streak King', description: '30 ngày liên tiếp', icon: '🔥', unlocked: true },
        { _id: '8', name: 'Rich', description: 'Thu nhập 1 triệu', icon: '💰', unlocked: true },
        { _id: '9', name: 'Top 10', description: 'Top 10 Leaderboard', icon: '🏆', unlocked: true },
        { _id: '10', name: 'Champion', description: 'Top 1 Leaderboard', icon: '👑', unlocked: true },
        { _id: '11', name: 'Referrer', description: 'Giới thiệu 5 người', icon: '🤝', unlocked: true },
        { _id: '12', name: 'Influencer', description: 'Giới thiệu 20 người', icon: '📢', unlocked: true },
        { _id: '13', name: 'Recycle Pro', description: 'Tái chế 100kg', icon: '♻️', unlocked: true },
        { _id: '14', name: 'Level 10', description: 'Đạt level 10', icon: '🔟', unlocked: true },
        { _id: '15', name: 'Level 20', description: 'Đạt level 20', icon: '🌟', unlocked: true },
      ];
      setBadges(mockBadges);

      // Set form data
      setFormData({
        fullName: profileData.fullName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        gender: profileData.gender || '',
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/users/profile', formData);
      await fetchProfileData();
      setEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Update failed:', error);
      alert(error.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{profile?.fullName || 'User'}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm sm:text-base text-green-100">
                <span className="flex items-center">
                  <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  Level {profile?.level || 1}
                </span>
                <span className="flex items-center">
                  <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  {profile?.xp || 0} XP
                </span>
                <span className="flex items-center">
                  <FireIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  {profile?.currentStreak || 0} ngày
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="w-full sm:w-auto bg-white text-green-600 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center space-x-2"
            >
              <PencilIcon className="w-5 h-5" />
              <span>{editing ? 'Hủy' : 'Chỉnh sửa'}</span>
            </button>
            <button
              onClick={fetchProfileData}
              className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition flex items-center gap-2"
              title="Làm mới dữ liệu"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* XP Progress Bar */}
        {profile && (
          <div className="mt-6">
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span>Tiến độ Level {profile.level || 1}</span>
              <span>{profile.xp || 0} / {(profile.level || 1) * 1000} XP</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2 sm:h-3">
              <div 
                className="bg-white rounded-full h-2 sm:h-3 transition-all duration-500"
                style={{ 
                  width: `${Math.min((profile.xp || 0) / ((profile.level || 1) * 1000) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Thông tin cá nhân</h2>
            
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-semibold">{profile?.fullName || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{profile?.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-semibold">{profile?.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày sinh</p>
                    <p className="font-semibold">
                      {profile?.dateOfBirth 
                        ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')
                        : '-'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Giới tính</p>
                    <p className="font-semibold">
                      {profile?.gender === 'male' ? 'Nam' : profile?.gender === 'female' ? 'Nữ' : profile?.gender === 'other' ? 'Khác' : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Environmental Impact */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Tác động môi trường</h2>
            
            {impact && (
              <div className="space-y-6">
                {/* Materials Recycled */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Vật liệu đã tái chế</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {Object.entries(impact.materials || {}).map(([material, weight]) => (
                      <div key={material} className="bg-green-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 capitalize">{material}</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{weight.toFixed(2)} kg</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Environmental Stats */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Đóng góp môi trường</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-gray-600">CO₂ tiết kiệm</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
                        {impact.environmental?.co2SavedKg?.toFixed(2) || 0} kg
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-gray-600">Cây tương đương</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        {impact.environmental?.treesEquivalent?.toFixed(0) || 0} cây
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-gray-600">Nước tiết kiệm</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">
                        {impact.environmental?.waterSavedLiters?.toFixed(0) || 0} L
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badges Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Huy hiệu ({badges.filter(b => b.unlocked).length}/{badges.length})
            </h2>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-2 sm:gap-3">
              {badges.map((badge) => (
                <div
                  key={badge._id}
                  className={`relative group ${badge.unlocked ? '' : 'opacity-40 grayscale'}`}
                  title={badge.description}
                >
                  <div className="text-3xl sm:text-4xl lg:text-5xl text-center mb-1">
                    {badge.icon}
                  </div>
                  <p className="text-[10px] sm:text-xs text-center font-medium truncate">
                    {badge.name}
                  </p>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap max-w-xs">
                      {badge.description}
                      {!badge.unlocked && badge.requirement && (
                        <div className="text-gray-300 mt-1">
                          Yêu cầu: {badge.requirement}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
