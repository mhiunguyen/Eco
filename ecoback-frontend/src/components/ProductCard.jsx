import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ArrowPathIcon,
  TagIcon 
} from '@heroicons/react/24/solid';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">📦</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.isEcoFriendly && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1">
              <SparklesIcon className="w-3 h-3" />
              <span>Xanh</span>
            </span>
          )}
          {product.packaging?.isRecyclable && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center space-x-1">
              <ArrowPathIcon className="w-3 h-3" />
              <span>Tái chế</span>
            </span>
          )}
        </div>

        {/* Cashback Badge */}
        {product.packaging?.cashbackPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
            <TagIcon className="w-4 h-4" />
            <span>{product.packaging.cashbackPercentage}% Cashback</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <div className="text-xs text-gray-500 uppercase mb-1">
            {product.brand.name}
          </div>
        )}

        {/* Name */}
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price & Rewards */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-green-600">
              {product.price.toLocaleString('vi-VN')}đ
            </span>
          </div>
          
          {product.packaging?.recycleReward > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Thưởng tái chế</div>
              <div className="text-sm font-bold text-blue-600">
                +{product.packaging.recycleReward.toLocaleString('vi-VN')}đ
              </div>
            </div>
          )}
        </div>

        {/* Material Badge */}
        {product.packaging?.material && (
          <div className="mt-3 inline-block bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
            Chất liệu: {product.packaging.material}
          </div>
        )}
      </div>
    </Link>
  );
}
