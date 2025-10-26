import { useState, useEffect } from 'react';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isEcoFriendly: false,
    sortBy: '-createdAt',
  });

  const categories = [
    'Nước uống',
    'Đồ ăn',
    'Chăm sóc cá nhân',
    'Gia dụng',
    'Điện tử',
  ];

  const sortOptions = [
    { value: '-createdAt', label: 'Mới nhất' },
    { value: 'price', label: 'Giá thấp đến cao' },
    { value: '-price', label: 'Giá cao đến thấp' },
    { value: '-packaging.cashbackPercentage', label: 'Cashback cao nhất' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.isEcoFriendly) params.append('isEcoFriendly', 'true');
      if (filters.sortBy) params.append('sort', filters.sortBy);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (category) => {
    setFilters({ 
      ...filters, 
      category: filters.category === category ? '' : category 
    });
  };

  const toggleEcoFriendly = () => {
    setFilters({ ...filters, isEcoFriendly: !filters.isEcoFriendly });
  };

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sản phẩm xanh</h1>
          <p className="text-gray-600 mt-1">
            Khám phá {products.length} sản phẩm bền vững
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center space-x-2 text-gray-700 mb-4">
          <FunnelIcon className="w-5 h-5" />
          <span className="font-semibold">Bộ lọc</span>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    filters.category === category
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Eco Friendly */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo
            </label>
            <button
              onClick={toggleEcoFriendly}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filters.isEcoFriendly
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✨ Chỉ sản phẩm xanh
            </button>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp
            </label>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <span className="text-6xl mb-4 block">📦</span>
          <p className="text-gray-600">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
