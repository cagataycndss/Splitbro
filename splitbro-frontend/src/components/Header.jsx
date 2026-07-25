import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, User, Menu, X, Sparkles } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAvatarSrc = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith('data:') || user.avatar.startsWith('http')) {
        return user.avatar;
      }
      return `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${user.avatar}`;
    }
    return null;
  };

  const avatarSrc = getAvatarSrc();

  return (
    <header className="glass-panel" style={{ 
        borderRadius: 0,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0.85rem 1.5rem',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Brand & Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Split<span className="gradient-text">Bro</span>
            </span>
          </Link>

          <nav className="hide-on-mobile" style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/dashboard" className="btn btn-outline btn-sm" style={{ border: 'none', background: 'rgba(255,255,255,0.04)' }}>
              <Home size={16} />
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Desktop User Section */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/profile" className="glass-card" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.65rem', 
            padding: '0.4rem 0.85rem', textDecoration: 'none',
            borderRadius: 'var(--radius-full)'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '1.5px solid var(--surface-border)',
              fontWeight: '700', fontSize: '0.85rem', color: '#fff'
            }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.firstName?.[0] || <User size={16} />
              )}
            </div>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email?.split('@')[0]}
            </span>
          </Link>

          <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ color: 'var(--danger-color)', borderColor: 'rgba(244,63,94,0.3)' }}>
            <LogOut size={16} />
            Çıkış
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-outline show-on-mobile"
          style={{ padding: '0.5rem', minHeight: 'auto', borderRadius: 'var(--radius-sm)' }}
          aria-label="Menü"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* Mobile Collapsible Drawer */}
      {mobileMenuOpen && (
        <div className="show-on-mobile animate-fade-in" style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--surface-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <Link 
            to="/dashboard" 
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <Home size={18} />
            Dashboard
          </Link>

          <Link 
            to="/profile" 
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <User size={18} />
            {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Profilim'}
          </Link>

          <button 
            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
            className="btn btn-danger"
            style={{ justifyContent: 'flex-start', width: '100%', marginTop: '0.25rem' }}
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      )}

      {/* Responsive helper inline style block */}
      <style>{`
        @media (min-width: 769px) {
          .show-on-mobile { display: none !important; }
        }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
