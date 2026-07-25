import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Users, Activity, Layers, ArrowRight, X, FolderPlus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const fetchGroups = async () => {
    if (!user || (!user.id && !user._id)) return;
    const userId = user.id || user._id;
    try {
      const res = await api.get(`/users/${userId}/groups`);
      if (res.data?.data?.groups) {
         setGroups(res.data.data.groups);
      } else if (res.data?.data) {
         setGroups(res.data.data);
      } else if (Array.isArray(res.data)) {
         setGroups(res.data);
      }
    } catch (err) {
      console.error('Gruplar çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', {
        name: newGroupName,
        description: newGroupDesc
      });
      setShowModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      fetchGroups(); 
    } catch (err) {
      alert("Grup oluşturulurken hata oluştu. " + (err.response?.data?.message || ''));
    }
  };

  return (
    <>
      <Header />
      <div className="app-container">
        
        {/* Page Top Header Section */}
        <div className="flex-between-responsive animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div>
            <h1>
              Hoş Geldin, <span className="gradient-text">{user?.firstName || 'Kullanıcı'}</span> 👋
            </h1>
            <p>Aktif harcama gruplarınızı yönetin ve yeni gruplar oluşturun.</p>
          </div>

          <button onClick={() => setShowModal(true)} className="btn btn-gradient btn-lg">
            <PlusCircle size={20} />
            Yeni Grup Oluştur
          </button>
        </div>

        {/* Quick Stats Overview Cards */}
        <div className="grid-responsive animate-fade-in" style={{ marginBottom: '2rem', animationDelay: '0.1s' }}>
          <div className="glass-card card-pulse" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'var(--primary-light)', color: 'var(--primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Layers size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Toplam Grup</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>{groups.length}</div>
            </div>
          </div>

          <div className="glass-card card-pulse" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'var(--success-light)', color: 'var(--success-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Kullanıcı Durumu</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Aktif Üye</div>
            </div>
          </div>
        </div>

        {/* Groups Grid / Empty State */}
        {loading ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Gruplar yükleniyor...</div>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '1.25rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderPlus size={20} color="var(--primary-color)" /> Gruplarınız
            </h2>

            {groups.length === 0 ? (
              <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'var(--primary-light)', color: 'var(--primary-color)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <Users size={36} />
                </div>
                <h3>Henüz hiç gruba dahil değilsiniz</h3>
                <p style={{ marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                  Arkadaşlarınızla ev, tatil veya etkinlik masraflarını eşit şekilde bölüşmek için ilk grubunuzu hemen oluşturun.
                </p>
                <button onClick={() => setShowModal(true)} className="btn btn-gradient">
                  <PlusCircle size={18} /> İlk Grubunu Oluştur
                </button>
              </div>
            ) : (
              <div className="grid-responsive animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {groups.map(group => (
                  <Link to={`/groups/${group._id || group.id}`} key={group._id || group.id} style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ 
                      padding: '1.5rem', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                        <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                          {group.name}
                        </h3>
                        <span className="badge badge-primary">
                          <Users size={12} /> {group.members?.length || 1} Üye
                        </span>
                      </div>
                      
                      <p style={{ flex: 1, fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {group.description || 'Açıklama belirtilmemiş.'}
                      </p>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justify: 'space-between',
                        borderTop: '1px solid var(--surface-border)', 
                        paddingTop: '1rem', 
                        color: 'var(--primary-color)',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                          <Activity size={15} /> İncele
                        </span>
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal -> Yeni Grup Oluştur */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Yeni Grup Oluştur</h2>
                <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup}>
                <div className="input-group">
                  <label className="input-label">Grup Adı</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="Örn. Ev Arkadaşları, Antalya Tatili"
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Açıklama (Opsiyonel)</label>
                  <textarea 
                    className="glass-input" 
                    rows="3" 
                    placeholder="Grubun amacını kısaca açıklayın..."
                    value={newGroupDesc} 
                    onChange={e => setNewGroupDesc(e.target.value)} 
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    İptal
                  </button>
                  <button type="submit" className="btn btn-gradient" style={{ flex: 1 }}>
                    Oluştur
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Dashboard;
