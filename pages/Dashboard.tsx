import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import StatCard from '../components/StatCard';
import { DollarSign, TrendingUp, CreditCard, Calendar, Package, ShoppingBag } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1'  // Indigo
];

// Helper to get local date string YYYY-MM-DD
const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Dashboard = () => {
  const { allSales, products } = useData();
  
  // 1. Initialize with current date
  const [selectedDate, setSelectedDate] = useState(getTodayString);

  // Filter Sales based on selection
  const dateSales = useMemo(() => {
    return allSales.filter(sale => sale.date === selectedDate);
  }, [allSales, selectedDate]);

  // Get Stats
  const currentStats = useMemo(() => {
      const stats = {
          totalSales: 0,
          totalProfit: 0,
          revenue: 0
      };
      
      dateSales.forEach(sale => {
          // Total Items Sold (Qty)
          const itemsQty = sale.items.reduce((acc, i) => acc + i.quantity, 0);
          stats.totalSales += itemsQty;
          
          // Revenue (Paid Amount for sales on this day)
          stats.revenue += (sale.paidAmount || 0);

          // Profit (Only for fully paid sales to keep it simple/safe)
          if (!sale.dueAmount || sale.dueAmount <= 0) {
               const cost = sale.items.reduce((acc, i) => acc + (i.buyingPrice * i.quantity), 0);
               const saleProfit = sale.totalAmount - cost;
               stats.totalProfit += saleProfit;
          }
      });
      return stats;
  }, [dateSales]);


  // 1. Generate Daily Sales Breakdown (List of sold items)
  const soldItemsBreakdown = useMemo(() => {
      const itemsMap: Record<string, { name: string, brand: string, category: string, qty: number }> = {};
      
      dateSales.forEach(sale => {
          sale.items.forEach(item => {
              // Create a unique key for grouping (Product Name + Brand)
              const key = `${item.productName}-${item.brand}`;
              if (!itemsMap[key]) {
                  itemsMap[key] = {
                      name: item.productName,
                      brand: item.brand,
                      category: item.category,
                      qty: 0
                  };
              }
              itemsMap[key].qty += item.quantity;
          });
      });

      // Sort by Quantity Descending
      return Object.values(itemsMap).sort((a, b) => b.qty - a.qty);
  }, [dateSales]);

  // 2. Generate Category Stock Data (Inventory)
  const categoryStockData = useMemo(() => {
    // Structure: { categoryName: { total: number, brands: { brandName: qty } } }
    const stats: Record<string, { total: number, brands: Record<string, number> }> = {};
    
    products.forEach(product => {
        const cat = product.category || 'Uncategorized';
        if (!stats[cat]) {
            stats[cat] = { total: 0, brands: {} };
        }
        stats[cat].total += product.quantity;
        
        // Brand Breakdown
        const brand = product.brand || 'Unknown';
        stats[cat].brands[brand] = (stats[cat].brands[brand] || 0) + product.quantity;
    });

    return Object.entries(stats)
      .map(([name, data], index) => ({
        name,
        value: data.total,
        brands: data.brands,
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [products]);


  // Helper to safely format currency
  const formatCurrency = (val?: number) => val ? `৳${val.toLocaleString()}` : '৳0';

  // Format date for display safe (avoid timezone shifts)
  const dateDisplay = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm">
             Performance metrics for {dateDisplay}
          </p>
        </div>
        
        {/* Date Filter */}
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
               <Calendar size={16} />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-10 pr-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer shadow-sm font-medium"
            />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Daily Revenue */}
        <StatCard 
          title="Daily Revenue" 
          value={formatCurrency(currentStats.revenue)} 
          icon={CreditCard} 
          color="orange" 
        />
        
        {/* 2. Total Profit */}
        <StatCard 
          title="Total Profit" 
          value={formatCurrency(currentStats.totalProfit)} 
          icon={TrendingUp} 
          color="green" 
        />
        
        {/* 3. Total Sales */}
        <StatCard 
          title="Total Sales" 
          value={currentStats.totalSales + ' units'} 
          icon={ShoppingBag} 
          color="blue" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Daily Sales Breakdown (Items List) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-blue-600" />
            Daily Sales Breakdown
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            {soldItemsBreakdown.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingBag size={32} className="mb-2 opacity-50" />
                <p>No sales recorded for this date</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
                      <tr>
                          <th className="px-3 py-2 bg-gray-50 rounded-tl-lg">Product</th>
                          <th className="px-3 py-2 bg-gray-50">Brand</th>
                          <th className="px-3 py-2 bg-gray-50">Category</th>
                          <th className="px-3 py-2 bg-gray-50 text-right rounded-tr-lg">Qty</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {soldItemsBreakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-3 font-medium text-gray-800">{item.name}</td>
                              <td className="px-3 py-3 text-gray-600">{item.brand}</td>
                              <td className="px-3 py-3">
                                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                                      {item.category}
                                  </span>
                              </td>
                              <td className="px-3 py-3 text-right font-bold text-gray-900">{item.qty}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Bar Chart - Category Stock Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-green-600" />
            Current Stock Level (Category)
          </h3>
          <div className="flex-1 w-full min-h-0">
            {categoryStockData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400">
                 No inventory data available
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStockData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                  <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const brands = data.brands as Record<string, number>;
                        return (
                            <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg min-w-[150px]">
                                <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1 text-sm">{label}</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {Object.entries(brands)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([brand, qty]) => (
                                        <div key={brand} className="flex justify-between text-xs">
                                            <span className="text-gray-600 truncate mr-2">{brand}:</span>
                                            <span className="font-medium text-gray-900">{qty}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs font-bold text-blue-600">
                                    <span>Total Stock:</span>
                                    <span>{data.value}</span>
                                </div>
                            </div>
                        );
                        }
                        return null;
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[6, 6, 0, 0]} 
                    animationDuration={1000}
                    label={{ position: 'top', fill: '#374151', fontSize: 12, fontWeight: 600 }}
                  >
                    {categoryStockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;