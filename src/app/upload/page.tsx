'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { formatPoints, formatDate } from '@/lib/utils';
import { 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Trash2,
  Zap,
  Smartphone,
  Award
} from 'lucide-react';
import { Invoice } from '@/types';
import CameraUpload from '@/components/CameraUpload';

const UploadPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<{
    status: 'uploading' | 'processing' | 'completed' | 'error';
    message: string;
    progress: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getInvoices();
      setInvoices(response.results || []);
    } catch (err) {
      setError('Failed to load invoices');
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const updateProcessingStatus = (status: string, message: string, progress: number) => {
    setProcessingStatus({
      status: status as 'uploading' | 'processing' | 'completed' | 'error',
      message,
      progress
    });
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      // Step 1: Uploading
      updateProcessingStatus('uploading', 'Uploading invoice...', 25);
      
      // Step 2: Processing
      updateProcessingStatus('processing', 'Extracting data with AI...', 50);
      
      const invoice = await apiClient.uploadInvoice(file);
      
      // Step 3: Validation and scoring
      updateProcessingStatus('processing', 'Validating and scoring...', 75);
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Completion
      updateProcessingStatus('completed', 'Processing complete!', 100);
      
      // Show success message based on reliability score
      const isAutoApproved = invoice.reliability_score >= 80;
      const pointsMessage = isAutoApproved ? 
        `Great! Your invoice was automatically approved and you've earned points instantly!` :
        `Your invoice has been submitted for review. You'll receive points once it's approved.`;
      
      // Show notification
      setTimeout(() => {
        alert(`Invoice uploaded successfully! ${pointsMessage}`);
        setProcessingStatus(null);
        setShowCamera(false);
        fetchInvoices();
      }, 1500);
      
    } catch (err) {
      console.error('Upload failed:', err);
      updateProcessingStatus('error', 'Upload failed. Please try again.', 0);
      setTimeout(() => {
        setError('Failed to upload invoice. Please try again.');
        setProcessingStatus(null);
      }, 2000);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Processing';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReliabilityBadge = (score: number) => {
    if (score >= 80) {
      return (
        <div className="flex items-center text-green-600">
          <Zap className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Auto-approved</span>
        </div>
      );
    } else if (score >= 60) {
      return (
        <div className="flex items-center text-yellow-600">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Under review</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Needs review</span>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Invoice</h1>
        <p className="text-gray-600">Upload your purchase receipts to earn points instantly</p>
        <div className="mt-4 bg-blue-50 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-700">
              <strong>Pro tip:</strong> Invoices with 80%+ reliability are auto-approved for instant points!
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Invoice</h2>
        
        {/* Processing Status */}
        {processingStatus && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">{processingStatus.message}</span>
              <span className="text-sm text-blue-700">{processingStatus.progress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingStatus.progress}%` }}
              ></div>
            </div>
            {processingStatus.status === 'processing' && (
              <p className="text-xs text-blue-600 mt-2">
                Our AI is reading your invoice and extracting purchase details...
              </p>
            )}
          </div>
        )}

        {/* Upload Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Camera Option */}
          <button
            onClick={() => setShowCamera(true)}
            disabled={uploading}
            className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <div className="text-center">
              <Camera className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="font-medium text-blue-900">Take Photo</p>
              <p className="text-sm text-blue-600">Use your camera</p>
            </div>
          </button>

          {/* File Upload Option */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Choose File</p>
              <p className="text-sm text-gray-600">From your device</p>
            </div>
          </button>
        </div>
        
        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Processing your invoice...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Smartphone className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Or drag and drop your invoice here
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, HEIC files up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Tips for instant approval (80%+ reliability):
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center text-sm text-blue-800">
              <CheckCircle className="h-3 w-3 mr-2" />
              Clear, high-quality image
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <CheckCircle className="h-3 w-3 mr-2" />
              All corners visible
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <CheckCircle className="h-3 w-3 mr-2" />
              Good lighting, avoid shadows
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <CheckCircle className="h-3 w-3 mr-2" />
              Text is readable
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
        
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No invoices uploaded yet</p>
            <p className="text-sm text-gray-500 mt-1">Start earning points by uploading your first invoice!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <div className="font-medium text-gray-900">
                        Invoice #{invoice.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(invoice.created_at)} • {invoice.store_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: ${invoice.total_amount}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                    <div className="mt-1">
                      {getReliabilityBadge(invoice.reliability_score)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Score: {invoice.reliability_score}%
                    </div>
                    {invoice.points_earned && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        +{formatPoints(invoice.points_earned)} points
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraUpload
          onCapture={handleFile}
          onClose={() => setShowCamera(false)}
          isProcessing={uploading}
          processingMessage={processingStatus?.message || 'Processing...'}
        />
      )}
    </div>
  );
};

export default UploadPage; 