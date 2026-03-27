import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-panel" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1rem 2rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        position: 'sticky', top: 0, zIndex: 10
      }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>
          SplitBro
        </Link>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Home size={18} />
            Dashboard
          </Link>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <User size={18} />
          <span>{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name || user?.email}</span>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
          <LogOut size={16} />
          Çıkış
        </button>
      </div>
    </header>
  );
};

export default Header;
