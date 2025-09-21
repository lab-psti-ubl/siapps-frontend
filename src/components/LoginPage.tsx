import React, { useState, useEffect } from 'react';
import { User, Lock, QrCode, Camera, StopCircle, AlertCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [loginType, setLoginType] = useState<'admin' | 'user'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  
  const { login } = useAuth();

  // Cleanup QR scanner on component unmount or when switching login types
  useEffect(() => {
    return () => {
      if (html5QrCode && isScanning) {
        try {
          if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
            html5QrCode.stop().catch(console.error);
          }
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
      }
    };
  }, [html5QrCode, isScanning]);

  // Stop scanner when switching login types
  useEffect(() => {
    if (loginType === 'admin' && isScanning) {
      stopQRScanning();
    }
  }, [loginType]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login('admin', { username, password });
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const startQRScanning = async () => {
    try {
      setError('');
      
      // Stop any existing scanner first
      if (html5QrCode && isScanning) {
        await html5QrCode.stop();
        setHtml5QrCode(null);
      }

      const qrCodeScanner = new Html5Qrcode("qr-login-reader");
      setHtml5QrCode(qrCodeScanner);
      
      await qrCodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          console.log('QR Code scanned:', decodedText);
          setIsLoading(true);
          
          try {
            await login('user', decodedText);
            await stopQRScanning();
          } catch (error: any) {
            setError(error.message || 'QR Code tidak terdaftar dalam sistem');
            await stopQRScanning();
          } finally {
            setIsLoading(false);
          }
        },
        (errorMessage) => {
          // Handle scan failure silently - this is normal when no QR code is in frame
        }
      );
      
      setIsScanning(true);
    } catch (err: any) {
      console.error('QR Scanner error:', err);
      setError(`Gagal mengakses kamera: ${err.message}`);
      setIsScanning(false);
      setHtml5QrCode(null);
    }
  };

  const stopQRScanning = async () => {
    if (html5QrCode && isScanning) {
      try {
        if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
          await html5QrCode.stop();
          console.log('QR Scanner stopped successfully');
        }
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        setHtml5QrCode(null);
        setIsScanning(false);
      }
    }
  };

  const handleLoginTypeChange = (type: 'admin' | 'user') => {
    if (isScanning) {
      stopQRScanning();
    }
    
    setLoginType(type);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-white/50 p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="text-center mb-8">
          <div className="p-2 sm:p-3 rounded-full bg-blue-500 shadow-lg inline-block mb-3 sm:mb-4">
            <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Sistem Absensi</h1>
          <p className="text-sm sm:text-base text-gray-600">Silakan login untuk melanjutkan</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex mb-4 sm:mb-6 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => handleLoginTypeChange('admin')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-all ${
              loginType === 'admin'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-sm sm:text-base">Admin</span>
          </button>
          <button
            onClick={() => handleLoginTypeChange('user')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-all ${
              loginType === 'user'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-sm sm:text-base">Pegawai</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          </div>
        )}

        {loginType === 'admin' ? (
          <form onSubmit={handleAdminLogin} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  placeholder="Masukkan username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  placeholder="Masukkan password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span className="text-sm sm:text-base">Logging in...</span>
                </div>
              ) : (
                'Login Admin'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center">
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Scan QR Code untuk login sebagai pegawai
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                QR Code harus sudah terdaftar oleh admin
              </p>
              
              {!isScanning ? (
                <button
                  onClick={startQRScanning}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isLoading ? 'Processing...' : 'Mulai Scan QR'}</span>
                </button>
              ) : (
                <button
                  onClick={stopQRScanning}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
                >
                  <StopCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Stop Scan</span>
                </button>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
              <div 
                id="qr-login-reader" 
                className={`w-full ${isScanning ? 'block' : 'hidden'}`}
                style={{ minHeight: '250px' }}
              ></div>
              
              {!isScanning && (
                <div className="p-8 sm:p-12 text-center bg-gray-50">
                  <QrCode className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                  <p className="text-sm sm:text-base text-gray-500 mb-2">
                    Kamera akan muncul di sini
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Pastikan QR Code Anda sudah terdaftar di sistem
                  </p>
                </div>
              )}
            </div>

            {isLoading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-xs sm:text-sm text-gray-600">Memproses login...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;