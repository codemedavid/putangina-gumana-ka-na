import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, FileText, Award, Shield } from 'lucide-react';
import type { COAReport } from '../types';
import { useCOA } from '../hooks/useCOA';
import ImageUpload from './ImageUpload';

interface COAManagerProps {
  onBack: () => void;
}

const COAManager: React.FC<COAManagerProps> = ({ onBack }) => {
  const { reports, loading, addReport, updateReport, deleteReport } = useCOA();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState<Partial<COAReport>>({
    product_name: '',
    batch_number: '',
    quantity_mg: null,
    purity_percentage: 99.0,
    verification_key: '',
    verification_url: '',
    report_image_url: '',
    lab_name: 'Janoshik',
    test_date: null,
    featured: false,
    sort_order: 0,
    active: true
  });

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      product_name: '',
      batch_number: '',
      quantity_mg: null,
      purity_percentage: 99.0,
      verification_key: '',
      verification_url: '',
      report_image_url: '',
      lab_name: 'Janoshik',
      test_date: null,
      featured: false,
      sort_order: 0,
      active: true
    });
  };

  const handleEdit = (report: COAReport) => {
    setEditingId(report.id);
    setIsAdding(false);
    setFormData(report);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      product_name: '',
      batch_number: '',
      quantity_mg: null,
      purity_percentage: 99.0,
      verification_key: '',
      verification_url: '',
      report_image_url: '',
      lab_name: 'Janoshik',
      test_date: null,
      featured: false,
      sort_order: 0,
      active: true
    });
  };

  const handleSave = async () => {
    if (!formData.product_name || !formData.report_image_url || !formData.purity_percentage) {
      alert('Please fill in all required fields (Product Name, Report Image, Purity)');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Clean up the data
      const cleanedData = {
        ...formData,
        batch_number: formData.batch_number || null,
        quantity_mg: formData.quantity_mg || null,
        verification_key: formData.verification_key || null,
        verification_url: formData.verification_url || null,
        test_date: formData.test_date || null,
      };

      if (editingId) {
        const { id, created_at, updated_at, ...updateData } = cleanedData as any;
        const result = await updateReport(editingId, updateData);
        if (!result.success) {
          throw new Error(result.error);
        }
      } else {
        const { id, created_at, updated_at, ...createData } = cleanedData as any;
        const result = await addReport(createData as Omit<COAReport, 'id' | 'created_at' | 'updated_at'>);
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      handleCancel();
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Delete COA report for ${productName}? This cannot be undone.`)) return;

    try {
      setIsProcessing(true);
      const result = await deleteReport(id);
      if (!result.success) {
        alert(result.error || 'Failed to delete report');
      }
    } catch (error) {
      alert('Failed to delete report');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading COA reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 md:gap-2 group"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm md:text-base">Dashboard</span>
              </button>
              <h1 className="text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                <Shield className="w-5 h-5 md:w-6 md:h-6" />
                COA Reports Manager
              </h1>
            </div>
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-medium text-xs md:text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-1 md:gap-2"
            >
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Add Report</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 lg:p-8 mb-6 border-2 border-teal-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
              {editingId ? 'Edit COA Report' : 'Add New COA Report'}
            </h2>

            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.product_name || ''}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., BPC-157"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batch_number || ''}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    className="input-field"
                    placeholder="e.g., BPC-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantity_mg || ''}
                    onChange={(e) => setFormData({ ...formData, quantity_mg: e.target.value ? parseFloat(e.target.value) : null })}
                    className="input-field"
                    placeholder="e.g., 5.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Purity (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purity_percentage || ''}
                    onChange={(e) => setFormData({ ...formData, purity_percentage: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="99.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Key</label>
                  <input
                    type="text"
                    value={formData.verification_key || ''}
                    onChange={(e) => setFormData({ ...formData, verification_key: e.target.value })}
                    className="input-field"
                    placeholder="e.g., JAN-12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Verification URL</label>
                  <input
                    type="url"
                    value={formData.verification_url || ''}
                    onChange={(e) => setFormData({ ...formData, verification_url: e.target.value })}
                    className="input-field"
                    placeholder="https://janoshik.com/verify/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lab Name</label>
                  <input
                    type="text"
                    value={formData.lab_name || 'Janoshik'}
                    onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                    className="input-field"
                    placeholder="Janoshik"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Test Date</label>
                  <input
                    type="date"
                    value={formData.test_date || ''}
                    onChange={(e) => setFormData({ ...formData, test_date: e.target.value || null })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Report Image URL *</label>
                  <ImageUpload
                    currentImage={formData.report_image_url || undefined}
                    onImageChange={(imageUrl) => setFormData({ ...formData, report_image_url: imageUrl })}
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Featured
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active ?? true}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">✅ Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isProcessing ? 'Saving...' : 'Save Report'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border-2 border-teal-100">
          <div className="p-4 md:p-6 border-b-2 border-teal-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
              COA Reports ({reports.length})
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No COA reports yet</p>
              <p className="text-sm text-gray-500 mt-2">Click "Add Report" to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b-2 border-teal-100">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-800">Product</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-800 hidden md:table-cell">Purity</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-800 hidden lg:table-cell">Batch</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-800 hidden xl:table-cell">Lab</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-800">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {report.featured && <Award className="w-4 h-4 text-yellow-500" />}
                          <div>
                            <div className="font-semibold text-gray-900">{report.product_name}</div>
                            {report.quantity_mg && (
                              <div className="text-xs text-gray-500">{report.quantity_mg}mg</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-teal-600 hidden md:table-cell">
                        {report.purity_percentage}%
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                        {report.batch_number || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden xl:table-cell">
                        {report.lab_name}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          {report.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              ⭐ Featured
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            report.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {report.active ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(report)}
                            disabled={isProcessing}
                            className="p-2 text-teal-600 hover:bg-teal-100 rounded-xl transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(report.id, report.product_name)}
                            disabled={isProcessing}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default COAManager;

