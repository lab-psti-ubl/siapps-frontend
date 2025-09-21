import { SalaryCalculation } from '../components/admin/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}j ${mins}m`;
  }
  return `${mins}m`;
};

export const getMonthName = (month: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1];
};

export const calculateDeductionPercentage = (totalDeduction: number, basicSalary: number): number => {
  if (basicSalary === 0) return 0;
  return (totalDeduction / basicSalary) * 100;
};

export const getWorkingDaysInMonth = (year: number, month: number): number => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // Exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  return workingDays;
};

export const calculateTimeBlocks = (minutes: number, blockSize: number): number => {
  return Math.ceil(minutes / blockSize);
};

export const generateSalarySlipContent = (calculation: SalaryCalculation): string => {
  const monthName = getMonthName(parseInt(calculation.month.split('-')[1]));
  const year = calculation.year;
  
  return `
    SLIP GAJI PEGAWAI
    
    Periode: ${monthName} ${year}
    
    INFORMASI PEGAWAI
    Nama: ${calculation.employeeName}
    ID Pegawai: ${calculation.employeeId}
    
    RINCIAN GAJI
    Gaji Pokok: ${formatCurrency(calculation.basicSalary)}
    
    RINCIAN KEHADIRAN
    Hari Kerja: ${calculation.workingDays} hari
    Hadir: ${calculation.presentDays} hari
    Izin: ${calculation.leaveDays} hari
    Tidak Hadir: ${calculation.absentDays} hari
    
    RINCIAN WAKTU
    Total Terlambat: ${formatMinutes(calculation.totalLateMinutes)} (${calculation.lateBlocks} blok)
    Total Pulang Cepat: ${formatMinutes(calculation.totalEarlyLeaveMinutes)} (${calculation.earlyLeaveBlocks} blok)
    
    RINCIAN POTONGAN
    Potongan Tidak Hadir: ${formatCurrency(calculation.absentDeduction)}
    Potongan Izin: ${formatCurrency(calculation.leaveDeduction)}
    Potongan Terlambat: ${formatCurrency(calculation.lateDeduction)}
    Potongan Pulang Cepat: ${formatCurrency(calculation.earlyLeaveDeduction)}
    
    Total Potongan: ${formatCurrency(calculation.totalDeduction)}
    
    GAJI BERSIH: ${formatCurrency(calculation.netSalary)}
    
    Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
  `;
};