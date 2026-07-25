import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await register(firstName, lastName, email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justify: 'center',
      minHeight: 'calc(100vh - 4rem)',
      padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '460px', 
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Glow Accent Circle */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '120px',
          height: '120px',
          background: 'var(--accent-color)',
          filter: 'blur(60px)',
          opacity: 0.4,
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <UserPlus size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Hesap <span className="gradient-text">Oluştur</span>
          </h1>
          <p style={{ fontSize: '0.9rem' }}>SplitBro ile grup harcamalarınızı yönetin.</p>
        </div>

        {error && (
          <div className="alert-box alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div className="responsive-name-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">
                <User size={15} color="var(--primary-color)" /> Ad
              </label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Örn. Ali"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <User size={15} color="var(--primary-color)" /> Soyad
              </label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Örn. Yılmaz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              <Mail size={15} color="var(--primary-color)" /> E-posta Adresi
            </label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="E-postanızı girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Lock size={15} color="var(--primary-color)" /> Şifre
            </label>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="En az 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            <Sparkles size={20} />
            {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--surface-border)',
          fontSize: '0.9rem', 
          color: 'var(--text-secondary)' 
        }}>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '700' }}>
            Giriş Yap
          </Link>
        </div>

      </div>

      <style>{`
        @media (max-width: 480px) {
          .responsive-name-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
