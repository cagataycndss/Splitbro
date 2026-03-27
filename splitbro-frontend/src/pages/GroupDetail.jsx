import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Camera, Users, Trash2, Edit3, UserPlus, Settings, LogOut, Receipt } from 'lucide-react';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState({ name: 'Yükleniyor...', description: '' });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [aiModal, setAiModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  // Form states
  const [imageUrl, setImageUrl] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const fetchData = async () => {
    try {
      // Members GET /api/v1/groups/:groupId/members
      const memRes = await api.get(`/groups/${groupId}/members`);
      setMembers(memRes.data?.data?.members || memRes.data || []);
      
      // Fallback details since backend might not have standalone GET /groups/:id
      // but let's try
      try {
         const groupRes = await api.get(`/groups/${groupId}`);
         setGroup(groupRes.data?.data?.group || groupRes.data);
      } catch (err) {
         setGroup({ name: 'SplitBro Grubu', description: 'Grup detayı' });
      }

    } catch (err) {
      console.error('Veri çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const scanReceipt = async (e) => {
    e.preventDefault();
    setScanning(true);
    try {
      // POST /api/v1/groups/:groupId/expenses/ai-scan
      const res = await api.post(`/groups/${groupId}/expenses/ai-scan`, { imageUrl });
      setScanResult(res.data?.data?.expense || res.data);
      setExpenses(prev => [...prev, res.data?.data?.expense || res.data]);
    } catch (err) {
      alert("Fatura okunurken hata: " + err.message);
    } finally {
      setScanning(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
       // Requires user ID, so if email is passed we need backend to support it or assume mock
       await api.post(`/groups/${groupId}/members`, { userId: newMemberEmail }); // In a real app we'd map email to ID
       setMemberModal(false);
       setNewMemberEmail('');
       fetchData();
    } catch (error) {
       alert("Üye eklenemedi.");
    }
  };

  const deleteGroup = async () => {
    if(!window.confirm("Bu grubu tamamen silmek istediğinize emin misiniz? (Tüm harcamalar silinir)")) return;
    try {
      await api.delete(`/groups/${groupId}`);
      navigate('/dashboard');
    } catch (error) {
      alert("Grup silinemedi. Grup sahibi olmanız gerekmektedir.");
    }
  };

  const updateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/groups/${groupId}`, { name: editName, description: editDesc });
      setGroup(prev => ({ ...prev, name: editName, description: editDesc }));
      setEditModal(false);
    } catch (error) {
      alert("Güncellenemedi.");
    }
  };

  const leaveGroup = async () => {
    if(!window.confirm("Gruptan ayrılmak istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/groups/${groupId}/leave`);
      navigate('/dashboard');
    } catch (error) {
      alert("Ayrılamazsınız. (Owner iseniz yetki devretmelisiniz)");
    }
  };

  return (
    <>
      <Header />
      <div className="app-container">
        {loading ? (
             <div style={{textAlign:'center', padding:'3rem'}}>Yükleniyor...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Top Info Banner */}
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   {group.name}
                   <button onClick={() => { setEditName(group.name); setEditDesc(group.description); setEditModal(true); }} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', border: 'none' }} title="Düzenle">
                     <Edit3 size={18} />
                   </button>
                </h1>
                <p>{group.description}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={leaveGroup} className="btn btn-outline" style={{ color: 'var(--text-secondary)' }}>
                  <LogOut size={18} /> Ayrıl
                </button>
                <button onClick={deleteGroup} className="btn btn-danger">
                  <Trash2 size={18} /> Grubu Sil
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
               
               {/* Left Column: Expenses */}
               <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                   <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                     <Receipt size={24} color="var(--primary-color)"/> Fişler ve Harcamalar
                   </h2>
                   <button onClick={() => setAiModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                     <Camera size={18} />
                     Yapay Zeka Fiş Tara
                   </button>
                 </div>
                 
                 {expenses.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                      <Camera size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p>Henüz harcama kaydedilmedi.</p>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Yapay zeka asistanı ile fişlerinizin fotoğrafını taratarak saniyeler içinde masraf ekleyebilirsiniz.</p>
                   </div>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {expenses.map((expense, i) => (
                        <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>{expense.title}</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ekleyen: Siz • {new Date(expense.date || Date.now()).toLocaleDateString('tr-TR')}</span>
                            {expense.receiptData && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                                <Camera size={14} /> AI Güven Skoru: %{expense.receiptData.confidenceScore || 98}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            ₺{expense.totalAmount}
                          </div>
                        </div>
                      ))}
                   </div>
                 )}
               </div>

               {/* Right Column: Members */}
               <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.3rem' }}>
                      <Users size={20} color="var(--secondary-color)"/> Üyeler ({members.length})
                    </h2>
                    <button onClick={() => setMemberModal(true)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      <UserPlus size={16} /> Davet
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {members.map((member, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {(member.user?.firstName?.[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{member.user?.firstName} {member.user?.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{member.role === 'owner' ? 'Kurucu' : member.role}</div>
                        </div>
                      </div>
                    ))}
                    {members.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Üye listesi bulunamadı.</p>}
                  </div>
               </div>

            </div>
          </div>
        )}
      </div>

      {/* AI Scanner Modal */}
      {aiModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '500px', padding: '2rem' }}>
             <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Camera size={24} color="var(--secondary-color)" /> Fiş/Fatura Tara (Yapay Zeka)</h2>
             <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Faturanın fotoğraf linkini veya görsel uzantısını yapıştırın. Yapay zeka tutarı ve sebebi otomatik ayrıştıracaktır.</p>
             
             {scanResult ? (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }}>Başarıyla Analiz Edildi!</h4>
                  <ul style={{ listStyle:'none', padding:0, fontSize:'0.9rem' }}>
                     <li><strong>Başlık:</strong> {scanResult.title}</li>
                     <li><strong>Toplam Tutar:</strong> ₺{scanResult.totalAmount}</li>
                     <li><strong>Okunan Metin:</strong> {scanResult.receiptData?.ocrText?.substring(0,40)}...</li>
                  </ul>
                </div>
             ) : (
             <form onSubmit={scanReceipt}>
               <div className="input-group">
                 <label className="input-label">Resim URL'si</label>
                 <input type="url" className="glass-input" placeholder="https://ornek.com/fatura.jpg" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} required />
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => {setAiModal(false); setScanResult(null); }}>İptal</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={scanning}>
                   {scanning ? 'Analiz Ediliyor...' : 'Tarat ve Ekle'}
                 </button>
               </div>
             </form>
             )}
             {scanResult && (
               <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {setAiModal(false); setScanResult(null);}}>Kapat ve Listeye Dön</button>
             )}
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem' }}>
             <h2 style={{ marginBottom: '1.5rem' }}>Grubu Düzenle</h2>
             <form onSubmit={updateGroup}>
               <div className="input-group">
                 <label className="input-label">Grup Adı</label>
                 <input type="text" className="glass-input" value={editName} onChange={e=>setEditName(e.target.value)} required />
               </div>
               <div className="input-group">
                 <label className="input-label">Açıklama</label>
                 <textarea className="glass-input" rows="3" value={editDesc} onChange={e=>setEditDesc(e.target.value)} />
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Kaydet</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {memberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem' }}>
             <h2 style={{ marginBottom: '1.5rem' }}>Grupa Üye Ekle</h2>
             <form onSubmit={addMember}>
               <div className="input-group">
                 <label className="input-label">Kullanıcı ID'si (Demo için)</label>
                 <input type="text" className="glass-input" value={newMemberEmail} onChange={e=>setNewMemberEmail(e.target.value)} required />
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMemberModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Ekle</button>
               </div>
             </form>
          </div>
        </div>
      )}

    </>
  );
};

export default GroupDetail;
