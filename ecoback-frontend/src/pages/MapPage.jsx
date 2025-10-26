import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapPage() {
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.8231, 106.6297]); // HCMC default
  const [searchRadius, setSearchRadius] = useState(5000); // 5km
  const [materialFilter, setMaterialFilter] = useState('');

  const materials = ['plastic', 'glass', 'paper', 'metal', 'electronics'];

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          fetchNearbyPoints(longitude, latitude, searchRadius);
        },
        (error) => {
          console.error('Error getting location:', error);
          fetchAllPoints();
        }
      );
    } else {
      fetchAllPoints();
    }
  }, [searchRadius, materialFilter]);

  const fetchAllPoints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (materialFilter) params.append('material', materialFilter);

      const response = await api.get(`/collection-points?${params.toString()}`);
      setCollectionPoints(response.data || []);
    } catch (error) {
      console.error('Failed to fetch collection points:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPoints = async (lng, lat, maxDistance) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lng: lng.toString(),
        lat: lat.toString(),
        maxDistance: maxDistance.toString(),
      });
      if (materialFilter) params.append('material', materialFilter);

      const response = await api.get(`/collection-points/nearby?${params.toString()}`);
      setCollectionPoints(response.data || []);
    } catch (error) {
      console.error('Failed to fetch nearby points:', error);
      fetchAllPoints();
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNearby = () => {
    if (userLocation) {
      fetchNearbyPoints(userLocation[1], userLocation[0], searchRadius);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'dropoff':
        return 'bg-blue-100 text-blue-800';
      case 'pickup':
        return 'bg-green-100 text-green-800';
      case 'both':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'dropoff':
        return 'Điểm gửi';
      case 'pickup':
        return 'Thu gom tận nơi';
      case 'both':
        return 'Cả hai';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Bản đồ điểm thu gom</h1>
        <p className="text-gray-600 mt-1">
          Tìm điểm thu gom rác tái chế gần bạn
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Radius Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bán kính (km)
            </label>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
          </div>

          {/* Material Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại vật liệu
            </label>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material.charAt(0).toUpperCase() + material.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearchNearby}
              disabled={!userLocation || loading}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tìm...' : 'Tìm gần tôi'}
            </button>
          </div>
        </div>

        {/* Result Count */}
        <div className="text-sm text-gray-600">
          Tìm thấy <span className="font-bold text-green-600">{collectionPoints.length}</span> điểm thu gom
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '600px' }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <ChangeView center={mapCenter} zoom={13} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User Location Marker */}
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold">📍 Vị trí của bạn</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Collection Points Markers */}
              {collectionPoints.map((point) => (
                <Marker
                  key={point._id}
                  position={[point.location.coordinates[1], point.location.coordinates[0]]}
                  eventHandlers={{
                    click: () => setSelectedPoint(point),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-bold text-lg mb-2">{point.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{point.address?.fullAddress || 'Địa chỉ không có'}</p>
                      <div className="space-y-1 text-sm">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeColor(point.type)}`}>
                          {getTypeLabel(point.type)}
                        </div>
                        {point.distance && (
                          <p className="text-gray-600">📏 {(point.distance / 1000).toFixed(2)} km</p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Collection Points List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 max-h-[600px] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Danh sách điểm thu gom</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : collectionPoints.length === 0 ? (
              <div className="text-center py-8">
                <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Không tìm thấy điểm thu gom</p>
              </div>
            ) : (
              <div className="space-y-4">
                {collectionPoints.map((point) => (
                  <button
                    key={point._id}
                    onClick={() => {
                      setSelectedPoint(point);
                      setMapCenter([point.location.coordinates[1], point.location.coordinates[0]]);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedPoint?._id === point._id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{point.name}</h3>
                      {point.distance && (
                        <span className="text-sm text-green-600 font-semibold">
                          {(point.distance / 1000).toFixed(1)} km
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{point.address?.fullAddress || 'Địa chỉ không có'}</p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(point.type)}`}>
                        {getTypeLabel(point.type)}
                      </span>
                      {point.materialsAccepted.slice(0, 3).map((material) => (
                        <span
                          key={material}
                          className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {material}
                        </span>
                      ))}
                      {point.materialsAccepted.length > 3 && (
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          +{point.materialsAccepted.length - 3}
                        </span>
                      )}
                    </div>

                    {point.contact?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {point.contact.phone}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Point Details */}
      {selectedPoint && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">{selectedPoint.name}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">📍 Địa chỉ:</h3>
                <p className="text-gray-600">{selectedPoint.address?.fullAddress || 'Địa chỉ không có'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">📞 Liên hệ:</h3>
                <p className="text-gray-600">{selectedPoint.contact?.phone || 'Không có'}</p>
                {selectedPoint.contact?.email && (
                  <p className="text-gray-600">{selectedPoint.contact.email}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">🏷️ Loại điểm:</h3>
                <span className={`inline-block px-3 py-1 rounded font-semibold ${getTypeColor(selectedPoint.type)}`}>
                  {getTypeLabel(selectedPoint.type)}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">♻️ Vật liệu nhận:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPoint.materialsAccepted.map((material) => (
                    <span
                      key={material}
                      className="px-3 py-1 rounded bg-green-100 text-green-800 font-medium"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Giờ hoạt động:
              </h3>
              <div className="space-y-2">
                {selectedPoint.operatingHours && Object.entries(selectedPoint.operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{day}:</span>
                    <span className="text-gray-800 font-medium">
                      {hours.isClosed ? 'Đóng cửa' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
              </div>

              {selectedPoint.description && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">ℹ️ Thông tin thêm:</h3>
                  <p className="text-gray-600 text-sm">{selectedPoint.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
