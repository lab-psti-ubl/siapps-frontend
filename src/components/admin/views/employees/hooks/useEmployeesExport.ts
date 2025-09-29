import { useState } from 'react';
import { Employee } from '../../../types';

export const useEmployeesExport = (
  filteredEmployees: Employee[],
  searchTerm: string,
  filterPosition: string
) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      // For now, we'll use the existing PDF generation
      // In a full implementation, you might want to create a backend endpoint for PDF generation
      const { generateEmployeesPDF } = await import('../../../../../utils/pdfUtils');
      
      generateEmployeesPDF({
        title: 'Daftar Pegawai',
        data: filteredEmployees,
        searchTerm,
        filterPosition
      });

      // Show success notification
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    showNotification,
    setShowNotification,
    handleExportPDF
  };
};