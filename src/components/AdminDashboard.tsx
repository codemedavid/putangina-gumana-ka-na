import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Beaker, TrendingUp, Package, Users, Lock, FolderOpen, CreditCard, Sparkles, Heart, Layers, Shield } from 'lucide-react';
import type { Product } from '../types';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';
import ImageUpload from './ImageUpload';
import CategoryManager from './CategoryManager';
import PaymentMethodManager from './PaymentMethodManager';
import VariationManager from './VariationManager';
import COAManager from './COAManager';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('peptide_admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { products, loading, addProduct, updateProduct, deleteProduct } = useMenu();
  const { categories } = useCategories();
  const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'add' | 'edit' | 'categories' | 'payments' | 'coa'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [managingVariationsFor, setManagingVariationsFor] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    base_price: 0,
    category: 'research',
    featured: false,
    available: true,
    purity_percentage: 99.0,
    molecular_weight: '',
    cas_number: '',
    sequence: '',
    storage_conditions: 'Store at -20°C',
    stock_quantity: 0,
    image_url: null,
    discount_active: false,
    inclusions: null
  });

  const handleAddProduct = () => {
    setCurrentView('add');
    setSelectedProducts(new Set());
    const defaultCategory = categories.length > 0 ? categories[0].id : 'research';
    setFormData({
      name: '',
      description: '',
      base_price: 0,
      category: defaultCategory,
      featured: false,
      available: true,
      purity_percentage: 99.0,
      molecular_weight: '',
      cas_number: '',
      sequence: '',
      storage_conditions: 'Store at -20°C',
      stock_quantity: 0,
      image_url: null,
      discount_active: false,
      inclusions: null
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setCurrentView('edit');
    setSelectedProducts(new Set());
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        setIsProcessing(true);
        const result = await deleteProduct(id);
        if (!result.success) {
          alert(result.error || 'Failed to delete product');
        }
      } catch (error) {
        alert('Failed to delete product. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      alert('Please select products to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone.`)) {
      try {
        setIsProcessing(true);
        let successCount = 0;
        let failedCount = 0;

        for (const productId of selectedProducts) {
          const result = await deleteProduct(productId);
          if (result.success) {
            successCount++;
          } else {
            failedCount++;
          }
        }

        if (failedCount > 0) {
          alert(`Deleted ${successCount} product(s). ${failedCount} failed.`);
        } else {
          alert(`Successfully deleted ${successCount} product(s)`);
        }

        setSelectedProducts(new Set());
      } catch (error) {
        alert('Failed to delete products. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.description || !formData.base_price) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.category || categories.length === 0) {
      alert('Please select a valid category. Add categories first if none exist.');
      return;
    }

    try {
      setIsProcessing(true);
      if (editingProduct) {
        // Remove read-only fields and relations before updating
        const { id, created_at, updated_at, variations, ...updateData } = formData as any;
        
        // Clean up the data - only remove undefined and empty strings, keep false, 0, and null
        const cleanedData = Object.fromEntries(
          Object.entries(updateData).filter(([key, value]) => {
            // Keep false, 0, and null values - they are valid
            if (value === false || value === 0 || value === null) return true;
            // Remove undefined and empty strings
            if (value === undefined || value === '') return false;
            return true;
          })
        ) as Partial<Product>;
        
        console.log('Saving product with data:', cleanedData);
        const result = await updateProduct(editingProduct.id, cleanedData);
        if (!result.success) {
          throw new Error(result.error);
        }
      } else {
        // Remove non-creatable fields for new products
        const { variations, id, created_at, updated_at, ...createData } = formData as any;
        
        // Clean up the data - only remove undefined and empty strings, keep false, 0, and null
        const cleanedData = Object.fromEntries(
          Object.entries(createData).filter(([key, value]) => {
            // Keep false, 0, and null values - they are valid
            if (value === false || value === 0 || value === null) return true;
            // Remove undefined and empty strings
            if (value === undefined || value === '') return false;
            return true;
          })
        );
        
        const result = await addProduct(cleanedData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
        if (!result.success) {
          throw new Error(result.error);
        }
      }
      setCurrentView('products');
      setEditingProduct(null);
    } catch (error) {
      console.error('Save product error:', error);
      alert(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setCurrentView(currentView === 'add' || currentView === 'edit' ? 'products' : 'dashboard');
    setEditingProduct(null);
  };

  // Dashboard Stats
  const totalProducts = products.length;
  const featuredProducts = products.filter(p => p.featured).length;
  const availableProducts = products.filter(p => p.available).length;
  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: products.filter(p => p.category === cat.id).length
  }));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Peptide@Admin!2025') {
      setIsAuthenticated(true);
      localStorage.setItem('peptide_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('peptide_admin_auth');
    setPassword('');
    setCurrentView('dashboard');
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-10 w-full max-w-md border-2 border-teal-100">
          <div className="text-center mb-6 md:mb-8">
            <div className="relative mx-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-xl overflow-hidden border-2 border-white">
              <img 
                src="/logo.jpg" 
                alt="KAEDRA" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Lock className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Admin Access</h1>
            <p className="text-sm md:text-base text-gray-600 flex items-center justify-center gap-2">
              Enter password to continue
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
            </p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4 md:mb-6">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-sm md:text-base"
                placeholder="Enter admin password"
                required
              />
              {loginError && (
                <p className="text-red-500 text-xs md:text-sm mt-2 flex items-center gap-1">
                  ❌ {loginError}
                </p>
              )}
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 hover:from-teal-600 hover:via-emerald-600 hover:to-green-600 text-white py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              Access Dashboard ✨
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-600 font-medium">Loading... ✨</p>
        </div>
      </div>
    );
  }

  // Form View (Add/Edit)
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <>
        {managingVariationsFor && (
          <VariationManager
            product={managingVariationsFor}
            onClose={() => setManagingVariationsFor(null)}
          />
        )}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b-2 border-blue-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16 gap-2">
              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={handleCancel}
                  className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 md:gap-2 group"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm md:text-base">Back</span>
                </button>
                <h1 className="text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  {currentView === 'add' ? '✨ Add New' : '✏️ Edit Product'}
                </h1>
              </div>
              <div className="flex space-x-2 md:space-x-3">
                {currentView === 'edit' && editingProduct && (
                  <button
                    type="button"
                    onClick={() => setManagingVariationsFor(editingProduct)}
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all"
                  >
                    <Layers className="h-3 w-3 md:h-4 md:w-4" />
                    Manage Sizes
                  </button>
                )}
                <button onClick={handleCancel} className="px-2 md:px-4 py-1.5 md:py-2 border-2 border-gray-300 hover:border-gray-400 rounded-lg md:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button 
                  onClick={handleSaveProduct} 
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all flex items-center gap-1 md:gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 text-xs md:text-sm"
                >
                  <Save className="h-3 w-3 md:h-4 md:w-4" />
                  {isProcessing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 md:py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 border-2 border-teal-100">
            {/* Basic Information */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <span className="text-xl md:text-2xl">📝</span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field text-sm md:text-base"
                    placeholder="e.g., BPC-157 5mg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Description *</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field text-sm md:text-base"
                    placeholder="Detailed product description..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Category *</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field text-sm md:text-base"
                  >
                    {categories.length === 0 && (
                      <option value="">No categories available</option>
                    )}
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Please add categories first</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Base Price (₱) *</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.base_price || ''}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="input-field text-sm md:text-base"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Scientific Details */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <span className="text-xl md:text-2xl">🧪</span>
                Scientific Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Purity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.purity_percentage || ''}
                    onChange={(e) => setFormData({ ...formData, purity_percentage: Number(e.target.value) })}
                    className="input-field text-sm md:text-base"
                    placeholder="99.0"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Molecular Weight</label>
                  <input
                    type="text"
                    value={formData.molecular_weight || ''}
                    onChange={(e) => setFormData({ ...formData, molecular_weight: e.target.value })}
                    className="input-field text-sm md:text-base"
                    placeholder="e.g., 1419.55 g/mol"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">CAS Number</label>
                  <input
                    type="text"
                    value={formData.cas_number || ''}
                    onChange={(e) => setFormData({ ...formData, cas_number: e.target.value })}
                    className="input-field text-sm md:text-base"
                    placeholder="e.g., 137525-51-0"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Storage Conditions</label>
                  <input
                    type="text"
                    value={formData.storage_conditions || ''}
                    onChange={(e) => setFormData({ ...formData, storage_conditions: e.target.value })}
                    className="input-field text-sm md:text-base"
                    placeholder="Store at -20°C"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Sequence</label>
                  <input
                    type="text"
                    value={formData.sequence || ''}
                    onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                    className="input-field text-sm md:text-base"
                    placeholder="e.g., GEPPPGKPADDAGLV"
                  />
                </div>
              </div>
            </div>

            {/* Complete Set Inclusions */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <span className="text-xl md:text-2xl">📦</span>
                Complete Set Inclusions
                <span className="text-xs font-normal text-gray-600">(Optional)</span>
              </h3>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  What's included in this set? (One item per line)
                </label>
                <textarea
                  value={formData.inclusions?.join('\n') || ''}
                  onChange={(e) => {
                    const items = e.target.value.split('\n').filter(item => item.trim() !== '');
                    setFormData({ ...formData, inclusions: items.length > 0 ? items : null });
                  }}
                  className="input-field text-sm md:text-base min-h-[120px]"
                  placeholder="Example:&#10;1 vial of Tirzepatide 20mg&#10;1 pack of syringes (10pcs)&#10;1 pack of alcohol swabs (10pcs)&#10;Bacteriostatic water 5ml&#10;Storage instructions card&#10;Dosage guide"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                  <span className="text-teal-600 font-bold">💡</span>
                  <span>Enter each item on a new line. These will be displayed as a checklist on the product card. Leave empty if this is not a complete set.</span>
                </p>
              </div>
            </div>

            {/* Inventory */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <span className="text-xl md:text-2xl">📦</span>
                Inventory & Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity || ''}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="input-field text-sm md:text-base"
                    placeholder="0"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 pt-0 sm:pt-7">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 md:w-5 md:h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-xs md:text-sm font-semibold text-gray-700">⭐ Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available ?? true}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-4 h-4 md:w-5 md:h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-xs md:text-sm font-semibold text-gray-700">✅ Available</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Discount */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <span className="text-xl md:text-2xl">💰</span>
                Discount Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Discount Price (₱)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.discount_price || ''}
                    onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) || null })}
                    className="input-field text-sm md:text-base"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center pt-0 md:pt-7">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.discount_active || false}
                      onChange={(e) => setFormData({ ...formData, discount_active: e.target.checked })}
                      className="w-4 h-4 md:w-5 md:h-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-xs md:text-sm font-semibold text-gray-700">🏷️ Enable Discount</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <span className="text-xl md:text-2xl">🖼️</span>
                Product Image
              </h3>
              <ImageUpload
                currentImage={formData.image_url || undefined}
                onImageChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
              />
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Products List View
  if (currentView === 'products') {
    return (
      <>
        {managingVariationsFor && (
          <VariationManager
            product={managingVariationsFor}
            onClose={() => setManagingVariationsFor(null)}
          />
        )}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b-2 border-blue-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 md:gap-2 group"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm md:text-base">Dashboard</span>
                </button>
                <h1 className="text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Products</h1>
              </div>
              <div className="flex items-center gap-2">
                {selectedProducts.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-medium text-xs md:text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Delete ({selectedProducts.size})</span>
                    <span className="sm:hidden">Delete</span>
                  </button>
                )}
                <button
                  onClick={handleAddProduct}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-medium text-xs md:text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-1 md:gap-2"
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Add New</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8">
          {/* Selection Info Banner */}
          {selectedProducts.size > 0 && (
            <div className="mb-4 bg-teal-50 border-2 border-teal-200 rounded-xl p-3 md:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-semibold text-teal-700">
                  {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="text-xs md:text-sm text-teal-600 hover:text-teal-700 font-medium underline"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-teal-100 p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setManagingVariationsFor(product)}
                      disabled={isProcessing}
                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Manage Sizes"
                    >
                      <Layers className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      disabled={isProcessing}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={isProcessing}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-[10px] text-gray-500">Price</div>
                      <div className="text-sm font-bold text-teal-600">
                        ₱{product.base_price.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">Stock</div>
                      <div className="text-sm font-semibold text-gray-900">{product.stock_quantity}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">Sizes</div>
                      <div className="text-sm font-semibold text-purple-600">{product.variations?.length || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {product.featured && (
                      <span className="text-xs">⭐</span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.available ? '✅' : '❌'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border-2 border-teal-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b-2 border-teal-100">
                  <tr>
                    <th className="px-4 py-4 text-center w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 hidden lg:table-cell">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Purity</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 hidden xl:table-cell">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                        {categories.find(cat => cat.id === product.category)?.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-teal-600">
                        ₱{product.base_price.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          {product.purity_percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.stock_quantity}
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <div className="flex flex-col gap-1">
                          {product.featured && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              ⭐ Featured
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            product.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.available ? '✅' : '❌'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setManagingVariationsFor(product)}
                            disabled={isProcessing}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-xl transition-colors"
                            title="Manage Sizes"
                          >
                            <Layers className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            disabled={isProcessing}
                            className="p-2 text-teal-600 hover:bg-teal-100 rounded-xl transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isProcessing}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Categories View
  if (currentView === 'categories') {
    return <CategoryManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Payment Methods View
  if (currentView === 'payments') {
    return <PaymentMethodManager onBack={() => setCurrentView('dashboard')} />;
  }

  // COA Manager View
  if (currentView === 'coa') {
    return <COAManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Dashboard View
  return (
    <>
      {managingVariationsFor && (
        <VariationManager
          product={managingVariationsFor}
          onClose={() => setManagingVariationsFor(null)}
        />
      )}
      
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b-2 border-teal-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-white">
                <img 
                  src="/logo.jpg" 
                  alt="KAEDRA" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-sm md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
                  KAEDRA
                </h1>
                <p className="text-[10px] md:text-xs text-gray-600 font-medium flex items-center gap-1">
                  <Sparkles className="w-2 h-2 md:w-3 md:h-3 text-yellow-500" />
                  Admin Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <a 
                href="/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-xs md:text-sm hidden sm:block"
              >
                View Website
              </a>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all font-medium text-xs md:text-sm shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
          <button
            onClick={() => setCurrentView('products')}
            className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all p-3 md:p-6 border-2 border-teal-100 transform hover:-translate-y-1 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg md:rounded-xl shadow-md">
                <Package className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-[10px] md:text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">{totalProducts}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('products')}
            className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all p-3 md:p-6 border-2 border-green-100 transform hover:-translate-y-1 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg md:rounded-xl shadow-md">
                <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-[10px] md:text-sm font-medium text-gray-600">Available</p>
                <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">{availableProducts}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('products')}
            className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all p-3 md:p-6 border-2 border-purple-100 transform hover:-translate-y-1 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg md:rounded-xl shadow-md">
                <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-[10px] md:text-sm font-medium text-gray-600">Featured</p>
                <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{featuredProducts}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('categories')}
            className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all p-3 md:p-6 border-2 border-pink-100 transform hover:-translate-y-1 text-left cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg md:rounded-xl shadow-md">
                <Users className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-[10px] md:text-sm font-medium text-gray-600">Categories</p>
                <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">{categories.length}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-2 border-teal-100">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              Quick Actions
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            </h3>
            <div className="space-y-1.5 md:space-y-2">
              <button
                onClick={handleAddProduct}
                className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg md:rounded-xl transition-all group"
              >
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-teal-400 to-teal-600 rounded-md md:rounded-lg text-white">
                  <Plus className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-900">Add New Product</span>
              </button>
              <button
                onClick={() => setCurrentView('products')}
                className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg md:rounded-xl transition-all group"
              >
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-md md:rounded-lg text-white">
                  <Package className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-900">Manage Products</span>
              </button>
              <button
                onClick={() => setCurrentView('categories')}
                className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg md:rounded-xl transition-all group"
              >
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-pink-400 to-pink-600 rounded-md md:rounded-lg text-white">
                  <FolderOpen className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-900">Manage Categories</span>
              </button>
              <button
                onClick={() => setCurrentView('payments')}
                className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg md:rounded-xl transition-all group"
              >
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-md md:rounded-lg text-white">
                  <CreditCard className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-900">Payment Methods</span>
              </button>
              <button
                onClick={() => setCurrentView('coa')}
                className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg md:rounded-xl transition-all group"
              >
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md md:rounded-lg text-white">
                  <Shield className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-900">COA Reports</span>
              </button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-2 border-purple-100">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              Categories Overview
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-500 animate-pulse" />
            </h3>
            <div className="space-y-2 md:space-y-3">
              {categoryCounts.map((category, index) => {
                const colors = [
                  'from-teal-400 to-teal-600',
                  'from-emerald-400 to-emerald-600',
                  'from-green-400 to-green-600',
                  'from-green-400 to-green-600',
                  'from-orange-400 to-orange-600',
                  'from-cyan-400 to-cyan-600'
                ];
                return (
                  <div key={category.id} className="flex items-center justify-between py-1.5 md:py-2 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 rounded-lg md:rounded-xl px-2 md:px-3 transition-all">
                    <span className="text-xs md:text-sm font-semibold text-gray-900">{category.name}</span>
                    <span className={`text-[10px] md:text-sm font-bold text-white bg-gradient-to-r ${colors[index % colors.length]} px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-md`}>
                      {category.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
