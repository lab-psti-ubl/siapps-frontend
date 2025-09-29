import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (userType === 'admin') {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    );
  }

  if (userType === 'user') {
    return (
      <Routes>
        <Route path="/user/*" element={<UserDashboard />} />
        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;