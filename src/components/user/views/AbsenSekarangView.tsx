import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  X, 
  Calendar,
  User,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { User as UserType } from '../../../types/auth';
import { LeaveRequest } from '../types';
import { leaveRequestsAPI } from '../../../services/api';
import { getCurrentDateTimeJakarta, getCurrentDateJakarta } from '../../../utils/attendanceUtils';

interface AbsenSekarangViewProps {
  currentUser: UserType;
  onLeaveRequestSubmit: (leaveRequest: Omit<LeaveRequest, 'id' | 'submittedAt'>) => void;
  onBackToDashboard: () => void;
}

const AbsenSekarangView: React.FC<AbsenSekarangViewProps> = ({
  currentUser,
  onLeaveRequestSubmit,
  onBackToDashboard
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    startDate: '',
    endDate: '',
    days: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 1;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays > 0 ? diffDays : 1;
  };

  const handleStartDateChange = (date: string) => {
    setFormData(prev => {
      const newData = { ...prev, startDate: date };
      if (date && prev.endDate) {
        newData.days = calculateDays(date, prev.endDate);
      } else if (date && !prev.endDate) {
        newData.endDate = date;
        newData.days = 1;
      }
      return newData;
    });
  };

  const handleEndDateChange = (date: string) => {
    setFormData(prev => {
      const newData = { ...prev, endDate: date };
      if (prev.startDate && date) {
        newData.days = calculateDays(prev.startDate, date);
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      alert('Silakan isi alasan izin');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      alert('Silakan pilih tanggal mulai dan selesai izin');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai');
      return;
    }

    if (formData.reason.trim().length < 10) {
      alert('Alasan izin minimal 10 karakter');
      return;
    }

    setIsSubmitting(true);

    try {
      const leaveRequest: Omit<LeaveRequest, 'id' | 'submittedAt'> = {
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        reason: formData.reason.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: formData.days,
        status: 'pending',
        submittedAt: getCurrentDateTimeJakarta() // Use Jakarta timezone
      };

      console.log('Submitting leave request from form:', leaveRequest);

      // Call the parent component's submit handler
      await onLeaveRequestSubmit(leaveRequest);
      
      // Reset form
      setFormData({
        reason: '',
        startDate: '',
        endDate: '',
        days: 1
      });
      
    } catch (error) {
      console.error('Error submitting leave request:', error);
      // Don't show alert here, let parent component handle the notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      reason: '',
      startDate: '',
      endDate: '',
      days: 1
    });
    onBackToDashboard();
  };

  // Get today's date for min date validation
  const today = getCurrentDateJakarta();

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Ajukan Izin</h1>
            <p className="text-sm lg:text-base text-gray-600">Kirim pengajuan izin kepada admin</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold text-gray-800">Form Pengajuan Izin</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Info - Read Only */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Pegawai
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={currentUser.name}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Pegawai
              </label>
              <input
                type="text"
                value={currentUser.id}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Selesai
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={formData.startDate || today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Hari
              </label>
              <input
                type="number"
                value={formData.days}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Izin
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Jelaskan alasan pengajuan izin Anda..."
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimal 10 karakter, maksimal 500 karakter
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Informasi Pengajuan Izin</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Pengajuan izin harus diajukan minimal 1 hari sebelumnya</li>
                  <li>• Status pengajuan akan diupdate oleh admin</li>
                  <li>• Anda akan mendapat notifikasi setelah pengajuan diproses</li>
                  <li>• Pastikan alasan izin jelas dan dapat dipertanggungjawabkan</li>
                  <li>• Jika izin ditolak, Anda dapat melakukan absensi normal</li>
                  <li>• Tidak dapat mengajukan izin untuk tanggal yang sudah memiliki pengajuan aktif</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Batal</span>
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !formData.reason.trim() || !formData.startDate || !formData.endDate}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pengajuan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AbsenSekarangView;