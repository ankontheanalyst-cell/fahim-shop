import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import { Plus, Search, Filter, Tag, DollarSign, Box, Layers, Smartphone, ChevronDown, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

// Custom Dropdown Component with Delete capability
const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  onDelete, 
  placeholder,
  icon: Icon
}: {
  options: string[], 
  value: string, 
  onChange: (val: string) => void, 
  onDelete: (val: string) => void,
  placeholder: string,
  icon: React.ElementType
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
        <Icon size={16} />
      </div>
      
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer min-h-[42px] flex items-center shadow-sm hover:border-blue-400 transition-colors"
      >
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            {options.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm text-center">No options available</div>
            ) : (
              options.map(option => (
                <div key={option} className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 group border-b border-gray-50 last:border-0">
                  <span 
                    className="flex-1 cursor-pointer text-gray-700 font-medium" 
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                  >
                    {option}
                  </span>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(option);
                      // If the deleted option was selected, clear selection
                      if (value === option) onChange('');
                    }}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all"
                    title="Delete option"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Products = () => {
  const { 
    products, 
    addProduct, 
    updateProduct,
    deleteProduct,
    categories, 
    brands, 
    models, 
    removeCategory, 
    removeBrand, 
    removeModel 
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{show: boolean, message: string}>({ show: false, message: '' });

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    category: '',
    brand: '',
    modelName: '',
    price: 0,
    quantity: 0
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // UI State for toggling "Add New" inputs
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  // Derived options for the form
  const formBrands = useMemo(() => {
    // If no category selected, show all brands
    if (!formData.category) return brands;

    // Filter products by selected category
    const relevantProducts = products.filter(p => p.category === formData.category);
    
    // If this category has existing products, filter brands to only those used in this category
    if (relevantProducts.length > 0) {
       const brandSet = new Set<string>();
       relevantProducts.forEach(p => brandSet.add(p.brand));
       return Array.from(brandSet).sort();
    }
    
    // If category is new (no products yet), show all brands to allow reuse
    return brands;
  }, [formData.category, products, brands]);

  const formModels = useMemo(() => {
     // If no category/brand selected, show all models
     if (!formData.category && !formData.brand) return models;

     // Filter products based on current selection
     const relevantProducts = products.filter(p => {
         const catMatch = !formData.category || p.category === formData.category;
         const brandMatch = !formData.brand || p.brand === formData.brand;
         return catMatch && brandMatch;
     });

     // If combinations exist, show specific models
     if (relevantProducts.length > 0) {
         const modelSet = new Set<string>();
         relevantProducts.forEach(p => modelSet.add(p.modelName));
         return Array.from(modelSet).sort();
     }

     // If new combination, show all models (or could be empty, but showing all allows reuse if needed)
     return models;
  }, [formData.category, formData.brand, products, models]);


  const showToast = (message: string) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      setDeleteId(null);
      showToast('Product deleted successfully');
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
        setEditingId(product.id);
        setFormData({
            category: product.category,
            brand: product.brand,
            modelName: product.modelName,
            price: product.price,
            quantity: product.quantity
        });
        // Check if values exist in lists to toggle custom mode
        setIsCustomCategory(!categories.includes(product.category));
        setIsCustomBrand(!brands.includes(product.brand));
        setIsCustomModel(!models.includes(product.modelName));
    } else {
        setEditingId(null);
        // Better default initialization
        setFormData({
            category: categories[0] || '',
            brand: '', // Start empty to force user to pick/type relevant brand
            modelName: '', 
            price: 0,
            quantity: 0
        });
        setIsCustomCategory(false);
        setIsCustomBrand(false);
        setIsCustomModel(false);
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.modelName && formData.price !== undefined && formData.category && formData.brand) {
      if (editingId) {
          const updatedProduct: Product = {
            id: editingId,
            category: formData.category,
            brand: formData.brand,
            modelName: formData.modelName,
            price: formData.price,
            quantity: formData.quantity || 0,
            description: ''
          };
          updateProduct(updatedProduct);
          showToast('Product updated successfully!');
      } else {
          const product: Product = {
            id: Date.now().toString(),
            category: formData.category,
            brand: formData.brand,
            modelName: formData.modelName,
            price: formData.price,
            quantity: formData.quantity || 0,
            description: ''
          };
          addProduct(product);
          showToast('Product added successfully!');
      }
      setIsModalOpen(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.modelName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
          <p className="text-gray-500 text-sm">Add, edit and organize your product catalog.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md shadow-blue-500/20"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by product name or brand..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 md:w-64">
          <Filter size={20} className="text-gray-500" />
          <select 
            className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 bg-white text-gray-900"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100 relative group-hover:bg-blue-50/50 transition-colors">
              {/* Centered Brand Name */}
              <h2 className="text-2xl font-black text-gray-300 group-hover:text-blue-600 transition-colors uppercase tracking-wide select-none">
                {product.brand}
              </h2>
              
              {/* Delete Icon */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(product.id);
                }}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                title="Delete Product"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {product.category}
                </span>
                <span className="font-bold text-gray-900">৳{product.price}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{product.modelName}</h3>
              
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600">Stock: <span className="font-medium text-gray-900">{product.quantity}</span></span>
                <button 
                  onClick={() => openModal(product)}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          <Box size={48} className="mx-auto mb-3 opacity-50" />
          <p>No products found matching your criteria.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors shadow-lg shadow-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                {isCustomCategory ? (
                   <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Enter new category name"
                      autoFocus
                    />
                  </div>
                ) : (
                  <CustomDropdown 
                    options={categories}
                    value={formData.category || ''}
                    onChange={(val) => setFormData(prev => ({...prev, category: val}))}
                    onDelete={removeCategory}
                    placeholder="Select Category"
                    icon={Tag}
                  />
                )}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsCustomCategory(!isCustomCategory);
                    if (!isCustomCategory) setFormData(prev => ({...prev, category: ''}));
                  }}
                  className="text-xs text-blue-600 font-medium mt-1.5 hover:underline flex items-center gap-1"
                >
                  {isCustomCategory ? "Select existing category" : "+ Add new category"}
                </button>
              </div>

              {/* Brand Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                {isCustomBrand ? (
                   <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      name="brand"
                      required
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Enter new brand name"
                      autoFocus
                    />
                  </div>
                ) : (
                  <CustomDropdown 
                    options={formBrands}
                    value={formData.brand || ''}
                    onChange={(val) => setFormData(prev => ({...prev, brand: val}))}
                    onDelete={removeBrand}
                    placeholder="Select Brand"
                    icon={Layers}
                  />
                )}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsCustomBrand(!isCustomBrand);
                    if (!isCustomBrand) setFormData(prev => ({...prev, brand: ''}));
                  }}
                  className="text-xs text-blue-600 font-medium mt-1.5 hover:underline flex items-center gap-1"
                >
                  {isCustomBrand ? "Select existing brand" : "+ Add new brand"}
                </button>
              </div>

              {/* Model Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                {isCustomModel ? (
                   <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      name="modelName"
                      required
                      value={formData.modelName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Enter new model name"
                      autoFocus
                    />
                  </div>
                ) : (
                  <CustomDropdown 
                    options={formModels}
                    value={formData.modelName || ''}
                    onChange={(val) => setFormData(prev => ({...prev, modelName: val}))}
                    onDelete={removeModel}
                    placeholder="Select Model"
                    icon={Smartphone}
                  />
                )}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsCustomModel(!isCustomModel);
                    if (!isCustomModel) setFormData(prev => ({...prev, modelName: ''}));
                  }}
                  className="text-xs text-blue-600 font-medium mt-1.5 hover:underline flex items-center gap-1"
                >
                  {isCustomModel ? "Select existing model" : "+ Add new model"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    <input
                      type="number"
                      name="quantity"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
                >
                  {editingId ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;