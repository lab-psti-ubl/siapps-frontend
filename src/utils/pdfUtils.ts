import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AttendanceRecord } from '../components/admin/types';
import { getStatusText } from './attendanceUtils';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PDFExportOptions {
  title: string;
  period: string;
  data: AttendanceRecord[];
  employees?: any[];
  isAdmin?: boolean;
}

export interface EmployeesPDFOptions {
  title: string;
  data: any[];
  searchTerm?: string;
  filterPosition?: string;
}

export function generateAttendancePDF(options: PDFExportOptions): void {
  const { title, period, data, employees = [], isAdmin = false } = options;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN ABSENSI PEGAWAI', 105, 20, { align: 'center' });
  
  // Add period
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${period}`, 105, 30, { align: 'center' });
  
  // Calculate statistics
  const stats = calculateAttendanceStats(data, employees, isAdmin);
  
  // Add summary statistics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Absensi', 20, 50);
  
  // Statistics boxes
  const boxY = 60;
  const boxWidth = 40;
  const boxHeight = 20;
  const spacing = 45;
  
  // Present box
  doc.setDrawColor(34, 197, 94); // green
  doc.setFillColor(220, 252, 231); // light green
  doc.rect(20, boxY, boxWidth, boxHeight, 'FD');
  doc.setTextColor(21, 128, 61); // dark green
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.present.toString(), 40, boxY + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Hadir', 40, boxY + 16, { align: 'center' });
  
  // Leave box
  doc.setDrawColor(59, 130, 246); // blue
  doc.setFillColor(219, 234, 254); // light blue
  doc.rect(20 + spacing, boxY, boxWidth, boxHeight, 'FD');
  doc.setTextColor(30, 64, 175); // dark blue
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.leave.toString(), 40 + spacing, boxY + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Izin', 40 + spacing, boxY + 16, { align: 'center' });
  
  // Absent box
  doc.setDrawColor(239, 68, 68); // red
  doc.setFillColor(254, 226, 226); // light red
  doc.rect(20 + spacing * 2, boxY, boxWidth, boxHeight, 'FD');
  doc.setTextColor(185, 28, 28); // dark red
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.absent.toString(), 40 + spacing * 2, boxY + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Tidak Hadir', 40 + spacing * 2, boxY + 16, { align: 'center' });
  
  // Total box
  doc.setDrawColor(107, 114, 128); // gray
  doc.setFillColor(243, 244, 246); // light gray
  doc.rect(20 + spacing * 3, boxY, boxWidth, boxHeight, 'FD');
  doc.setTextColor(75, 85, 99); // dark gray
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(stats.total.toString(), 40 + spacing * 3, boxY + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Total', 40 + spacing * 3, boxY + 16, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add detail table title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Absensi', 20, 95);
  
  // Prepare table data
  const tableData = prepareTableData(data, employees, isAdmin);
  
  // Add table
  doc.autoTable({
    startY: 105,
    head: [['Nama Pegawai', 'Tanggal', 'Keterangan', 'Jam Masuk', 'Status Masuk', 'Jam Keluar', 'Status Keluar']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
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
      0: { cellWidth: 30 }, // Name
      1: { cellWidth: 25 }, // Date
      2: { cellWidth: 25 }, // Type
      3: { cellWidth: 20 }, // Check In Time
      4: { cellWidth: 25 }, // Check In Status
      5: { cellWidth: 20 }, // Check Out Time
      6: { cellWidth: 25 }, // Check Out Status
    },
    margin: { left: 20, right: 20 },
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      20,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `${i}/${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }
  
  // Generate filename
  const filename = `Laporan-Absensi-${period.replace(/\s+/g, '-')}.pdf`;
  
  // Save the PDF
  doc.save(filename);
}

