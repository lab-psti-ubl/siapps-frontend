import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SalaryRecord } from '../components/admin/types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface SalaryExportOptions {
  title: string;
  period: string;
  data: SalaryRecord[];
  formatCurrency: (amount: number) => string;
}

export function generateSalaryExportPDF(options: SalaryExportOptions): void {
  const { title, period, data, formatCurrency } = options;
  
  // Create new PDF document in landscape mode for better table fit
  const doc = new jsPDF('landscape');
  
  // Set font
  doc.setFont('helvetica');
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN GAJI PEGAWAI', 148, 20, { align: 'center' });
  
  // Add period
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${period}`, 148, 30, { align: 'center' });
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 148, 40, { align: 'center' });
  
  // Calculate summary statistics
  const totalEmployees = data.length;
  const totalBasicSalary = data.reduce((sum, salary) => sum + salary.basicSalary, 0);
  const totalDeductions = data.reduce((sum, salary) => sum + salary.deductions.total, 0);
  const totalNetSalary = data.reduce((sum, salary) => sum + salary.totalSalary, 0);
  
  
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add detail table title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Gaji Pegawai', 20, 50);
  
  // Prepare table data
  const tableData = data.map((salary, index) => [
    (index + 1).toString(),
    salary.employeeName,
    salary.period,
    formatCurrencyForPDF(salary.basicSalary),
    `${salary.attendedDays}/${salary.workingDays}`,
    salary.absentDays.toString(),
    salary.leaveDays.toString(),
    `${salary.lateCount}x`,
    `${salary.earlyLeaveCount}x`,
    formatCurrencyForPDF(salary.deductions.total),
    formatCurrencyForPDF(salary.totalSalary),
    getStatusTextForPDF(salary.status)
  ]);
  
  // Add table
  doc.autoTable({
    startY: 60,
    head: [[
      'No', 
      'Nama Pegawai', 
      'Periode', 
      'Gaji Pokok', 
      'Kehadiran',
      'Tidak Hadir', 
      'Izin', 
      'Terlambat', 
      'Pulang Cepat',
      'Total Potongan', 
      'Gaji Bersih',
      'Status'
    ]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // light gray
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' }, // No
      1: { cellWidth: 35 }, // Name
      2: { cellWidth: 20 }, // Period
      3: { cellWidth: 25, halign: 'right' }, // Basic Salary
      4: { cellWidth: 20, halign: 'center' }, // Attendance
      5: { cellWidth: 15, halign: 'center' }, // Absent
      6: { cellWidth: 15, halign: 'center' }, // Leave
      7: { cellWidth: 18, halign: 'center' }, // Late
      8: { cellWidth: 18, halign: 'center' }, // Early Leave
      9: { cellWidth: 25, halign: 'right' }, // Deductions
      10: { cellWidth: 25, halign: 'right' }, // Net Salary
      11: { cellWidth: 20, halign: 'center' }, // Status
    },
    margin: { left: 20, right: 20 },
  });
  
  // Add footer with summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan:', 20, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`• Total ${totalEmployees} pegawai`, 20, finalY + 8);
  doc.text(`• Total Gaji Pokok: ${formatCurrencyForPDF(totalBasicSalary)}`, 20, finalY + 16);
  doc.text(`• Total Potongan: ${formatCurrencyForPDF(totalDeductions)}`, 20, finalY + 24);
  doc.text(`• Total Gaji Bersih: ${formatCurrencyForPDF(totalNetSalary)}`, 20, finalY + 32);
  
  
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Sistem Manajemen Gaji - ${new Date().getFullYear()}`,
      20,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }
  
  // Generate filename
  const filename = `Laporan-Gaji-${period.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Save the PDF
  doc.save(filename);
}

function formatCurrencyForPDF(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function getStatusTextForPDF(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'finalized':
      return 'Finalisasi';
    case 'paid':
      return 'Dibayar';
    default:
      return status;
  }
}