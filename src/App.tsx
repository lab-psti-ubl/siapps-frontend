import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (userType === 'admin') {
    return <AdminDashboard />;
  }

  if (userType === 'user') {
    return <UserDashboard />;
  }

  return <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;