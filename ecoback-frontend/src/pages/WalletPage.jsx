import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import {
  WalletIcon,
  BanknotesIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function WalletPage() {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [walletRes, transactionsRes, statsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
        api.get('/wallet/stats')
      ]);

      setWallet(walletRes.data || walletRes);
      setTransactions(transactionsRes.transactions || transactionsRes.data?.transactions || generateMockTransactions());
      setMonthlyStats(statsRes.data || statsRes || generateMockStats());
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      // Mock data for demo
      setWallet({
        balance: user?.wallet?.balance || 0,
        totalEarned: user?.wallet?.totalEarned || 0,
        totalWithdrawn: user?.wallet?.totalWithdrawn || 0
      });
      setTransactions(generateMockTransactions());
      setMonthlyStats(generateMockStats());
    } finally {
      setLoading(false);
    }
  };

  const generateMockTransactions = () => {
    const types = ['scan', 'recycle', 'referral', 'bonus', 'withdrawal'];
    const statuses = ['completed', 'pending', 'failed'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      _id: `tx-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      amount: Math.floor(Math.random() * 50000) + 1000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `Giao dịch số ${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const generateMockStats = () => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return {
      monthlyEarnings: months.map((month, i) => ({
        month,
        amount: Math.floor(Math.random() * 200000) + 50000
      })),
      thisMonth: {
        scans: Math.floor(Math.random() * 100) + 20,
        recycles: Math.floor(Math.random() * 50) + 10,
        referrals: Math.floor(Math.random() * 20) + 5,
        total: Math.floor(Math.random() * 300000) + 100000
      }
    };
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (withdrawAmount > wallet.balance) {
      alert('Số dư không đủ');
      return;
    }

    if (withdrawAmount < 50000) {
      alert('Số tiền rút tối thiểu là 50,000 VND');
      return;
    }

    try {
      await api.post('/wallet/withdraw', {
        amount: withdrawAmount,
        ...bankInfo
      });
      
      alert('Yêu cầu rút tiền thành công! Chúng tôi sẽ xử lý trong 1-3 ngày làm việc.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setBankInfo({ bankName: '', accountNumber: '', accountName: '' });
      fetchWalletData();
    } catch (error) {
      alert(error.message || 'Rút tiền thất bại');
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'scan':
      case 'recycle':
      case 'referral':
      case 'bonus':
        return <ArrowDownCircleIcon className="w-6 h-6 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpCircleIcon className="w-6 h-6 text-red-600" />;
      default:
        return <WalletIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTransactionLabel = (type) => {
    const labels = {
      scan: 'Quét QR',
      recycle: 'Tái chế',
      referral: 'Giới thiệu',
      bonus: 'Thưởng',
      withdrawal: 'Rút tiền'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { label: 'Thành công', class: 'bg-green-100 text-green-800' },
      pending: { label: 'Đang xử lý', class: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Thất bại', class: 'bg-red-100 text-red-800' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-green-500 via-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-green-100 text-sm mb-2">Số dư ví</p>
            <h1 className="text-4xl font-bold mb-1">
              {(wallet?.balance || 0).toLocaleString()} VND
            </h1>
          </div>
          <WalletIcon className="w-16 h-16 text-white/30" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-green-100 text-xs mb-1">Tổng thu nhập</p>
            <p className="text-xl font-bold">
              {(wallet?.totalEarned || 0).toLocaleString()} VND
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-green-100 text-xs mb-1">Đã rút</p>
            <p className="text-xl font-bold">
              {(wallet?.totalWithdrawn || 0).toLocaleString()} VND
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWithdrawModal(true)}
          className="w-full bg-white text-green-600 py-3 rounded-lg font-bold hover:bg-green-50 transition flex items-center justify-center gap-2"
        >
          <ArrowUpCircleIcon className="w-5 h-5" />
          Rút tiền
        </button>
      </div>

      {/* Monthly Stats */}
      {monthlyStats && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Thu nhập tháng này</h2>
            <ChartBarIcon className="w-8 h-8 text-green-600" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Quét QR</p>
              <p className="text-2xl font-bold text-green-600">{monthlyStats.thisMonth?.scans || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Tái chế</p>
              <p className="text-2xl font-bold text-blue-600">{monthlyStats.thisMonth?.recycles || 0}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Giới thiệu</p>
              <p className="text-2xl font-bold text-purple-600">{monthlyStats.thisMonth?.referrals || 0}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Tổng thu</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(monthlyStats.thisMonth?.total || 0).toLocaleString()}đ
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Thu nhập 12 tháng</h3>
            <div className="flex items-end justify-between gap-2 h-48">
              {monthlyStats.monthlyEarnings?.map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-green-200 rounded-t relative group">
                    <div
                      className="w-full bg-green-600 rounded-t hover:bg-green-700 transition"
                      style={{ height: `${(month.amount / 200000) * 100}%`, minHeight: '4px' }}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {month.amount.toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mt-2 text-gray-600">{month.month}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Lịch sử giao dịch</h2>
          <button
            onClick={fetchWalletData}
            className="text-green-600 hover:text-green-700 flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">Làm mới</span>
          </button>
        </div>

        <div className="divide-y max-h-[600px] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có giao dịch nào
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx._id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{getTransactionLabel(tx.type)}</p>
                        {getStatusBadge(tx.status)}
                      </div>
                      <p className="text-sm text-gray-600">{tx.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {new Date(tx.createdAt).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toLocaleString()} đ
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Rút tiền</h3>
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tối thiểu 50,000đ"
                  min="50000"
                  max={wallet?.balance}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số dư khả dụng: {(wallet?.balance || 0).toLocaleString()} VND
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân hàng
                </label>
                <input
                  type="text"
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="VD: Vietcombank, ACB, ..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập số tài khoản"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tài khoản
                </label>
                <input
                  type="text"
                  value={bankInfo.accountName}
                  onChange={(e) => setBankInfo({...bankInfo, accountName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập tên chủ tài khoản"
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Thời gian xử lý: 1-3 ngày làm việc
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                    setBankInfo({ bankName: '', accountNumber: '', accountName: '' });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Xác nhận rút
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