export function generateEmployeesPDF(options: EmployeesPDFOptions): void {
  const { title, data, searchTerm = '', filterPosition = '' } = options;
  
  // Create new PDF document
  const doc = new jsPDF('landscape'); // Use landscape for better table fit
  
  // Set font
  doc.setFont('helvetica');
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR PEGAWAI PERUSAHAAN', 148, 20, { align: 'center' });
  
  // Add generation date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 148, 30, { align: 'center' });
  
  // Add filter information if any
  let yPosition = 40;
  if (searchTerm || filterPosition) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    let filterText = 'Filter diterapkan: ';
    if (searchTerm) filterText += `Pencarian: "${searchTerm}"`;
    if (searchTerm && filterPosition) filterText += ', ';
    if (filterPosition) filterText += `Jabatan: "${filterPosition}"`;
    
    doc.text(filterText, 148, yPosition, { align: 'center' });
    yPosition += 10;
  }
  
  // Add summary statistics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Data', 20, yPosition + 10);
  
  // Statistics
  const totalEmployees = data.length;
  const uniquePositions = [...new Set(data.map(emp => emp.position))].length;
  const totalSalary = data.reduce((sum, emp) => sum + emp.basicSalary, 0);
  
  // Statistics boxes
  const boxY = yPosition + 20;
  const boxWidth = 60;
  const boxHeight = 20;
  const spacing = 70;
  
  // Total employees box
  doc.setDrawColor(59, 130, 246); // blue
  doc.setFillColor(219, 234, 254); // light blue
  doc.rect(20, boxY, boxWidth, boxHeight, 'FD');
  doc.setTextColor(30, 64, 175); // dark blue
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(totalEmployees.toString(), 50, boxY + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Total Pegawai', 50, boxY + 16, { align: 'center' });
  
  // Unique positions box
  doc.setDrawColor(34, 197, 94); // green
  doc.setFillColor(220, 252, 231); // light green
  doc.rect(20 + spacing, boxY, boxWidth, boxHeight, 'FD');
  doc.setTextColor(21, 128, 61); // dark green
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(uniquePositions.toString(), 50 + spacing, boxY + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Jenis Jabatan', 50 + spacing, boxY + 16, { align: 'center' });
  
  // Total salary box
  doc.setDrawColor(168, 85, 247); // purple
  doc.setFillColor(243, 232, 255); // light purple
  doc.rect(20 + spacing * 2, boxY, boxWidth + 20, boxHeight, 'FD');
  doc.setTextColor(124, 58, 237); // dark purple
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrencyForPDF(totalSalary), 60 + spacing * 2, boxY + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Total Gaji Pokok', 60 + spacing * 2, boxY + 16, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add detail table title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Pegawai', 20, boxY + 35);
  
  // Prepare table data
  const tableData = data.map((employee, index) => [
    (index + 1).toString(),
    employee.qrId,
    employee.name,
    employee.nik,
    employee.position,
    employee.phone,
    `${employee.birthPlace}, ${formatDateForPDF(employee.birthDate)}`,
    formatCurrencyForPDF(employee.basicSalary),
    formatDateForPDF(employee.createdAt)
  ]);
  
  // Add table
  doc.autoTable({
    startY: boxY + 45,
    head: [['No', 'ID QR', 'Nama Lengkap', 'NIK', 'Jabatan', 'Telepon', 'Tempat, Tgl Lahir', 'Gaji Pokok', 'Tgl Bergabung']],
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
      1: { cellWidth: 25 }, // ID QR
      2: { cellWidth: 40 }, // Name
      3: { cellWidth: 35 }, // NIK
      4: { cellWidth: 30 }, // Position
      5: { cellWidth: 30 }, // Phone
      6: { cellWidth: 45 }, // Birth
      7: { cellWidth: 35, halign: 'right' }, // Salary
      8: { cellWidth: 25 }, // Join Date
    },
    margin: { left: 20, right: 20 },
    tableWidth: 'auto',
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Sistem Manajemen Pegawai - ${new Date().getFullYear()}`,
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
  let filename = 'Daftar-Pegawai';
  if (searchTerm) filename += `-Pencarian-${searchTerm.replace(/\s+/g, '-')}`;
  if (filterPosition) filename += `-${filterPosition.replace(/\s+/g, '-')}`;
  filename += '.pdf';
  
  // Save the PDF
  doc.save(filename);
}

function calculateAttendanceStats(data: AttendanceRecord[], employees: any[], isAdmin: boolean) {
  if (isAdmin) {
    // For admin view, calculate based on all employees for the selected date
    const present = data.filter(record => record.attendanceType === 'present').length;
    const leave = data.filter(record => record.attendanceType === 'leave').length;
    const absent = employees.length - present - leave;
    
    return {
      present,
      leave,
      absent: absent > 0 ? absent : 0,
      total: employees.length
    };
  } else {
    // For user view, calculate based on user's attendance records
    const present = data.filter(record => record.attendanceType === 'present').length;
    const leave = data.filter(record => record.attendanceType === 'leave').length;
    const absent = data.filter(record => record.attendanceType === 'absent').length;
    
    return {
      present,
      leave,
      absent,
      total: present + leave + absent
    };
  }
}

function prepareTableData(data: AttendanceRecord[], employees: any[], isAdmin: boolean): string[][] {
  if (isAdmin) {
    // For admin view, show all employees for the selected date
    return employees.map(employee => {
      const attendance = data.find(record => record.employeeId === employee.id);
      
      if (attendance) {
        return [
          employee.name,
          formatDate(attendance.date),
          getAttendanceTypeText(attendance),
          attendance.attendanceType === 'leave' ? '-' : (attendance.checkInTime || '-'),
          attendance.attendanceType === 'leave' ? 'Izin' : getStatusText(attendance.checkInStatus),
          attendance.attendanceType === 'leave' ? '-' : (attendance.checkOutTime || '-'),
          attendance.attendanceType === 'leave' ? 'Izin' : getStatusText(attendance.checkOutStatus)
        ];
      } else {
        return [
          employee.name,
          '-',
          'Tidak Hadir',
          '-',
          'Tidak Hadir',
          '-',
          'Tidak Hadir'
        ];
      }
    });
  } else {
    // For user view, show user's attendance records
    return data.map(record => [
      record.employeeName,
      formatDate(record.date),
      getAttendanceTypeText(record),
      record.attendanceType === 'leave' ? '-' : (record.checkInTime || '-'),
      record.attendanceType === 'leave' ? 'Izin' : getStatusText(record.checkInStatus),
      record.attendanceType === 'leave' ? '-' : (record.checkOutTime || '-'),
      record.attendanceType === 'leave' ? 'Izin' : getStatusText(record.checkOutStatus)
    ]);
  }
}

function getAttendanceTypeText(record: AttendanceRecord): string {
  if (record.attendanceType === 'leave') {
    return 'Izin';
  } else if (record.attendanceType === 'absent') {
    return 'Tidak Hadir';
  }
  return 'Hadir';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID');
}

function formatDateForPDF(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatCurrencyForPDF(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}