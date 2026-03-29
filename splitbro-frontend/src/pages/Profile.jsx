import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { User, Lock, KeyRound, AlertTriangle, UserMinus, Camera, CheckSquare, Upload, Trash2, RefreshCw } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) {
      if (user.avatar.startsWith('data:') || user.avatar.startsWith('http')) {
        return user.avatar;
      }
      const base = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
      return `${base}${user.avatar}`;
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Sadece resim dosyaları yüklenebilir!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır!');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return alert('Lütfen önce bir resim seçin.');
    setLoading(true);
    try {
      const myId = user.id || user._id;
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      await api.post(`/users/${myId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAvatarFile(null);
      alert('Profil resmi başarıyla yüklendi!');
      window.location.reload();
    } catch (error) {
      alert('Yükleme hatası: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Profil resmini silmek istediğine emin misin?")) return;
    try {
      const myId = user.id || user._id;
      await api.delete(`/users/${myId}/avatar`);
      setAvatarPreview(null);
      setAvatarFile(null);
      alert("Profil resmi kaldırıldı.");
      window.location.reload();
    } catch (error) {
      alert("Resim silinemedi: " + (error.response?.data?.message || ''));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const myId = user.id || user._id;
      await api.put(`/users/${myId}`, { firstName, lastName });
      alert("Profil başarıyla güncellendi!");
      window.location.reload();
    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || 'Profil güncellenemedi.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Yeni şifreler eşleşmiyor!");

    setLoading(true);
    try {
      const myId = user.id || user._id;
      await api.put(`/users/${myId}/change-password`, { oldPassword, newPassword });
      alert("Şifreniz başarıyla değiştirildi. Lütfen yeni şifreyle tekrar giriş yapın.");
      logout();
      navigate('/login');
    } catch (error) {
      alert("Şifre değiştirelemedi: " + (error.response?.data?.message || 'Eski şifrenizi kontrol edin.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("DİKKAT! Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;

    const doubleCheck = prompt("Lütfen silme onayını onaylamak için 'SİL' yazın:");
    if (doubleCheck !== 'SİL') {
      return alert("İşlem iptal edildi.");
    }

    try {
      const myId = user.id || user._id;
      await api.delete(`/users/${myId}/account`);
      logout();
      navigate('/login');
    } catch (error) {
      alert("Hesap silinemedi. Gruplarınızın sahibi iseniz önce onları devretmelisiniz.");
    }
  };

  const avatarSrc = getAvatarSrc();

  return (
    <>
      <Header />
      <div className="app-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>

        {/* Sol Kolon: Profil ve Resim */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Profil Resmi Kartı */}
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'var(--primary-color)', margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', border: '3px solid var(--surface-border)',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Resim yüklemek için tıklayın"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{firstName?.[0] || '?'}</span>
                  )}
                </div>

                {/* Kamera overlay */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: '0', right: '0',
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--primary-color)', border: '2px solid var(--bg-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'transform 0.2s'
                  }}
                >
                  <Camera size={16} />
                </div>
              </div>

              {/* Gizli file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <h2 style={{ marginTop: '1rem', marginBottom: '0.2rem' }}>{firstName} {lastName}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>SplitBro Üyesi</p>

              {/* Resim Aksiyonları */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {avatarFile && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    onClick={handleUploadAvatar}
                    disabled={loading}
                  >
                    <Upload size={14} /> {loading ? 'Yükleniyor...' : 'Resmi Kaydet'}
                  </button>
                )}
                {(user?.avatar || avatarFile) && (
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                    onClick={() => {
                      if (avatarFile) { setAvatarFile(null); setAvatarPreview(null); }
                      else { handleRemoveAvatar(); }
                    }}
                  >
                    <Trash2 size={14} /> {avatarFile ? 'İptal' : 'Resmi Sil'}
                  </button>
                )}
                {!avatarFile && (
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <RefreshCw size={14} /> {user?.avatar ? 'Değiştir' : 'Resim Yükle'}
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                JPG, PNG veya WebP • Maks 5MB
              </p>
            </div>

            {/* Kişisel Bilgiler */}
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
              <User size={20} color="var(--primary-color)" /> Kişisel Bilgiler
            </h3>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Ad</label>
                  <input type="text" className="glass-input" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Soyad</label>
                  <input type="text" className="glass-input" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <CheckSquare size={16} /> Profili Kaydet
              </button>
            </form>
          </div>

        </div>

        {/* Sağ Kolon: Şifre, Tehlikeli Bölge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', animationDelay: '0.1s' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
              <KeyRound size={20} color="var(--secondary-color)" /> Şifre Değiştir
            </h3>

            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label className="input-label">Mevcut Şifreniz</label>
                <input type="password" className="glass-input" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Yeni Şifreniz</label>
                <input type="password" className="glass-input" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength="6" />
              </div>
              <div className="input-group">
                <label className="input-label">Yeni Şifre (Tekrar)</label>
                <input type="password" className="glass-input" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>

              <button className="btn btn-primary" style={{ border: '1px solid var(--secondary-color)', background: 'var(--surface-color)', color: 'var(--secondary-color)', width: '100%' }} disabled={loading}>
                <Lock size={16} /> Şifreyi Güncelle
              </button>
            </form>
          </div>

          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)', animationDelay: '0.2s' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--danger-color)' }}>
              <AlertTriangle size={20} /> Tehlikeli Alan
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Hesabınızı sildiğinizde, katıldığınız tüm gruplardaki hareketleriniz ve verileriniz SplitBro sisteminden tamamen temizlenir. Bu işlem geri döndürülemez!</p>
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleDeleteAccount}>
              <UserMinus size={18} /> Hesabımı Kalıcı Olarak Sil
            </button>
          </div>

        </div>

      </div>
    </>
  );
};

export default Profile;
