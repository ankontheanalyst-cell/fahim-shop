import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import { Package, AlertCircle, DollarSign, Filter, Layers } from 'lucide-react';

const Inventory = () => {
  const { products, categories, brands } = useData();

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Reset selected brand when category changes
  useEffect(() => {
    setSelectedBrand('All');
  }, [selectedCategory]);

  // Calculate available brands based on selected category
  const availableBrands = useMemo(() => {
    if (selectedCategory === 'All') {
      return brands;
    }
    const categoryBrands = new Set<string>();
    products.forEach(product => {
      if (product.category === selectedCategory) {
        categoryBrands.add(product.brand);
      }
    });
    return Array.from(categoryBrands).sort();
  }, [selectedCategory, products, brands]);

  // Filter Logic
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    const brandMatch = selectedBrand === 'All' || product.brand === selectedBrand;
    
    let statusMatch = true;
    if (selectedStatus === 'Out of Stock') {
      statusMatch = product.quantity === 0;
    } else if (selectedStatus === 'Low Stock') {
      statusMatch = product.quantity > 0 && product.quantity < 20;
    } else if (selectedStatus === 'In Stock') {
      statusMatch = product.quantity >= 20;
    }

    return categoryMatch && brandMatch && statusMatch;
  });

  // Metrics based on filtered data
  const totalItems = filteredProducts.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalStockValue = filteredProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const outOfStockCount = filteredProducts.filter(p => p.quantity === 0).length;

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: 'Out of Stock', class: 'bg-red-100 text-red-700 border-red-200' };
    if (qty < 20) return { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'In Stock', class: 'bg-green-100 text-green-700 border-green-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-gray-500 text-sm">Track stock levels and value.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Filter size={16} className="text-gray-500" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Layers size={16} className="text-gray-500" />
            <select 
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer focus:outline-none"
              disabled={availableBrands.length === 0}
            >
              <option value="All">All Brands</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${
              selectedStatus === 'All' ? 'bg-gray-400' :
              selectedStatus === 'In Stock' ? 'bg-green-500' :
              selectedStatus === 'Low Stock' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Stats - Dynamic based on filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Items" 
          value={totalItems.toLocaleString()} 
          icon={Package} 
          color="blue" 
        />
        <StatCard 
          title="Total Stock Value" 
          value={`৳${totalStockValue.toLocaleString()}`} 
          icon={DollarSign} 
          color="green" 
        />
        <StatCard 
          title="Out of Stock Products" 
          value={outOfStockCount} 
          icon={AlertCircle} 
          color="red" 
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Inventory Status</h3>
          <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
            Showing {filteredProducts.length} items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Available Qty</th>
                <th className="px-6 py-4 font-medium">Total Value</th>
                <th className="px-6 py-4 font-medium">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.quantity);
                const itemTotalValue = product.price * product.quantity;
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.modelName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{product.brand}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">৳{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.quantity === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      ৳{itemTotalValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No inventory found matching the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;