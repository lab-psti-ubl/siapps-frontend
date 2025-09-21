import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SalaryCalculation } from '../components/admin/types';
import { formatCurrency, formatMinutes, getMonthName } from './salaryUtils';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface SalarySlipPDFOptions {
  calculation: SalaryCalculation;
  employeeInfo?: {
    position?: string;
    nik?: string;
    phone?: string;
  };
}

export interface SalaryReportPDFOptions {
  title: string;
  period: string;
  calculations: SalaryCalculation[];
  summary?: {
    totalEmployees: number;
    totalBasicSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
    averageNetSalary: number;
    totalPresentDays?: number;
    totalLeaveDays?: number;
    totalAbsentDays?: number;
    totalAbsentDeduction?: number;
    totalLeaveDeduction?: number;
    totalLateDeduction?: number;
    totalEarlyLeaveDeduction?: number;
  };
}

export function generateSalarySlipPDF(options: SalarySlipPDFOptions): void {
  const { calculation, employeeInfo = {} } = options;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  const monthName = getMonthName(parseInt(calculation.month.split('-')[1]));
  const year = calculation.year;
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SLIP GAJI PEGAWAI', 105, 20, { align: 'center' });
  
  // Add period
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${monthName} ${year}`, 105, 30, { align: 'center' });
  
  // Employee Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI PEGAWAI', 20, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nama: ${calculation.employeeName}`, 20, 60);
  doc.text(`ID Pegawai: ${calculation.employeeId}`, 20, 68);
  if (employeeInfo.position) {
    doc.text(`Jabatan: ${employeeInfo.position}`, 20, 76);
  }
  if (employeeInfo.nik) {
    doc.text(`NIK: ${employeeInfo.nik}`, 20, 84);
  }
  
  // Salary Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINCIAN GAJI', 20, 100);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Gaji Pokok: ${formatCurrency(calculation.basicSalary)}`, 20, 110);
  
  // Attendance Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINCIAN KEHADIRAN', 20, 130);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Hari Kerja: ${calculation.workingDays} hari`, 20, 140);
  doc.text(`Hadir: ${calculation.presentDays} hari`, 20, 148);
  doc.text(`Izin: ${calculation.leaveDays} hari`, 20, 156);
  doc.text(`Tidak Hadir: ${calculation.absentDays} hari`, 20, 164);
  
  // Time Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINCIAN WAKTU', 20, 180);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total Terlambat: ${formatMinutes(calculation.totalLateMinutes)} (${calculation.lateBlocks} blok)`, 20, 190);
  doc.text(`Total Pulang Cepat: ${formatMinutes(calculation.totalEarlyLeaveMinutes)} (${calculation.earlyLeaveBlocks} blok)`, 20, 198);
  
  // Deductions Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINCIAN POTONGAN', 20, 215);
  
  const deductionData = [
    ['Potongan Tidak Hadir', `${calculation.absentDays} hari × ${formatCurrency(calculation.salarySettings.absentDeduction)}`, formatCurrency(calculation.absentDeduction)],
    ['Potongan Izin', `${calculation.leaveDays} hari × ${formatCurrency(calculation.salarySettings.leaveDeduction)}`, formatCurrency(calculation.leaveDeduction)],
    ['Potongan Terlambat', `${calculation.lateBlocks} blok × ${formatCurrency(calculation.salarySettings.lateDeduction)}`, formatCurrency(calculation.lateDeduction)],
    ['Potongan Pulang Cepat', `${calculation.earlyLeaveBlocks} blok × ${formatCurrency(calculation.salarySettings.earlyLeaveDeduction)}`, formatCurrency(calculation.earlyLeaveDeduction)]
  ];
  
  doc.autoTable({
    startY: 225,
    head: [['Jenis Potongan', 'Perhitungan', 'Jumlah']],
    body: deductionData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 80 },
      2: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Final calculation
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setDrawColor(0, 0, 0);
  doc.line(20, finalY, 190, finalY);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Potongan: ${formatCurrency(calculation.totalDeduction)}`, 20, finalY + 10);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`GAJI BERSIH: ${formatCurrency(calculation.netSalary)}`, 20, finalY + 25);
  
  // Footer
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
  
  // Generate filename
  const filename = `Slip-Gaji-${calculation.employeeName.replace(/\s+/g, '-')}-${monthName}-${year}.pdf`;
  
  // Save the PDF
  doc.save(filename);
}

export function generateSalaryReportPDF(options: SalaryReportPDFOptions): void {
  const { title, period, calculations, summary } = options;
  
  // Create new PDF document
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
  
  // Add summary if provided
  if (summary) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN', 20, 50);
    
    const summaryData = [
      ['Total Pegawai', summary.totalEmployees.toString()],
      ['Total Gaji Pokok', formatCurrency(summary.totalBasicSalary)],
      ['Total Potongan', formatCurrency(summary.totalDeductions)],
      ['Total Gaji Bersih', formatCurrency(summary.totalNetSalary)],
      ['Rata-rata Gaji Bersih', formatCurrency(summary.averageNetSalary)]
    ];
    
    doc.autoTable({
      startY: 60,
      head: [['Keterangan', 'Nilai']],
      body: summaryData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: 'right' },
      },
      margin: { left: 20 },
      tableWidth: 140,
    });
  }
  
  // Prepare table data
  const tableData = calculations.map((calc) => [
    calc.employeeName,
    formatCurrency(calc.basicSalary),
    `${calc.presentDays}/${calc.workingDays}`,
    calc.leaveDays.toString(),
    calc.absentDays.toString(),
    formatCurrency(calc.totalDeduction),
    formatCurrency(calc.netSalary)
  ]);
  
  // Add detail table
  const startY = summary ? (doc as any).lastAutoTable.finalY + 20 : 60;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAIL GAJI PEGAWAI', 20, startY);
  
  doc.autoTable({
    startY: startY + 10,
    head: [['Nama Pegawai', 'Gaji Pokok', 'Hadir/Kerja', 'Izin', 'Tidak Hadir', 'Total Potongan', 'Gaji Bersih']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 35, halign: 'right' },
      6: { cellWidth: 35, halign: 'right' },
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
  const filename = `Laporan-Gaji-${period.replace(/\s+/g, '-')}.pdf`;
  
  // Save the PDF
  doc.save(filename);
}