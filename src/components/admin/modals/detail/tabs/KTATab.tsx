import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { Employee } from '../../../types';
import { generateEmployeeKTA } from '../../../../../utils/ktaUtils';
import KTAPreview from '../components/KTAPreview';

interface KTATabProps {
  employee: Employee;
  isGeneratingKTA: boolean;
  onGenerateKTA: (generating: boolean) => void;
}

const KTATab: React.FC<KTATabProps> = ({
  employee,
  isGeneratingKTA,
  onGenerateKTA
}) => {
  const handleDownloadKTA = async () => {
    onGenerateKTA(true);
    try {
      await generateEmployeeKTA(employee);
    } catch (error) {
      console.error('Error generating KTA:', error);
      alert('Terjadi kesalahan saat membuat KTA. Silakan coba lagi.');
    } finally {
      onGenerateKTA(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-2xl font-bold text-gray-800 mb-2">Preview Kartu Tanda Anggota</h4>
        <p className="text-gray-600">Pratinjau KTA yang akan diunduh</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
        <KTAPreview employee={employee} side="front" />
        <KTAPreview employee={employee} side="back" />
      </div>

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={handleDownloadKTA}
          disabled={isGeneratingKTA}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 lg:px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-base lg:text-lg font-semibold min-h-[44px]"
        >
          {isGeneratingKTA ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Membuat KTA...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download KTA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default KTATab;