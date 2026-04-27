import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    const res = await googleLogin(credentialResponse.credential);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
      setIsLoading(false);
    }
  };

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
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <UserPlus size={28} color="var(--primary-color)" />
            Hesap Oluştur
          </h2>
          <p>SplitBro ile masrafları bölüşmeye başla.</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
              <label className="input-label">Ad</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Örn. Ali"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
              <label className="input-label">Soyad</label>
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
             <label className="input-label">E-posta Adresi</label>
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
             <label className="input-label">Şifre</label>
             <input 
               type="password" 
               className="glass-input" 
               placeholder="En az 6 karakter"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
             />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Hesap Açılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>veya</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google ile kayıt yapılırken bir hata oluştu.')}
            theme="filled_black"
            shape="pill"
            size="large"
            text="signup_with"
            locale="tr"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Zaten hesabın var mı? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
