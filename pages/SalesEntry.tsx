import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, AlertCircle, Plus, ShoppingCart, Phone, User, Trash2, Calendar, DollarSign, TrendingUp, Search, FileText, List, Filter, Tag, Layers, X, CreditCard, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { SaleItem, SaleRecord } from '../types';

// Helper for local date (YYYY-MM-DD)
const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const SalesEntry = () => {
  const { products, recordSale, updateSalePayment, recentSales, allSales, categories, brands } = useData();

  const [activeTab, setActiveTab] = useState<'manual' | 'history'>('manual');
  
  // -- Customer State --
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [saleDate, setSaleDate] = useState(getLocalToday());

  // -- Item Entry State --
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState<number | ''>(''); 
  
  // -- Payment/Due State --
  const [isDueEnabled, setIsDueEnabled] = useState(false);
  const [paidAmountInput, setPaidAmountInput] = useState<number | ''>('');
  const [commitmentDate, setCommitmentDate] = useState('');

  // -- Validation State --
  const [errors, setErrors] = useState<{
      customerName?: string;
      customerPhone?: string;
      product?: string;
      quantity?: string;
      price?: string;
      paidAmount?: string;
      commitmentDate?: string;
  }>({});

  // -- Cart State --
  const [cart, setCart] = useState<SaleItem[]>([]);

  // -- Notification --
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // -- History Filters State --
  const [historyDate, setHistoryDate] = useState(getLocalToday()); // Default to today (Local Time)
  const [historyCategory, setHistoryCategory] = useState('All');
  const [historyBrand, setHistoryBrand] = useState('All');
  const [historyStatus, setHistoryStatus] = useState('All'); 

  // -- Due Payment Modal State --
  const [selectedDueSale, setSelectedDueSale] = useState<SaleRecord | null>(null);
  const [duePaymentAmount, setDuePaymentAmount] = useState<number | ''>('');
  const [newCommitmentDate, setNewCommitmentDate] = useState('');
  const [dueError, setDueError] = useState('');

  // Filter Logic (Billing Tab)
  const availableBrands = useMemo(() => {
    if (filterCategory === 'All') return brands;
    const s = new Set<string>();
    products.forEach(p => {
      if (p.category === filterCategory) s.add(p.brand);
    });
    return Array.from(s).sort();
  }, [filterCategory, products, brands]);

  // Filter Logic (History Tab) - Brands depend on Category
  const availableHistoryBrands = useMemo(() => {
    if (historyCategory === 'All') return brands;
    const s = new Set<string>();
    products.forEach(p => {
      if (p.category === historyCategory) s.add(p.brand);
    });
    return Array.from(s).sort();
  }, [historyCategory, products, brands]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const catMatch = filterCategory === 'All' || p.category === filterCategory;
      const brandMatch = filterBrand === 'All' || p.brand === filterBrand;
      return catMatch && brandMatch;
    });
  }, [products, filterCategory, filterBrand]);

  // Reset dependent fields (Billing Tab)
  useEffect(() => {
    setFilterBrand('All');
    setSelectedProductId('');
  }, [filterCategory]);

  useEffect(() => {
    setSelectedProductId('');
  }, [filterBrand]);

  // Reset dependent fields (History Tab)
  useEffect(() => {
    setHistoryBrand('All');
  }, [historyCategory]);

  // Reset specific errors when inputs change
  useEffect(() => {
    if (errors.product) setErrors(prev => ({ ...prev, product: undefined }));
  }, [selectedProductId]);

  useEffect(() => {
     if (errors.quantity) setErrors(prev => ({ ...prev, quantity: undefined }));
  }, [quantity]);

  useEffect(() => {
     if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
  }, [salePrice]);

   useEffect(() => {
     if (errors.customerName) setErrors(prev => ({ ...prev, customerName: undefined }));
  }, [customerName]);

  useEffect(() => {
    if (errors.customerPhone) setErrors(prev => ({ ...prev, customerPhone: undefined }));
 }, [customerPhone]);

  useEffect(() => {
     if (errors.paidAmount) setErrors(prev => ({ ...prev, paidAmount: undefined }));
  }, [paidAmountInput]);

  useEffect(() => {
     if (errors.commitmentDate) setErrors(prev => ({ ...prev, commitmentDate: undefined }));
  }, [commitmentDate]);


  // Derived state for the current selection
  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  // Calculate Available Stock considering Items in Cart
  const quantityInCart = useMemo(() => {
      return cart
        .filter(item => item.productId === selectedProductId)
        .reduce((acc, item) => acc + item.quantity, 0);
  }, [cart, selectedProductId]);

  const availableStock = selectedProduct ? (selectedProduct.quantity - quantityInCart) : 0;
  
  const currentPrice = typeof salePrice === 'number' ? salePrice : 0;
  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  // Derived Payment Calculations
  const finalPaidAmount = isDueEnabled && typeof paidAmountInput === 'number' ? paidAmountInput : cartTotal;
  const finalDueAmount = Math.max(0, cartTotal - finalPaidAmount);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateCartItem = () => {
      const newErrors: typeof errors = {};
      let isValid = true;

      if (!selectedProduct) {
          newErrors.product = "Please select a product.";
          isValid = false;
      }

      if (quantity <= 0) {
          newErrors.quantity = "Quantity must be at least 1.";
          isValid = false;
      } else if (quantity > availableStock) {
          newErrors.quantity = `Only ${availableStock} units remaining.`;
          isValid = false;
      }

      if (currentPrice < 0) {
          newErrors.price = "Price cannot be negative.";
          isValid = false;
      } else if (salePrice === '') {
         newErrors.price = "Price is required.";
         isValid = false;
      } else if (selectedProduct && currentPrice < selectedProduct.price) {
          newErrors.price = `Price is lower than buying price (৳${selectedProduct.price}).`;
          isValid = false;
      }

      setErrors(newErrors);
      return isValid;
  };

  const handleAddToCart = () => {
    if (!validateCartItem() || !selectedProduct) return;

    // Add to Cart Logic
    const newItem: SaleItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.modelName,
      category: selectedProduct.category,
      brand: selectedProduct.brand,
      quantity: Number(quantity),
      unitPrice: currentPrice,
      total: Number(quantity) * currentPrice,
      buyingPrice: selectedProduct.price
    };

    setCart(prev => {
        // If exact same product and price, merge
        const existingIndex = prev.findIndex(item => item.productId === newItem.productId && item.unitPrice === newItem.unitPrice);
        
        if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex].quantity += newItem.quantity;
            updated[existingIndex].total += newItem.total; 
            updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
            return updated;
        } else {
            return [...prev, newItem];
        }
    });

    // Reset Entry Fields
    setQuantity(1);
    setSalePrice('');
    setSelectedProductId('');
    setErrors({});
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmSale = () => {
    // Validation
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!customerName.trim()) {
        newErrors.customerName = "Customer Name is required.";
        isValid = false;
    }
    
    if (isDueEnabled) {
        if (!customerPhone.trim()) {
            newErrors.customerPhone = "Phone number is required for due.";
            isValid = false;
        }

        if (paidAmountInput === '' || paidAmountInput < 0) {
            newErrors.paidAmount = "Enter a valid paid amount";
            isValid = false;
        } else if (paidAmountInput > cartTotal) {
            newErrors.paidAmount = "Paid amount cannot exceed total";
            isValid = false;
        }

        if (finalDueAmount > 0 && !commitmentDate) {
            newErrors.commitmentDate = "Commitment date is required.";
            isValid = false;
        }
    }

    if (!isValid) {
        setErrors(prev => ({...prev, ...newErrors}));
        return;
    }

    if (cart.length === 0) {
        showNotification('error', 'Cart is empty');
        return;
    }

    const success = recordSale({
        customerName: customerName,
        customerPhone: customerPhone,
        date: saleDate,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
        })),
        paidAmount: finalPaidAmount,
        dueAmount: finalDueAmount,
        commitmentDate: isDueEnabled && finalDueAmount > 0 ? commitmentDate : undefined
    });

    if (success) {
        showNotification('success', 'Transaction completed successfully!');
        // Reset All
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setSaleDate(getLocalToday()); // Reset to today
        setFilterCategory('All');
        setFilterBrand('All');
        setSelectedProductId('');
        setQuantity(1);
        setSalePrice('');
        setErrors({});
        setIsDueEnabled(false);
        setPaidAmountInput('');
        setCommitmentDate('');
    } else {
        showNotification('error', 'Failed to record transaction.');
    }
  };

  // -- Due Payment Logic --
  const handleDueClick = (sale: SaleRecord) => {
    if (sale.dueAmount && sale.dueAmount > 0) {
      setSelectedDueSale(sale);
      setDuePaymentAmount('');
      setNewCommitmentDate(sale.commitmentDate || '');
      setDueError('');
    }
  };

  const submitDuePayment = () => {
    if (!selectedDueSale) return;
    
    const amount = Number(duePaymentAmount);
    const currentDue = selectedDueSale.dueAmount || 0;

    if (amount <= 0) {
        setDueError('Amount must be greater than 0');
        return;
    }
    if (amount > currentDue) {
        setDueError('Amount cannot exceed due amount');
        return;
    }

    const remaining = currentDue - amount;
    if (remaining > 0 && !newCommitmentDate) {
        setDueError('Please provide a new commitment date for remaining due');
        return;
    }

    updateSalePayment(selectedDueSale.id, amount, remaining > 0 ? newCommitmentDate : undefined);
    
    showNotification('success', 'Payment recorded successfully!');
    setSelectedDueSale(null);
    setDuePaymentAmount('');
    setNewCommitmentDate('');
  };


  // Group Recent Sales by Date for Sidebar
  const groupedRecentSales = useMemo(() => {
    const groups: Record<string, SaleRecord[]> = {};
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    recentSales.forEach(sale => {
      let label = sale.date;
      if (sale.date === todayStr) {
        label = 'Today';
      } else if (sale.date === yesterdayStr) {
        label = 'Yesterday';
      } else {
        const d = new Date(sale.date);
        label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(sale);
    });
    return groups;
  }, [recentSales]);

  // -- Filtered History Logic --
  const filteredHistory = useMemo<SaleRecord[]>(() => {
    return allSales.filter(sale => {
      // 1. Date Filter
      if (historyDate && sale.date !== historyDate) return false;

      // 2. Category Filter
      if (historyCategory !== 'All') {
        // If no item in this sale matches the category, exclude sale
        const hasCategory = sale.items.some(item => item.category === historyCategory);
        if (!hasCategory) return false;
      }

      // 3. Brand Filter
      if (historyBrand !== 'All') {
        const hasBrand = sale.items.some(item => item.brand === historyBrand);
        if (!hasBrand) return false;
      }

      // 4. Status Filter
      if (historyStatus === 'Paid') {
        if (sale.dueAmount && sale.dueAmount > 0) return false;
      } else if (historyStatus === 'Due') {
        if (!sale.dueAmount || sale.dueAmount <= 0) return false;
      }

      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [allSales, historyDate, historyCategory, historyBrand, historyStatus]);

  const historyStats = useMemo(() => {
    return filteredHistory.reduce((acc, sale) => {
        const actualPaid = sale.paidAmount ?? 0;
        const isFullyPaid = !sale.dueAmount || sale.dueAmount <= 0;
        let saleProfit = 0;
        if (isFullyPaid) {
            saleProfit = sale.items.reduce((sum, item) => sum + ((item.unitPrice - item.buyingPrice) * item.quantity), 0);
        }
        return {
            revenue: acc.revenue + actualPaid,
            profit: acc.profit + saleProfit
        };
    }, { revenue: 0, profit: 0 });
  }, [filteredHistory]);

  return (
    <div className="space-y-6 relative">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Due Payment Modal */}
      {selectedDueSale && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2">
                        <CreditCard size={20} /> Collect Due Payment
                    </h3>
                    <button 
                        onClick={() => setSelectedDueSale(null)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-white p-1 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    {/* Info Card */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Customer</span>
                            <span className="text-sm font-bold text-gray-800">{selectedDueSale.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Phone</span>
                            <span className="text-sm font-medium text-gray-800">{selectedDueSale.customerPhone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Products</span>
                            <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                                {selectedDueSale.items.map(i => i.productName).join(', ')}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 my-2 pt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Total Amount:</span>
                                <span>৳{selectedDueSale.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-green-600">
                                <span>Paid Amount:</span>
                                <span>৳{(selectedDueSale.paidAmount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-red-600">
                                <span>Current Due:</span>
                                <span>৳{(selectedDueSale.dueAmount || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Input Fields */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Take Due Amount (৳)</label>
                        <input
                            type="number"
                            min="1"
                            max={selectedDueSale.dueAmount}
                            value={duePaymentAmount}
                            onChange={(e) => {
                                setDuePaymentAmount(e.target.value === '' ? '' : Number(e.target.value));
                                setDueError('');
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-gray-900"
                            placeholder="Enter amount"
                            autoFocus
                        />
                    </div>

                    {/* Dynamic Remaining Calculation */}
                    {(typeof duePaymentAmount === 'number' && duePaymentAmount > 0) && (
                         <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm flex justify-between">
                             <span className="text-blue-700">Remaining Due:</span>
                             <span className="font-bold text-blue-800">
                                 ৳{Math.max(0, (selectedDueSale.dueAmount || 0) - duePaymentAmount).toLocaleString()}
                             </span>
                         </div>
                    )}

                    {/* New Date Field - Only if remaining > 0 */}
                    {(typeof duePaymentAmount === 'number' && duePaymentAmount < (selectedDueSale.dueAmount || 0)) && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                             <label className="block text-xs font-bold text-gray-700 mb-1">New Estimate Date</label>
                             <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    min={getLocalToday()}
                                    value={newCommitmentDate}
                                    onChange={(e) => setNewCommitmentDate(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-gray-900"
                                />
                             </div>
                             <p className="text-[10px] text-gray-500 mt-1">Required because payment is partial.</p>
                        </div>
                    )}

                    {dueError && (
                        <div className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle size={12} /> {dueError}
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                         <button
                            onClick={() => setSelectedDueSale(null)}
                            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitDuePayment}
                            className="flex-1 px-4 py-2 text-white bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors shadow-lg shadow-orange-500/20"
                        >
                            Confirm Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800">Sales Management</h2>
        <p className="text-gray-500 text-sm">Create transactions and view sales history.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Billing Entry
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Sales History
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* 1. Customer Information Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="text-blue-600" size={20} />
                        Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 ${errors.customerName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'}`}
                                placeholder="Enter Name"
                            />
                            {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number {isDueEnabled && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 ${errors.customerPhone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'}`}
                                    placeholder="017..."
                                />
                            </div>
                             {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                <input
                                type="date"
                                value={saleDate}
                                onChange={(e) => setSaleDate(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Product Entry Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" size={20} />
                        Add Items
                    </h3>
                    
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <select
                                value={filterBrand}
                                onChange={(e) => setFilterBrand(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                                disabled={availableBrands.length === 0}
                            >
                                <option value="All">All Brands</option>
                                {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Select Product</label>
                            <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 text-sm ${errors.product ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'}`}
                            >
                                <option value="" disabled>
                                    {filteredProducts.length === 0 ? '-- No products --' : '-- Choose Product --'}
                                </option>
                                {filteredProducts.map(p => {
                                    // Calculate stock for this specific option
                                    const inCart = cart.filter(i => i.productId === p.id).reduce((acc, i) => acc + i.quantity, 0);
                                    const available = p.quantity - inCart;
                                    return (
                                        <option key={p.id} value={p.id} disabled={available <= 0}>
                                            {p.modelName} ({available} available)
                                        </option>
                                    );
                                })}
                            </select>
                            {selectedProduct && (
                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                    <span>Buy: ৳{selectedProduct.price}</span>
                                    <span className={availableStock <= 0 ? 'text-red-500 font-bold' : 'text-gray-700'}>
                                        Stock: {availableStock}
                                    </span>
                                </div>
                            )}
                            {errors.product && <p className="text-red-500 text-xs mt-1">{errors.product}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                max={Math.max(1, availableStock)}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 text-sm ${errors.quantity ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'}`}
                            />
                            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price (৳)</label>
                            <input
                                type="number"
                                min="0"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 text-sm ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'}`}
                            />
                              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleAddToCart}
                        disabled={availableStock <= 0 && !selectedProduct}
                        className="mt-4 w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add to Cart
                    </button>
                </div>

                {/* 3. Cart / Billing Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex justify-between items-center">
                        Billing Cart
                        <div className="flex items-center gap-2">
                            <label htmlFor="dueToggle" className={`text-xs font-medium cursor-pointer ${isDueEnabled ? 'text-orange-600' : 'text-gray-500'}`}>
                                {isDueEnabled ? 'Due Enabled' : 'Full Payment'}
                            </label>
                            <button
                                id="dueToggle"
                                onClick={() => {
                                    setIsDueEnabled(!isDueEnabled);
                                    setPaidAmountInput(''); // Reset paid amount when toggling
                                    setCommitmentDate('');
                                }}
                                className="relative inline-flex items-center cursor-pointer transition-colors focus:outline-none"
                            >
                                {isDueEnabled ? (
                                    <ToggleRight size={28} className="text-orange-500" />
                                ) : (
                                    <ToggleLeft size={28} className="text-gray-300" />
                                )}
                            </button>
                        </div>
                    </h3>
                    
                    {cart.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            Your cart is empty. Add items above.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                                <table className="w-full text-sm text-left min-w-[500px]">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3">Qty</th>
                                            <th className="px-4 py-3">Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {cart.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{item.productName}</div>
                                                    <div className="text-xs text-gray-500">{item.brand}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                                                <td className="px-4 py-3 text-gray-900">৳{item.unitPrice}</td>
                                                <td className="px-4 py-3 text-right font-medium text-gray-900">৳{item.total.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-bold text-gray-800">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right">Grand Total</td>
                                            <td className="px-4 py-3 text-right">৳{cartTotal.toLocaleString()}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Payment Section - Only shown if enabled */}
                            {isDueEnabled && (
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-xs font-bold text-orange-800 uppercase mb-3 flex items-center gap-2">
                                        <CreditCard size={14} /> Payment Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-orange-700 mb-1">Paid Amount (৳)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={cartTotal}
                                                value={paidAmountInput}
                                                onChange={(e) => setPaidAmountInput(e.target.value === '' ? '' : Number(e.target.value))}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm bg-white text-gray-900 placeholder-gray-400 ${errors.paidAmount ? 'border-red-300 focus:border-red-500' : 'border-orange-200 focus:border-orange-400'}`}
                                                placeholder="0.00"
                                            />
                                            {errors.paidAmount && <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-orange-700 mb-1">Due Amount (৳)</label>
                                            <div className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-900 cursor-not-allowed">
                                                {finalDueAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                         <label className="block text-xs font-medium text-orange-700 mb-1">Commitment Date <span className="text-red-500">*</span></label>
                                         <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" size={16} />
                                            <input 
                                                type="date"
                                                min={getLocalToday()}
                                                value={commitmentDate}
                                                onChange={(e) => setCommitmentDate(e.target.value)}
                                                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm bg-white text-gray-900 ${errors.commitmentDate ? 'border-red-300 focus:border-red-500' : 'border-orange-200 focus:border-orange-400'}`}
                                            />
                                         </div>
                                         {errors.commitmentDate && <p className="text-red-500 text-xs mt-1">{errors.commitmentDate}</p>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleConfirmSale}
                            disabled={cart.length === 0}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-green-500/20 flex items-center gap-2 transition-all transform active:scale-95"
                        >
                            <CheckCircle size={18} /> Confirm Sale
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Recent Transactions Sidebar - Only in Manual Tab */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full max-h-[800px] flex flex-col sticky top-6">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 z-10">
                        <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                        <p className="text-xs text-gray-500 mt-1">Current Month History</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-200">
                        {Object.keys(groupedRecentSales).length === 0 ? (
                            <div className="text-center text-gray-400 py-10 px-4">
                                <FileText className="mx-auto mb-2 opacity-50" size={32} />
                                <p className="text-sm">No transactions this month</p>
                            </div>
                        ) : (
                            Object.entries(groupedRecentSales).map(([dateLabel, sales]: [string, SaleRecord[]]) => (
                                <div key={dateLabel}>
                                    <div className="bg-blue-50/50 px-4 py-2 text-xs font-bold text-blue-600 uppercase border-b border-blue-100 sticky top-0 z-10 backdrop-blur-sm">
                                        {dateLabel}
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {sales.map((sale) => (
                                            <div 
                                                key={sale.id} 
                                                className={`p-4 transition-colors ${sale.dueAmount && sale.dueAmount > 0 ? 'hover:bg-orange-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                                                onClick={() => handleDueClick(sale)}
                                                title={sale.dueAmount && sale.dueAmount > 0 ? "Click to Pay Due" : ""}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm">{sale.customerName}</h4>
                                                        {sale.customerPhone && <p className="text-xs text-gray-500">Ph: {sale.customerPhone}</p>}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="font-bold text-gray-800 text-sm">৳{sale.totalAmount.toLocaleString()}</span>
                                                        {(sale.dueAmount && sale.dueAmount > 0) ? (
                                                            <div className="flex flex-col items-end">
                                                                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200">
                                                                    Due: {sale.dueAmount}
                                                                </span>
                                                                {sale.commitmentDate && (
                                                                    <span className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                                                        <Clock size={10} />
                                                                        {new Date(sale.commitmentDate).toLocaleDateString('en-GB')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">
                                                                Paid
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-1 mt-2">
                                                    {sale.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs text-gray-600">
                                                            <span>
                                                                <span className="font-medium text-gray-800">{item.productName}</span> 
                                                                <span className="text-gray-400"> ({item.brand})</span>
                                                            </span>
                                                            <span>৳{item.unitPrice} x {item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Filter Controls */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">Filter History</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    {/* Date Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Filter by Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={16} />
                            <input
                                type="date"
                                value={historyDate}
                                onChange={(e) => setHistoryDate(e.target.value)}
                                className={`w-full pl-9 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors cursor-pointer ${historyDate ? 'border-blue-500 bg-blue-50/10 text-gray-900' : 'border-gray-300 bg-white text-gray-500'}`}
                            />
                            {historyDate && (
                                <button
                                    onClick={() => setHistoryDate('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-all"
                                    title="Clear Date"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Category</label>
                         <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <select
                                value={historyCategory}
                                onChange={(e) => setHistoryCategory(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-gray-900 text-sm"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                    </div>

                     {/* Brand Filter */}
                    <div className="space-y-2">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Brand</label>
                         <div className="relative">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <select
                                value={historyBrand}
                                onChange={(e) => setHistoryBrand(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-gray-900 text-sm"
                                disabled={availableHistoryBrands.length === 0}
                            >
                                <option value="All">All Brands</option>
                                {availableHistoryBrands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                         </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Status</label>
                         <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <select
                                value={historyStatus}
                                onChange={(e) => setHistoryStatus(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-gray-900 text-sm"
                            >
                                <option value="All">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Due">Due</option>
                            </select>
                         </div>
                    </div>
                </div>
            </div>

            {/* Stats - Automatically updated based on filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-center gap-4 shadow-sm">
                    <div className="p-4 bg-green-100 rounded-full text-green-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-green-700 font-medium text-sm">Filtered Revenue</p>
                        <h4 className="text-2xl font-bold text-gray-800">৳{historyStats.revenue.toLocaleString()}</h4>
                    </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center gap-4 shadow-sm">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-blue-700 font-medium text-sm">Filtered Profit</p>
                        <h4 className="text-2xl font-bold text-gray-800">৳{historyStats.profit.toLocaleString()}</h4>
                    </div>
                </div>
            </div>

            {/* Filtered History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <List size={20} className="text-gray-500" />
                        Transactions List
                    </h3>
                    <span className="text-xs text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        {filteredHistory.length} Records
                    </span>
                </div>
                
                {filteredHistory.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Search className="mx-auto mb-3 opacity-50" size={32} />
                        <p>No transaction history found matching filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Items</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHistory.map((sale: SaleRecord) => (
                                    <tr 
                                        key={sale.id} 
                                        className={`transition-colors border-b last:border-0 ${sale.dueAmount && sale.dueAmount > 0 ? 'hover:bg-orange-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                                        onClick={() => handleDueClick(sale)}
                                        title={sale.dueAmount && sale.dueAmount > 0 ? "Click to Pay Due" : ""}
                                    >
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(sale.date).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{sale.customerName}</div>
                                            <div className="text-xs text-gray-400">{sale.customerPhone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {sale.items.length} Items
                                            <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                                {sale.items.map(i => i.productName).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                                            ৳{sale.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {(sale.dueAmount && sale.dueAmount > 0) ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200 shadow-sm">
                                                        Due: ৳{sale.dueAmount}
                                                    </span>
                                                    {sale.commitmentDate && (
                                                        <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                                            <Clock size={10} /> {new Date(sale.commitmentDate).toLocaleDateString('en-GB')}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200">
                                                    Paid
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default SalesEntry;