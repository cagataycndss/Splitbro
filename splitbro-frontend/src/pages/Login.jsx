import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await login(email, password);
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
        maxWidth: '420px', 
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Glow Accent Circle */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
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
            <Sparkles size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.35rem' }}>
            Split<span className="gradient-text">Bro</span>'ya Giriş Yap
          </h1>
          <p style={{ fontSize: '0.9rem' }}>Harcamalarınızı kolayca bölüştürün ve takip edin.</p>
        </div>

        {error && (
          <div className="alert-box alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
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
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            <LogIn size={20} />
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
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
          Hesabınız yok mu?{' '}
          <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '700' }}>
            Hemen Kayıt Ol
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
