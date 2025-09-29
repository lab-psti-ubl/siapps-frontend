import React, { useState } from 'react';
import { X, FileText, User, Calendar, MessageSquare, Check, XCircle, Clock } from 'lucide-react';
import { LeaveRequest } from '../types';

interface LeaveRequestModalProps {
  leaveRequest: LeaveRequest;
  onApprove: (notes?: string) => void;
  onReject: (notes?: string) => void;
  onClose: () => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  leaveRequest,
  onApprove,
  onReject,
  onClose
}) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  };

  const formatDateTimeForPDF = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date for PDF:', error);
      return 'Tanggal tidak valid';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Persetujuan';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(reviewNotes);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(reviewNotes);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate PDF-like content
  const generatePDFContent = () => {
    return `
      SURAT PENGAJUAN IZIN
      
      Kepada Yth.
      HRD/Manager
      
      Dengan hormat,
      
      Yang bertanda tangan di bawah ini:
      
      Nama: ${leaveRequest.employeeName}
      ID Pegawai: ${leaveRequest.employeeId}
      
      Dengan ini mengajukan permohonan izin tidak masuk kerja dengan rincian sebagai berikut:
      
      Tanggal Mulai: ${formatDate(leaveRequest.startDate)}
      Tanggal Selesai: ${formatDate(leaveRequest.endDate)}
      Jumlah Hari: ${leaveRequest.days} hari
      
      Alasan:
      ${leaveRequest.reason}
      
      Demikian surat permohonan ini saya buat dengan sebenar-benarnya. Atas perhatian dan persetujuan Bapak/Ibu, saya ucapkan terima kasih.
      
      Diajukan pada: ${formatDateTime(leaveRequest.submittedAt)}
      
      Hormat saya,
      ${leaveRequest.employeeName}
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-800">Surat Pengajuan Izin</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(leaveRequest.status)}`}>
                {getStatusText(leaveRequest.status)}
              </span>
              <span className="text-sm text-gray-500">
                ID: {leaveRequest.id}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Diajukan: {formatDateTime(leaveRequest.submittedAt)}
            </div>
          </div>

          {/* PDF Preview */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 lg:p-8 shadow-inner">
            <div className="max-w-2xl mx-auto space-y-4 lg:space-y-6 font-mono text-xs lg:text-sm leading-relaxed">
              <div className="text-center">
                <h2 className="text-base lg:text-lg font-bold mb-4">SURAT PENGAJUAN IZIN</h2>
              </div>

              <div>
                <p>Kepada Yth.</p>
                <p>HRD/Manager</p>
              </div>

              <div>
                <p>Dengan hormat,</p>
              </div>

              <div>
                <p>Yang bertanda tangan di bawah ini:</p>
                <br />
                <p><strong>Nama:</strong> {leaveRequest.employeeName}</p>
                <p><strong>ID Pegawai:</strong> {leaveRequest.employeeId}</p>
              </div>

              <div>
                <p>Dengan ini mengajukan permohonan izin tidak masuk kerja dengan rincian sebagai berikut:</p>
                <br />
                <p><strong>Tanggal Mulai:</strong> {formatDate(leaveRequest.startDate)}</p>
                <p><strong>Tanggal Selesai:</strong> {formatDate(leaveRequest.endDate)}</p>
                <p><strong>Jumlah Hari:</strong> {leaveRequest.days} hari</p>
              </div>

              <div>
                <p><strong>Alasan:</strong></p>
                <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500 mt-2">
                  <p className="whitespace-pre-wrap">{leaveRequest.reason}</p>
                </div>
              </div>

              <div>
                <p>Demikian surat permohonan ini saya buat dengan sebenar-benarnya. Atas perhatian dan persetujuan Bapak/Ibu, saya ucapkan terima kasih.</p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p><strong>Diajukan pada:</strong></p>
                  <p>{formatDateTimeForPDF(leaveRequest.submittedAt)}</p>
                </div>
                <div className="text-right">
                  <p>Hormat saya,</p>
                  <br />
                  <br />
                  <p><strong>{leaveRequest.employeeName}</strong></p>
                </div>
              </div>

              {/* Review Section */}
              {leaveRequest.reviewedAt && (
                <div className="border-t-2 border-gray-300 pt-6 mt-8">
                  <div className="bg-gray-50 p-4 rounded">
                    <p><strong>Status Review:</strong> {getStatusText(leaveRequest.status)}</p>
                    <p><strong>Direview oleh:</strong> {leaveRequest.reviewedBy}</p>
                    <p><strong>Tanggal Review:</strong> {formatDateTimeForPDF(leaveRequest.reviewedAt!)}</p>
                    {leaveRequest.reviewNotes && (
                      <>
                        <p><strong>Catatan:</strong></p>
                        <p className="whitespace-pre-wrap">{leaveRequest.reviewNotes}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Section for Pending Requests */}
          {leaveRequest.status === 'pending' && (
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Review Pengajuan</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Review (Opsional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Tambahkan catatan untuk pengajuan ini..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[44px]"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Setujui Izin</span>
                  </button>
                  
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[44px]"
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>Tolak Izin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Already Reviewed */}
          {leaveRequest.status !== 'pending' && (
            <div className={`rounded-lg p-6 border ${getStatusColor(leaveRequest.status)}`}>
              <div className="flex items-center space-x-3 mb-3">
                {leaveRequest.status === 'approved' ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <h4 className="text-lg font-bold">
                  Pengajuan {leaveRequest.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Direview oleh:</strong> {leaveRequest.reviewedBy}</p>
                <p><strong>Tanggal Review:</strong> {formatDateTimeForPDF(leaveRequest.reviewedAt!)}</p>
                {leaveRequest.reviewNotes && (
                  <div>
                    <p><strong>Catatan:</strong></p>
                    <p className="whitespace-pre-wrap bg-white p-3 rounded border mt-1">
                      {leaveRequest.reviewNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors min-h-[44px]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestModal;