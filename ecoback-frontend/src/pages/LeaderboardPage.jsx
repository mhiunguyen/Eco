import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import {
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import {
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [selectedType, setSelectedType] = useState('points');
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();

  const periods = [
    { id: 'all-time', label: 'Mọi thời điểm' },
    { id: 'monthly', label: 'Tháng này' },
    { id: 'weekly', label: 'Tuần này' },
  ];

  const types = [
    { id: 'points', label: 'Điểm số', icon: <TrophyIcon className="w-5 h-5" /> },
    { id: 'scans', label: 'Lượt quét', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'co2', label: 'CO₂ tiết kiệm', icon: <FireIcon className="w-5 h-5" /> },
    { id: 'earnings', label: 'Thu nhập', icon: <ChartBarIcon className="w-5 h-5" /> },
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPeriod, selectedType]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/users/leaderboard`, {
        params: {
          period: selectedPeriod,
          type: selectedType,
          limit: 50
        }
      });
      
      setLeaderboardData(response.leaderboard || []);
      setUserRank(response.userRank || null);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Mock data for demo
      setLeaderboardData(generateMockData());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      rank: i + 1,
      user: {
        _id: `user-${i}`,
        fullName: `Người dùng ${i + 1}`,
        avatar: null
      },
      value: Math.floor(Math.random() * 10000) + 1000,
      level: Math.floor(Math.random() * 20) + 1,
      streak: Math.floor(Math.random() * 100)
    })).sort((a, b) => b.value - a.value);
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getMedalBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600';
    return 'bg-gray-200';
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'points':
        return `${value.toLocaleString()} điểm`;
      case 'scans':
        return `${value.toLocaleString()} lượt`;
      case 'co2':
        return `${value.toFixed(1)} kg`;
      case 'earnings':
        return `${value.toLocaleString()} VND`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-center mb-4">
          <TrophyIcon className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold text-center mb-2">Bảng xếp hạng</h1>
        <p className="text-center text-white/90">Cạnh tranh với cộng đồng EcoBack</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        {/* Period Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Thời gian
          </label>
          <div className="flex gap-2 flex-wrap">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedPeriod === period.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Xếp hạng theo
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                  selectedType === type.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon}
                <span className="text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User's Rank Card (if authenticated) */}
      {isAuthenticated && userRank && (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-white/80">Xếp hạng của bạn</p>
                <p className="text-3xl font-bold">#{userRank.rank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Thành tích</p>
              <p className="text-2xl font-bold">
                {formatValue(userRank.value, selectedType)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-8">🏆 Top 3 xuất sắc nhất</h2>
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center w-32">
              <div className={`w-20 h-20 rounded-full ${getMedalBg(2)} flex items-center justify-center mb-3 shadow-lg`}>
                {leaderboardData[1].user.avatar ? (
                  <img src={leaderboardData[1].user.avatar} alt="" className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-3xl font-bold text-white">2</span>
                )}
              </div>
              <p className="font-bold text-sm text-center mb-1">{leaderboardData[1].user.fullName}</p>
              <p className="text-xs text-gray-600">{formatValue(leaderboardData[1].value, selectedType)}</p>
              <div className="mt-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg p-4 w-full h-24 flex items-center justify-center">
                <TrophyIcon className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center w-32 -mt-8">
              <div className={`w-24 h-24 rounded-full ${getMedalBg(1)} flex items-center justify-center mb-3 shadow-2xl ring-4 ring-yellow-300`}>
                {leaderboardData[0].user.avatar ? (
                  <img src={leaderboardData[0].user.avatar} alt="" className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-4xl font-bold text-white">1</span>
                )}
              </div>
              <p className="font-bold text-base text-center mb-1">{leaderboardData[0].user.fullName}</p>
              <p className="text-sm text-gray-600">{formatValue(leaderboardData[0].value, selectedType)}</p>
              <div className="mt-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-4 w-full h-32 flex items-center justify-center">
                <TrophyIcon className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center w-32">
              <div className={`w-20 h-20 rounded-full ${getMedalBg(3)} flex items-center justify-center mb-3 shadow-lg`}>
                {leaderboardData[2].user.avatar ? (
                  <img src={leaderboardData[2].user.avatar} alt="" className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-3xl font-bold text-white">3</span>
                )}
              </div>
              <p className="font-bold text-sm text-center mb-1">{leaderboardData[2].user.fullName}</p>
              <p className="text-xs text-gray-600">{formatValue(leaderboardData[2].value, selectedType)}</p>
              <div className="mt-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-4 w-full h-20 flex items-center justify-center">
                <TrophyIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Toàn bộ xếp hạng</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <div className="divide-y">
            {leaderboardData.map((item) => (
              <div
                key={item.user._id}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${
                  isAuthenticated && user?._id === item.user._id ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className={`w-12 text-center font-bold text-xl ${getMedalColor(item.rank)}`}>
                    {item.rank <= 3 ? (
                      <TrophyIcon className="w-8 h-8 mx-auto" />
                    ) : (
                      `#${item.rank}`
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.user.avatar ? (
                      <img src={item.user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.user.fullName}
                      {isAuthenticated && user?._id === item.user._id && (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">Bạn</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <SparklesIcon className="w-4 h-4" />
                        Level {item.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <FireIcon className="w-4 h-4 text-orange-500" />
                        {item.streak} ngày
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatValue(item.value, selectedType)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
