import { useState, useMemo } from 'react';
import { Employee } from '../../../types';

export const useEmployeesFilters = (employees: Employee[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique positions for filter dropdown
  const uniquePositions = useMemo(() => {
    return [...new Set(employees.map(emp => emp.position))].sort();
  }, [employees]);

  // Filter employees based on search term and position filter
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm) ||
        employee.qrId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPosition = filterPosition === '' || employee.position === filterPosition;
      
      return matchesSearch && matchesPosition;
    });
  }, [employees, searchTerm, filterPosition]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPosition('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filterPosition,
    setFilterPosition,
    showFilters,
    setShowFilters,
    filteredEmployees,
    uniquePositions,
    clearFilters
  };
};