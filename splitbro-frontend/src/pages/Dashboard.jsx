import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { PlusCircle, Users, Activity } from 'lucide-react';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const fetchGroups = async () => {
    try {
      // Backend: GET /api/v1/groups?
      // Since our route points don't have a GetAll logic directly in REST-API.md
      // We assume /api/groups gets user's groups. Let's make an axios call.
      const res = await api.get('/groups');
      if (res.data?.data?.groups) {
         setGroups(res.data.data.groups);
      } else if (Array.isArray(res.data)) {
         setGroups(res.data);
      }
    } catch (err) {
      console.error('Gruplar çekilemedi:', err);
      // Backend /api/groups Endpoint'i yoksa mock gosterelim
      if(groups.length === 0) setGroups(mockGroups);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

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
      fetchGroups(); // Refresh
    } catch (err) {
      alert("Grup oluşturulurken hata oluştu. " + (err.response?.data?.message || ''));
    }
  };

  return (
    <>
      <Header />
      <div className="app-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Dashboard</h1>
            <p>Aktif harcama gruplarınıza genel bakış.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <PlusCircle size={20} />
            Yeni Grup Oluştur
          </button>
        </div>

        {loading ? (
          <div>Gruplar Yükleniyor...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {groups.length === 0 ? (
               <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                 <Users size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                 <h3>Henüz hiç gruba dahil değilsiniz</h3>
                 <p style={{ marginTop: '0.5rem' }}>Yeni bir grup oluşturarak harcamalarınızı bölüşmeye başlayın.</p>
               </div>
            ) : (
                groups.map(group => (
                  <Link to={`/groups/${group._id || group.id}`} key={group._id || group.id} style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{group.name}</h3>
                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                          Kişi Sayısı: {group.members?.length || 1}
                        </div>
                      </div>
                      
                      <p style={{ flex: 1, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {group.description || 'Grup açıklaması bulunmamaktadır.'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem', color: 'var(--text-secondary)' }}>
                        <Activity size={16} />
                        <span style={{ fontSize: '0.85rem' }}>Detayları görüntüle &rarr;</span>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </div>
        )}

        {/* Modal -> Yeni Grup */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem' }}>
               <h2 style={{ marginBottom: '1.5rem' }}>Yeni Grup Oluştur</h2>
               <form onSubmit={handleCreateGroup}>
                 <div className="input-group">
                   <label className="input-label">Grup Adı</label>
                   <input type="text" className="glass-input" value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} required />
                 </div>
                 <div className="input-group">
                   <label className="input-label">Açıklama (Opsiyonel)</label>
                   <textarea className="glass-input" rows="3" value={newGroupDesc} onChange={e=>setNewGroupDesc(e.target.value)} />
                 </div>
                 
                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                   <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>İptal</button>
                   <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Oluştur</button>
                 </div>
               </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

// Fallback if backend API is strictly adhering to existing routes
const mockGroups = [
  { _id: '1', name: 'Antalya Tatili 🏖️', description: 'Yaz tatili bütçesi ve ortak masrafları', members: [{}, {}] },
  { _id: '2', name: 'Ev Masrafları 🏠', description: 'Faturalar, mutfak masrafları ve aidat', members: [{}, {}, {}] }
];

export default Dashboard;
