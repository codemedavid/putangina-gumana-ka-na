import React, { useState } from 'react';
import { Shield, CheckCircle, ExternalLink, X, ZoomIn, ZoomOut, FileText, Calendar, FlaskConical, Award } from 'lucide-react';
import { useCOA } from '../hooks/useCOA';
import Header from './Header';
import Footer from './Footer';

const COAPage: React.FC = () => {
  const { reports, loading } = useCOA();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);

  // Filter only active reports
  const activeReports = reports.filter(r => r.active);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageZoom(1);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageZoom(1);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      <Header 
        cartItemsCount={0}
        onCartClick={() => {}}
        onMenuClick={() => window.location.href = '/'}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 md:w-16 md:h-16" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Certificate of Analysis</h1>
          </div>
          <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto">
            Verified lab test reports from Janoshik. Every batch is tested for purity and quality.
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-teal-100 text-center">
            <Award className="w-12 h-12 text-teal-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Janoshik Verified</h3>
            <p className="text-sm text-gray-600">All reports from certified laboratories</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-emerald-100 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">99%+ Purity</h3>
            <p className="text-sm text-gray-600">Highest quality standards maintained</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-green-100 text-center">
            <FlaskConical className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Batch Tested</h3>
            <p className="text-sm text-gray-600">Every batch independently verified</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lab reports...</p>
          </div>
        )}

        {/* Reports Grid */}
        {!loading && activeReports.length === 0 && (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-teal-100">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-600">Check back soon for new lab test reports.</p>
          </div>
        )}

        {!loading && activeReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {activeReports.map((report) => (
              <div
                key={report.id}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border-2 transition-all hover:shadow-2xl hover:scale-105 ${
                  report.featured ? 'border-teal-400 ring-4 ring-teal-200' : 'border-teal-100'
                }`}
              >
                {/* Featured Badge */}
                {report.featured && (
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 text-center">
                    <span className="text-sm font-bold flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" />
                      Featured Report
                    </span>
                  </div>
                )}

                {/* Report Image */}
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => handleImageClick(report.report_image_url)}
                >
                  <img
                    src={report.report_image_url}
                    alt={`COA Report for ${report.product_name}`}
                    className="w-full h-64 object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Report Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{report.product_name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FlaskConical className="w-4 h-4 text-teal-600" />
                      <span className="text-gray-600">Purity:</span>
                      <span className="font-bold text-teal-600">{report.purity_percentage}%</span>
                    </div>
                    
                    {report.quantity_mg && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold text-gray-900">{report.quantity_mg}mg</span>
                      </div>
                    )}
                    
                    {report.batch_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Batch:</span>
                        <span className="font-semibold text-gray-900">{report.batch_number}</span>
                      </div>
                    )}
                    
                    {report.test_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Test Date:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(report.test_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">Lab:</span>
                      <span className="font-semibold text-gray-900">{report.lab_name}</span>
                    </div>
                  </div>

                  {/* Verification Link */}
                  {report.verification_url && (
                    <a
                      href={report.verification_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg mt-4"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Verify Report
                    </a>
                  )}

                  {report.verification_key && !report.verification_url && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Verification Key:</p>
                      <p className="text-sm font-mono font-bold text-gray-900">{report.verification_key}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="flex items-center gap-4 mb-4 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white text-sm font-medium">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            <img
              src={selectedImage}
              alt="COA Report"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              style={{ transform: `scale(${imageZoom})` }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default COAPage;

