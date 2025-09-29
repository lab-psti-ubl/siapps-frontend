import React from 'react';
import { RotateCcw, XCircle, Send } from 'lucide-react';

interface PhotoPreviewProps {
  capturedPhoto: string;
  isSubmitting: boolean;
  isWithinRadius: boolean;
  onRetakePhoto: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitButtonText: string;
}

const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  capturedPhoto,
  isSubmitting,
  isWithinRadius,
  onRetakePhoto,
  onCancel,
  onSubmit,
  submitButtonText
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
      <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 lg:mb-6">Preview Foto Absen Masuk</h3>
      
      <div className="space-y-4 lg:space-y-6">
        <div className="relative bg-gray-100 rounded-xl overflow-hidden border-4 border-green-500">
          <img 
            src={capturedPhoto} 
            alt="Captured" 
            className="w-full h-64 sm:h-80 lg:h-96 object-cover"
          />
          <div className="absolute top-2 lg:top-4 right-2 lg:right-4">
            <span className="bg-green-500 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-medium">
              ✓ Foto berhasil diambil
            </span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onRetakePhoto}
            disabled={isSubmitting}
            className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-colors font-medium disabled:opacity-50 text-sm lg:text-base"
          >
            <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Ambil Ulang</span>
          </button>
          
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-colors font-medium disabled:opacity-50 text-sm lg:text-base"
          >
            <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Batal</span>
          </button>
          
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !isWithinRadius}
            className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 lg:px-8 py-2 lg:py-3 rounded-lg transition-colors font-medium disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white"></div>
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{submitButtonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreview;