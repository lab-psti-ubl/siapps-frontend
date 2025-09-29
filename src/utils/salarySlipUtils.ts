import jsPDF from 'jspdf';
import { SalaryRecord, SalarySettings } from '../components/admin/types';

export interface SalarySlipOptions {
  salary: SalaryRecord;
  settings: SalarySettings | null;
  formatCurrency: (amount: number) => string;
}

export async function generateSalarySlipPDF(
  salary: SalaryRecord,
  settings: SalarySettings | null,
  formatCurrency: (amount: number) => string
): Promise<void> {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Company Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PT. PERTAMINA', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Jl. Medan Merdeka Timur No. 1A, Jakarta Pusat', 105, 30, { align: 'center' });
  doc.text('Telp: (021) 3815111 | Email: info@pertamina.com', 105, 38, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SLIP GAJI PEGAWAI', 105, 55, { align: 'center' });
  
  // Period
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${formatPeriodForSlip(salary.period)}`, 105, 65, { align: 'center' });
  
  // Status Badge - Add status information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const statusText = getStatusText(salary.status);
  const statusColor = getStatusColor(salary.status);
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(`STATUS: ${statusText.toUpperCase()}`, 105, 75, { align: 'center' });
  doc.setTextColor(0, 0, 0); // Reset to black
  
  // Employee Information Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI PEGAWAI', 20, 85);
  
  doc.setFont('helvetica', 'normal');
  const employeeInfoY = 95;
  const lineHeight = 8;
  
  doc.text('Nama Pegawai', 20, employeeInfoY);
  doc.text(`: ${salary.employeeName}`, 70, employeeInfoY);
  
  doc.text('ID Pegawai', 20, employeeInfoY + lineHeight);
  doc.text(`: ${salary.employeeId}`, 70, employeeInfoY + lineHeight);
  
  doc.text('Periode Gaji', 20, employeeInfoY + lineHeight * 2);
  doc.text(`: ${formatDate(salary.periodStart)} s/d ${formatDate(salary.periodEnd)}`, 70, employeeInfoY + lineHeight * 2);
  
  doc.text('Tanggal Cetak', 20, employeeInfoY + lineHeight * 3);
  doc.text(`: ${new Date().toLocaleDateString('id-ID')}`, 70, employeeInfoY + lineHeight * 3);
  
  // Attendance Summary Section
  const attendanceY = 130;
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN KEHADIRAN', 20, attendanceY);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Total Hari Kerja', 20, attendanceY + 10);
  doc.text(`: ${salary.workingDays} hari`, 70, attendanceY + 10);
  
  doc.text('Hari Hadir', 20, attendanceY + 18);
  doc.text(`: ${salary.presentDays || salary.attendedDays - salary.leaveDays} hari`, 70, attendanceY + 18);
  
  doc.text('Hari Izin', 20, attendanceY + 26);
  doc.text(`: ${salary.leaveDays} hari`, 70, attendanceY + 26);
  
  doc.text('Hari Tidak Hadir', 20, attendanceY + 34);
  doc.text(`: ${salary.absentDays} hari`, 70, attendanceY + 34);
  
  doc.text('Jumlah Terlambat', 20, attendanceY + 42);
  doc.text(`: ${salary.lateCount} kali (${salary.lateMinutes} menit)`, 70, attendanceY + 42);
  
  doc.text('Jumlah Pulang Cepat', 20, attendanceY + 50);
  doc.text(`: ${salary.earlyLeaveCount} kali (${salary.earlyLeaveMinutes} menit)`, 70, attendanceY + 50);
  
  // Salary Calculation Section
  const salaryY = 190;
  doc.setFont('helvetica', 'bold');
  doc.text('PERHITUNGAN GAJI', 20, salaryY);
  
  // Create table for salary calculation with proper deduction details
  const tableData = [
    ['Gaji Pokok', '', formatCurrency(salary.basicSalary)],
    ['', '', ''],
    ['POTONGAN:', '', ''],
    [
      'Tidak Hadir', 
      `${salary.absentDays} hari × ${settings ? formatCurrency(settings.absentDeduction) : 'Rp 70.000'}`, 
      `(${formatCurrency(salary.deductions.absent)})`
    ],
    [
      'Izin', 
      `${salary.leaveDays} hari × ${settings ? formatCurrency(settings.leaveDeduction) : 'Rp 35.000'}`, 
      `(${formatCurrency(salary.deductions.leave)})`
    ],
    [
      'Terlambat', 
      `${Math.ceil(salary.lateMinutes / (settings?.lateTimeBlock || 30))} blok × ${settings ? formatCurrency(settings.lateDeduction) : 'Rp 5.000'}`, 
      `(${formatCurrency(salary.deductions.late)})`
    ],
    [
      'Pulang Cepat', 
      `${Math.ceil(salary.earlyLeaveMinutes / (settings?.earlyLeaveTimeBlock || 30))} blok × ${settings ? formatCurrency(settings.earlyLeaveDeduction) : 'Rp 5.000'}`, 
      `(${formatCurrency(salary.deductions.earlyLeave)})`
    ],
    ['', '', ''],
    ['Total Potongan', '', `(${formatCurrency(salary.deductions.total)})`],
    ['', '', ''],
    ['GAJI BERSIH', '', formatCurrency(salary.totalSalary)]
  ];
  
  let currentY = salaryY + 15;
  
  tableData.forEach((row, index) => {
    doc.setFont('helvetica', row[0] === 'GAJI BERSIH' ? 'bold' : 'normal');
    
    if (row[0] === 'POTONGAN:' || row[0] === 'GAJI BERSIH') {
      doc.setFont('helvetica', 'bold');
    }
    
    if (row[0]) doc.text(row[0], 20, currentY);
    if (row[1]) doc.text(row[1], 80, currentY);
    if (row[2]) {
      if (row[0] === 'GAJI BERSIH') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
      }
      doc.text(row[2], 170, currentY, { align: 'right' });
      if (row[0] === 'GAJI BERSIH') {
        doc.setFontSize(12);
      }
    }
    
    // Add line for total sections
    if (row[0] === 'Total Potongan' || row[0] === 'GAJI BERSIH') {
      doc.setLineWidth(0.3);
      doc.line(20, currentY + 2, 170, currentY + 2);
    }
    
    currentY += 7;
  });
  doc.addPage();
  currentY = 20;
  
  // Page 2 Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SLIP GAJI PEGAWAI', 105, currentY, { align: 'center' });
  
  currentY = 30;
  
  // Employee name and period on page 2
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${salary.employeeName} - ${formatPeriodForSlip(salary.period)}`, 105, currentY, { align: 'center' });
  
  // Status Information Section
  currentY = 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS PEMBAYARAN:', 20, currentY);
  
  // Status details
  currentY = 45;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(`• ${statusText}`, 25, currentY);
  
  if (salary.status === 'draft') {
    doc.text('• Gaji masih dalam tahap perhitungan', 25, currentY + 6);
    doc.text('• Belum dapat dicairkan', 25, currentY + 12);
  } else if (salary.status === 'finalized') {
    doc.text('• Gaji sudah dikonfirmasi dan siap dibayar', 25, currentY + 6);
    doc.text(`• Difinalisasi pada: ${formatDate(salary.finalizedAt || salary.calculatedAt)}`, 25, currentY + 12);
  } else if (salary.status === 'paid') {
    doc.text('• Gaji sudah ditransfer ke rekening pegawai', 25, currentY + 6);
    doc.text(`• Dibayar pada: ${formatDate(salary.paidAt || salary.finalizedAt || salary.calculatedAt)}`, 25, currentY + 12);
  }
  
  doc.setTextColor(0, 0, 0); // Reset to black
  
  // Footer
  const footerY = 70;
  const footerYY = 80;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Slip gaji ini digenerate otomatis oleh sistem', 20, footerY);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, 20, footerY + 8);
  
  // Signature section
  doc.text('Mengetahui,', 130, footerYY);
  doc.text('HRD Manager', 130, footerYY + 25);
  doc.text('(_________________)', 130, footerYY + 30);

  // Add page numbers to both pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128); // Gray color for page numbers
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }
  
  // Generate filename with status
  const filename = `Slip-Gaji-${salary.employeeName.replace(/\s+/g, '-')}-${salary.period}-${salary.status}.pdf`;
  
  // Save the PDF
  doc.save(filename);
}

function formatPeriodForSlip(period: string): string {
  const [year, month] = period.split('-');
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getStatusText(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'finalized':
      return 'Finalisasi';
    case 'paid':
      return 'Sudah Dibayar';
    default:
      return status;
  }
}

function getStatusColor(status: string): { r: number; g: number; b: number } {
  switch (status) {
    case 'draft':
      return { r: 107, g: 114, b: 128 }; // gray
    case 'finalized':
      return { r: 217, g: 119, b: 6 }; // yellow/orange
    case 'paid':
      return { r: 34, g: 197, b: 94 }; // green
    default:
      return { r: 107, g: 114, b: 128 }; // gray
  }
}