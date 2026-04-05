import React from 'react';
import './styles/global.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SeatingProvider }       from './context/SeatingStore';
import LoginPage      from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentPortal  from './pages/StudentPortal';
import Topbar         from './components/Topbar';

function Inner() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return (
    <div className="shell">
      <Topbar />
      {user.role === 'admin'   && <AdminDashboard />}
      {user.role === 'student' && <StudentPortal  />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SeatingProvider>
        <Inner />
      </SeatingProvider>
    </AuthProvider>
  );
}
