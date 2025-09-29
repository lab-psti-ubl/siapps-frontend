import { useState } from 'react';

export interface EmployeeFormData {
  name: string;
  position: string;
  phone: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  basicSalary: string;
  rfidGuid: string;
  divisionId: string;
  workShiftId: string;
}

export const useEmployeeForm = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    position: '',
    phone: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    basicSalary: '',
    rfidGuid: '',
    divisionId: '',
    workShiftId: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      phone: '',
      nik: '',
      birthPlace: '',
      birthDate: '',
      basicSalary: '',
      rfidGuid: '',
      divisionId: '',
      workShiftId: '',
    });
  };

  const setFormDataFromEmployee = (employee: any) => {
    const formattedBirthDate = employee.birthDate ? 
      new Date(employee.birthDate).toISOString().split('T')[0] : '';
    
    setFormData({
      name: employee.name,
      position: employee.position,
      phone: employee.phone,
      nik: employee.nik,
      birthPlace: employee.birthPlace,
      birthDate: formattedBirthDate,
      basicSalary: employee.basicSalary.toString(),
      rfidGuid: employee.rfidGuid || '',
      divisionId: employee.divisionId || '',
      workShiftId: employee.workShiftId || '',
    });
  };

  return {
    formData,
    setFormData,
    resetForm,
    setFormDataFromEmployee
  };
};