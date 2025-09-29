import React from 'react';
import { X } from 'lucide-react';
import QRScanner from '../../QRScanner';

interface ScannerModalProps {
  onScan: (data: any) => void;
  onClose: () => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onScan, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 lg:p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Scan QR Code Absensi</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <QRScanner onScan={onScan} darkMode={false} />
      </div>
    </div>
  );
};

export default ScannerModal;