import React from 'react';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="topbar">
      <div className="topbar-brand">
        <div className="topbar-icon">🎓</div>
        <div className="topbar-name">Exam<span>Seat</span></div>
      </div>
      <div className="topbar-right">
        <div className="topbar-user-info">
          <div className="topbar-user-name">{user?.name}</div>
          <div className={`topbar-user-role ${user?.role === 'admin' ? 'role-admin-tag' : 'role-student-tag'}`}>
            {user?.role === 'admin' ? '⚙ Administrator' : `🎓 Roll No. ${user?.rollNo}`}
          </div>
        </div>
        <div className="topbar-avatar">{user?.name?.charAt(0)}</div>
        <button className="btn-logout" onClick={logout}>Sign out</button>
      </div>
    </nav>
  );
};

export default Topbar;
