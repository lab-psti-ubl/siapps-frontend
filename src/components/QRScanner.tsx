import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, StopCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { QRHistoryItem } from '../App';

interface QRScannerProps {
  onScan: (item: Omit<QRHistoryItem, 'id' | 'timestamp'>) => void;
  darkMode: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, darkMode }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const html5QrCode = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      }
    }).catch(err => {
      console.error("Error getting cameras:", err);
      setError("Could not access cameras. Please ensure camera permissions are granted.");
    });

    return () => {
      if (html5QrCode.current && isScanning) {
        try {
          if (html5QrCode.current.getState() === Html5QrcodeScannerState.SCANNING) {
            html5QrCode.current.stop().catch(console.error);
          }
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    try {
      setError('');
      setScannedResult('');
      
      if (html5QrCode.current) {
        try {
          if (html5QrCode.current.getState() === Html5QrcodeScannerState.SCANNING) {
            await html5QrCode.current.stop();
          }
        } catch (err) {
          console.log("Scanner was not running, proceeding...");
        }
      }
      
      html5QrCode.current = new Html5Qrcode("qr-reader");
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      await html5QrCode.current.start(
        selectedCamera || { facingMode: "environment" },
        config,
        (decodedText) => {
          setScannedResult(decodedText);
          onScan({
            type: 'scanned',
            content: decodedText,
          });
          // Auto stop scanner after successful scan
          stopScanning();
        },
        (errorMessage) => {
          // Handle scan failure, usually means no QR code in frame
          // Don't show error for this as it's normal behavior
        }
      );
      
      setIsScanning(true);
    } catch (err: any) {
      setError(`Camera access failed: ${err.message || 'Unknown error'}`);
      setIsScanning(false);
      console.error("Scanner error:", err);
    }
  };

  const stopScanning = async () => {
    if (html5QrCode.current && isScanning) {
      try {
        // Check if scanner is actually running before attempting to stop
        if (html5QrCode.current.getState() === Html5QrcodeScannerState.SCANNING) {
          await html5QrCode.current.stop();
          console.log('QR Scanner stopped successfully');
        }
        html5QrCode.current = null;
        setIsScanning(false);
      } catch (err: any) {
        console.error("Error stopping scanner:", err);
        setIsScanning(false);
        html5QrCode.current = null;
      }
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Scan QR Code
        </h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Use your camera to scan QR codes
        </p>
      </div>

      {cameras.length > 1 && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Select Camera
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            disabled={isScanning}
            className={`w-full px-4 py-2 rounded-lg border-2 transition-colors ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="text-center space-y-4">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              darkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <Camera className="w-5 h-5" />
            <span>Start Scanning</span>
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              darkMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <StopCircle className="w-5 h-5" />
            <span>Stop Scanning</span>
          </button>
        )}
      </div>

      {error && (
        <div className={`p-4 rounded-lg border-l-4 ${
          darkMode
            ? 'bg-red-900/30 border-red-500 text-red-300'
            : 'bg-red-50 border-red-500 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Camera Preview Container */}
      <div className={`border-2 border-dashed rounded-xl overflow-hidden ${
        darkMode ? 'border-gray-600' : 'border-gray-300'
      }`}>
        <div 
          id="qr-reader" 
          className={`w-full ${isScanning ? 'block' : 'hidden'}`}
          style={{ 
            minHeight: '300px',
            background: darkMode ? '#374151' : '#f9fafb'
          }}
        ></div>
        
        {!isScanning && (
          <div className={`p-12 text-center ${
            darkMode ? 'bg-gray-700/30' : 'bg-gray-50'
          }`}>
            <Camera className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Camera preview will appear here
            </p>
            <p className={`text-sm mt-2 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Click "Start Scanning" to begin
            </p>
          </div>
        )}
      </div>

      {scannedResult && (
        <div className={`p-6 rounded-xl border-2 animate-fade-in ${
          darkMode
            ? 'bg-green-900/30 border-green-600'
            : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className={`w-5 h-5 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`} />
            <span className={`font-medium ${
              darkMode ? 'text-green-300' : 'text-green-700'
            }`}>
              QR Code Scanned Successfully!
            </span>
          </div>
          
          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } border`}>
            <p className={`font-mono text-sm break-all ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {scannedResult}
            </p>
          </div>
          
          {isValidUrl(scannedResult) && (
            <div className="mt-3">
              <a
                href={scannedResult}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } shadow-md hover:shadow-lg transform hover:scale-105`}
              >
                <span>Open Link</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRScanner;