import React, { useState } from 'react';
import { Employee } from '../../types';
import EmployeesHeader from './components/EmployeesHeader';
import EmployeesSearch from './components/EmployeesSearch';
import EmployeesTable from './components/EmployeesTable';
import EmployeesNotification from './components/EmployeesNotification';
import { useEmployeesFilters } from './hooks/useEmployeesFilters';
import { useEmployeesExport } from './hooks/useEmployeesExport';

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onViewEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  onAddEmployee,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {
  const {
    searchTerm,
    setSearchTerm,
    filterPosition,
    setFilterPosition,
    showFilters,
    setShowFilters,
    filteredEmployees,
    uniquePositions,
    clearFilters
  } = useEmployeesFilters(employees);

  const {
    isExporting,
    showNotification,
    setShowNotification,
    handleExportPDF
  } = useEmployeesExport(filteredEmployees, searchTerm, filterPosition);

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      <EmployeesNotification 
        showNotification={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <EmployeesHeader onAddEmployee={onAddEmployee} />

      <EmployeesSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterPosition={filterPosition}
        setFilterPosition={setFilterPosition}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        uniquePositions={uniquePositions}
        clearFilters={clearFilters}
        handleExportPDF={handleExportPDF}
        isExporting={isExporting}
        filteredEmployees={filteredEmployees}
        totalEmployees={employees.length}
      />

      <EmployeesTable
        employees={employees}
        filteredEmployees={filteredEmployees}
        searchTerm={searchTerm}
        filterPosition={filterPosition}
        clearFilters={clearFilters}
        onViewEmployee={onViewEmployee}
        onEditEmployee={onEditEmployee}
        onDeleteEmployee={onDeleteEmployee}
      />
    </div>
  );
};

export default EmployeesView;