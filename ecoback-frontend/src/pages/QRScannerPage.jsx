import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Don't initialize if already scanning or got result
    if (scannerRef.current || result) {
      return;
    }

    const onScanSuccess = async (decodedText) => {
      console.log('QR Code scanned:', decodedText);
      
      // Stop scanner immediately
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      
      setScanning(false);
      setLoading(true);
      setError(null);

      try {
        // Call API to scan QR code
        const response = await api.post('/qrcodes/scan', {
          code: decodedText
        });

        setResult(response);
      } catch (err) {
        console.error('Scan error:', err);
        setError(err.message || 'Không thể quét mã QR');
      } finally {
        setLoading(false);
      }
    };

    const onScanError = (error) => {
      // Ignore scan errors (just camera feed errors, not actual errors)
    };

    // Initialize scanner
    try {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
      setScanning(true);
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError('Không thể khởi tạo camera');
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [result]);

  const handleActivateCashback = async () => {
    if (!result?.data?.qrCode?._id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/qrcodes/${result.data.qrCode._id}/activate`);
      setResult(response);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Không thể kích hoạt cashback');
      setLoading(false);
    }
  };

  const handleRedeemRecycle = async () => {
    if (!result?.data?.qrCode?._id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/qrcodes/${result.data.qrCode._id}/redeem-recycle`);
      setResult(response);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Không thể nhận thưởng tái chế');
      setLoading(false);
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    setError(null);
    setLoading(false);
    setScanning(false);
    // Reload để reset scanner
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quét mã QR</h1>
        <p className="text-gray-600">
          Quét mã QR trên bao bì sản phẩm để nhận cashback và thưởng tái chế
        </p>
      </div>

      {/* Scanner */}
      {!result && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div id="qr-reader" className="w-full"></div>
          
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Đang xử lý...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Lỗi quét mã</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scan Result */}
      {result && result.data && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Success Icon */}
          <div className="text-center">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <CheckCircleIcon className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Quét thành công!
            </h2>
          </div>

          {/* Product Info */}
          {result.data.product && (
            <div className="border-t border-b border-gray-200 py-4">
              <h3 className="font-semibold text-gray-700 mb-2">Sản phẩm:</h3>
              <div className="flex items-center space-x-4">
                {result.data.product.images?.[0] && (
                  <img
                    src={result.data.product.images[0]}
                    alt={result.data.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="font-bold text-lg">{result.data.product.name}</p>
                  <p className="text-gray-600">{result.data.product.brand?.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mã QR:</span>
              <span className="font-mono font-semibold">{result.data.qrCode.code}</span>
            </div>

            {/* Cashback */}
            {result.data.qrCode.cashbackAmount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-yellow-900">💰 Cashback:</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {result.data.qrCode.cashbackAmount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                {!result.data.qrCode.isCashbackActivated && (
                  <button
                    onClick={handleActivateCashback}
                    disabled={loading}
                    className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Đang xử lý...' : 'Kích hoạt Cashback'}
                  </button>
                )}
                {result.data.qrCode.isCashbackActivated && (
                  <div className="text-center text-green-600 font-semibold">
                    ✓ Đã nhận cashback
                  </div>
                )}
              </div>
            )}

            {/* Recycle Reward */}
            {result.data.qrCode.recycleReward > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-900">♻️ Thưởng tái chế:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {result.data.qrCode.recycleReward.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                {!result.data.qrCode.isRecycleRedeemed && (
                  <button
                    onClick={handleRedeemRecycle}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Đang xử lý...' : 'Nhận thưởng tái chế'}
                  </button>
                )}
                {result.data.qrCode.isRecycleRedeemed && (
                  <div className="text-center text-green-600 font-semibold">
                    ✓ Đã nhận thưởng tái chế
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scan History */}
          {result.data.qrCode.scanHistory?.length > 0 && (
            <div className="text-sm text-gray-600">
              <p>Số lần quét: {result.data.qrCode.scanHistory.length}</p>
              <p>Lần đầu: {new Date(result.data.qrCode.scanHistory[0].timestamp).toLocaleString('vi-VN')}</p>
            </div>
          )}

          {/* Scan Again Button */}
          <button
            onClick={handleScanAgain}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Quét mã khác
          </button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">📱 Hướng dẫn:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Cho phép truy cập camera khi được yêu cầu</li>
          <li>Đưa camera về phía mã QR trên bao bì sản phẩm</li>
          <li>Đợi hệ thống tự động quét và xử lý</li>
          <li>Nhận cashback ngay lập tức</li>
          <li>Mang bao bì đến điểm thu gom để nhận thêm thưởng tái chế</li>
        </ol>
      </div>
    </div>
  );
}
