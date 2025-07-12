'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Upload, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface CameraUploadProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isProcessing: boolean;
  processingMessage?: string;
}

const CameraUpload: React.FC<CameraUploadProps> = ({
  onCapture,
  onClose,
  isProcessing,
  processingMessage = 'Processing...'
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [facingMode, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `invoice-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(blob);
        setCapturedImage(previewUrl);
        
        // Stop camera
        stopCamera();
        
        // Call parent handler
        onCapture(file);
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera, onCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user');
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when component mounts
  React.useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Update camera when facing mode changes
  React.useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Capture Invoice</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black">
          {error ? (
            <div className="aspect-video flex items-center justify-center bg-red-50">
              <div className="text-center p-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={startCamera}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="aspect-video relative">
              <img
                src={capturedImage}
                alt="Captured invoice"
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">{processingMessage}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed rounded-lg w-64 h-40 flex items-center justify-center">
                  <span className="text-white text-sm">Position invoice here</span>
                </div>
              </div>

              {/* Camera controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <button
                  onClick={switchCamera}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                
                <button
                  onClick={captureImage}
                  className="bg-white text-black p-3 rounded-full hover:bg-gray-100"
                >
                  <Camera className="h-6 w-6" />
                </button>
                
                <div className="w-8 h-8" /> {/* Spacer */}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t">
          {capturedImage ? (
            <div className="flex space-x-2">
              <button
                onClick={retakePhoto}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Retake
              </button>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Done'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Position your invoice in the frame and tap the camera button
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Good lighting
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All corners visible
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Clear text
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraUpload; 