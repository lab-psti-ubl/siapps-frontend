import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, CheckCircle } from 'lucide-react';
import { QRHistoryItem } from '../App';

interface QRGeneratorProps {
  onGenerate: (item: Omit<QRHistoryItem, 'id' | 'timestamp'>) => void;
  darkMode: boolean;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ onGenerate, darkMode }) => {
  const [inputText, setInputText] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (inputText.trim()) {
      setQrValue(inputText.trim());
      onGenerate({
        type: 'generated',
        content: inputText.trim(),
      });
    }
  };

  const handleDownload = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = 512;
        canvas.height = 512;
        
        img.onload = () => {
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL();
            link.click();
          }
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          Generate QR Code
        </h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Enter text or URL to generate a QR code
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Text or URL
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text, URL, or any content..."
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors resize-none ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
          {inputText && isValidUrl(inputText) && (
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              ✓ Valid URL detected
            </p>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!inputText.trim()}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
            inputText.trim()
              ? darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
              : darkMode
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } transform hover:scale-105`}
        >
          Generate QR Code
        </button>
      </div>

      {qrValue && (
        <div className={`border-2 border-dashed p-6 rounded-xl text-center space-y-4 ${
          darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'
        }`}>
          <div ref={qrRef} className="inline-block p-4 bg-white rounded-lg shadow-md">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="M"
              includeMargin={true}
              className="block"
            />
          </div>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleDownload}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                darkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } shadow-md hover:shadow-lg transform hover:scale-105`}
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                copied
                  ? darkMode
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white'
                  : darkMode
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
              } shadow-md hover:shadow-lg transform hover:scale-105`}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
          
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {qrValue.length > 50 ? `${qrValue.substring(0, 50)}...` : qrValue}
          </p>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;