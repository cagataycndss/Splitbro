import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Camera, Users, Trash2, Edit3, UserPlus, LogOut, Receipt, Plus, SplitSquareHorizontal, Calculator, Wallet, ArrowRight, X, Sparkles, UserCheck } from 'lucide-react';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState({ name: 'Yükleniyor...', description: '', owner: '' });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [aiModal, setAiModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [manualExpenseModal, setManualExpenseModal] = useState(false);
  const [quickSplitModal, setQuickSplitModal] = useState(false);
  const [groupDebtsModal, setGroupDebtsModal] = useState(false);

  const [groupDebts, setGroupDebts] = useState([]);

  const [selectedExpenseForSplit, setSelectedExpenseForSplit] = useState(null);
  const [selectedSplitUserIds, setSelectedSplitUserIds] = useState([]);

  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const receiptInputRef = useRef(null);
  
  const [memberTab, setMemberTab] = useState('registered'); // 'registered' veya 'guest'
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newGuestName, setNewGuestName] = useState('');

  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      const data = res.data?.data;
      if (data) {
         setGroup(data.group);
         setMembers(data.group.members || []);
         setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error('Grup verisi çekilemedi:', err);
      if (err.response?.status === 404) {
          navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const handleReceiptFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Sadece resim dosyaları yüklenebilir!'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Dosya boyutu 5MB\'dan küçük olmalıdır!'); return; }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const scanReceipt = async (e) => {
    e.preventDefault();
    if (!receiptFile) { alert('Lütfen bir fiş/fatura resmi seçin.'); return; }
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      const res = await api.post(`/groups/${groupId}/expenses/scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScanResult(res.data?.data?.expense || res.data);
      setReceiptFile(null);
      setReceiptPreview(null);
      fetchData();
    } catch (err) {
      alert("Fatura okunurken hata: " + (err.response?.data?.message || err.message));
    } finally {
      setScanning(false);
    }
  };

  const createManualExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/groups/${groupId}/expenses`, {
         title: expTitle,
         totalAmount: Number(expAmount),
         paidById: expPaidBy || undefined
      });
      setManualExpenseModal(false);
      setExpTitle('');
      setExpAmount('');
      setExpPaidBy('');
      fetchData();
    } catch (error) {
       alert("Gider eklenemedi: " + (error.response?.data?.message || error.message));
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
       await api.post(`/groups/${groupId}/members`, { email: newMemberEmail, role: 'member' });
       setMemberModal(false);
       setNewMemberEmail('');
       fetchData();
    } catch (error) {
       alert("Üye eklenemedi: " + (error.response?.data?.message || 'Geçici hata'));
    }
  };

  const addGuestMember = async (e) => {
    e.preventDefault();
    try {
       await api.post(`/groups/${groupId}/members/guest`, { guestName: newGuestName });
       setMemberModal(false);
       setNewGuestName('');
       fetchData();
    } catch (error) {
       alert("Misafir eklenemedi: " + (error.response?.data?.message || 'Geçici hata'));
    }
  };

  const deleteGroup = async () => {
    if(!window.confirm("Bu grubu tamamen silmek istediğinize emin misiniz? (Tüm harcamalar silinir)")) return;
    try {
      await api.delete(`/groups/${groupId}`);
      navigate('/dashboard');
    } catch (error) {
      alert("Grup silinemedi. " + (error.response?.data?.message || 'Grup sahibi olmanız gerekmektedir.'));
    }
  };

  const updateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/groups/${groupId}`, { name: editName, description: editDesc });
      setGroup(prev => ({ ...prev, name: editName, description: editDesc }));
      setEditModal(false);
    } catch (error) {
      alert("Güncellenemedi. " + (error.response?.data?.message || 'Yetki yok'));
    }
  };

  const leaveGroup = async () => {
    if(!window.confirm("Gruptan ayrılmak istediğinize emin misiniz?")) return;
    try {
      const myId = user.id || user._id;
      await api.delete(`/groups/${groupId}/members/${myId}`);
      navigate('/dashboard');
    } catch (error) {
      alert("Ayrılamazsınız. " + (error.response?.data?.message || 'Grupun sahibi olamazsınız.'));
    }
  };

  const kickMember = async (memberId) => {
    if(!window.confirm("Bu üyeyi çıkartmak istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      fetchData();
    } catch (error) {
      alert("Çıkarılamadı. " + (error.response?.data?.message || 'Yetki yok'));
    }
  };

  const handleCalculateGroupDebts = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/calculate`);
      setGroupDebts(res.data?.data || res.data);
      setGroupDebtsModal(true);
    } catch (error) {
      alert("Grup borçları hesaplanamadı: " + (error.response?.data?.message || 'Geçici hata'));
    }
  };

  const handleDeleteExpense = async (e, expenseId) => {
    e.preventDefault();
    e.stopPropagation();
    if(!window.confirm("Bu harcamayı silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchData();
    } catch (error) {
      alert("Silinemedi: " + (error.response?.data?.message || ''));
    }
  };

  const openQuickSplit = (e, expense) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedExpenseForSplit(expense);
    const item = expense.items[0];
    setSelectedSplitUserIds(item.assignedUserIds.map(u => typeof u === 'string' ? u : (u._id || u.id)));
    setQuickSplitModal(true);
  };

  const toggleUserInSplit = (userId) => {
    setSelectedSplitUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleQuickSplitSubmit = async (e) => {
    e.preventDefault();
    try {
      const expId = selectedExpenseForSplit._id;
      const itemId = selectedExpenseForSplit.items[0]._id;
      await api.post(`/expenses/${expId}/items/${itemId}/split`, {
         assignedUserIds: selectedSplitUserIds
      });
      setQuickSplitModal(false);
      fetchData();
    } catch (error) {
      alert("Hızlı bölüştürme başarısız: " + (error.response?.data?.message || ''));
    }
  };

  const isOwner = group.owner === (user?.id || user?._id);

  return (
    <>
      <Header />
      <div className="app-container">
        {loading ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Yükleniyor...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Info Banner */}
            <div className="glass-panel animate-fade-in" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                   {group.name}
                   {isOwner && (
                     <button 
                       onClick={() => { setEditName(group.name); setEditDesc(group.description); setEditModal(true); }} 
                       className="btn btn-outline btn-sm" 
                       style={{ padding: '0.35rem', border: 'none', background: 'rgba(255,255,255,0.05)' }} 
                       title="Düzenle"
                     >
                       <Edit3 size={16} />
                     </button>
                   )}
                </h1>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{group.description || 'Açıklama yok'}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={leaveGroup} className="btn btn-outline btn-sm" style={{ color: 'var(--text-secondary)' }}>
                  <LogOut size={16} /> {isOwner ? 'Yetki Devret' : 'Ayrıl'}
                </button>
                {isOwner && (
                  <button onClick={deleteGroup} className="btn btn-danger btn-sm">
                    <Trash2 size={16} /> Grubu Sil
                  </button>
                )}
              </div>
            </div>

            {/* Main Responsive Grid */}
            <div className="grid-responsive-2">
               
               {/* Left Column: Expenses */}
               <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
                 <div className="flex-between-responsive" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                   <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.3rem' }}>
                     <Receipt size={22} color="var(--primary-color)"/> Harcamalar
                   </h2>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setManualExpenseModal(true)} className="btn btn-outline btn-sm">
                        <Plus size={16} /> Manuel Gider
                      </button>
                      <button onClick={() => setAiModal(true)} className="btn btn-gradient btn-sm">
                        <Camera size={16} /> AI Fiş Tara
                      </button>
                   </div>
                 </div>
                 
                 {expenses.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
                      <Camera size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
                      <p style={{ fontWeight: '600' }}>Henüz harcama eklenmedi.</p>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.35rem', maxWidth: '360px', margin: '0.35rem auto 0' }}>
                        Yapay zeka ile fişinizi tarayabilir veya manuel harcama ekleyebilirsiniz.
                      </p>
                   </div>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {expenses.map((expense, i) => (
                        <div key={i} className="glass-card" style={{ padding: '1.15rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                             <div style={{ cursor: 'pointer', flex: '1 1 200px' }} onClick={() => navigate(`/expenses/${expense._id}`)}>
                               <h3 style={{ margin: 0, marginBottom: '0.2rem', fontSize: '1.05rem' }}>{expense.title}</h3>
                               <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  Ödeyen: {expense.paidById?.firstName} {expense.paidById?.lastName} • {new Date(expense.createdAt).toLocaleDateString('tr-TR')}
                               </span>
                               {expense.receiptData && expense.receiptData.confidenceScore && (
                                 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', marginLeft: '0.5rem' }} className="badge badge-success">
                                   <Camera size={12} /> AI Güven: %{expense.receiptData.confidenceScore}
                                 </div>
                               )}
                             </div>
                             
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'nowrap' }}>
                               <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                                 ₺{expense.totalAmount}
                               </div>
                               {expense.items?.length === 1 && (
                                 <button className="btn btn-outline btn-sm" onClick={(e) => openQuickSplit(e, expense)}>
                                   <SplitSquareHorizontal size={14} /> Bölüştür
                                 </button>
                               )}
                               <button 
                                 onClick={(e) => handleDeleteExpense(e, expense._id)} 
                                 className="btn btn-danger btn-sm" 
                                 style={{ padding: '0.4rem', minHeight: 'auto' }} 
                                 title="Sil"
                               >
                                 <Trash2 size={15} />
                               </button>
                             </div>
                         </div>
                      ))}
                   </div>
                 )}
               </div>

               {/* Right Column: Members & Settlement */}
               <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', alignSelf: 'start', animationDelay: '0.2s' }}>
                   <div className="flex-between-responsive" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.25rem' }}>
                      <Users size={20} color="var(--secondary-color)"/> Üyeler ({members.length})
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleCalculateGroupDebts} className="btn btn-success btn-sm">
                        <Calculator size={15} /> Hesaplaş
                      </button>
                      <button onClick={() => setMemberModal(true)} className="btn btn-outline btn-sm">
                        <UserPlus size={15} /> Davet
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {members.map((member, i) => (
                      <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem' }}>
                        <div style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          background: 'var(--accent-gradient)', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', fontWeight: '700',
                          color: '#fff', fontSize: '0.9rem', flexShrink: 0
                        }}>
                          {(member.user?.firstName?.[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {member.user?.firstName} {member.user?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {member.role === 'owner' ? (
                              <span className="badge badge-primary">Kurucu</span>
                            ) : member.user?.lastName === '(Misafir)' ? (
                              <span className="badge badge-warning">Misafir</span>
                            ) : (
                              <span className="badge badge-success">Üye</span>
                            )}
                          </div>
                        </div>
                        {isOwner && member.role !== 'owner' && (
                          <button onClick={() => kickMember(member.user._id)} style={{ background: 'none', border:'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '0.25rem' }} title="Gruptan Çıkar">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {members.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Üye bulunamadı.</p>}
                  </div>
               </div>

            </div>
          </div>
        )}
      </div>

      {/* Manual Expense Modal */}
      {manualExpenseModal && (
        <div className="modal-overlay" onClick={() => setManualExpenseModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
               <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.25rem' }}>
                 <Receipt size={22} color="var(--primary-color)" /> Manuel Gider Ekle
               </h2>
               <button onClick={() => setManualExpenseModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>
             
             <form onSubmit={createManualExpense}>
               <div className="input-group">
                 <label className="input-label">Neye Harcandı?</label>
                 <input type="text" className="glass-input" placeholder="Örn: Akşam Yemeği" value={expTitle} onChange={e=>setExpTitle(e.target.value)} required />
               </div>
               <div className="input-group">
                 <label className="input-label">Toplam Tutar (₺)</label>
                 <input type="number" step="0.01" className="glass-input" placeholder="Örn: 250" value={expAmount} onChange={e=>setExpAmount(e.target.value)} required />
               </div>
               
               <div className="input-group">
                 <label className="input-label" style={{ marginBottom: '0.5rem' }}>Bu harcamayı kim ödedi?</label>
                 <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                   {members.map((m, idx) => {
                     const u = m.user;
                     const isSelected = expPaidBy === u._id;
                     return (
                       <div 
                         key={idx} 
                         onClick={() => setExpPaidBy(u._id)} 
                         style={{ 
                           display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', 
                           background: isSelected ? 'var(--primary-light)' : 'rgba(255,255,255,0.03)', 
                           border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--surface-border)', 
                           borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' 
                         }}
                       >
                         <input type="radio" name="paidBy" checked={isSelected} readOnly style={{ width: '16px', height: '16px' }} />
                         <div style={{ fontWeight: isSelected ? '700' : '500', fontSize: '0.9rem' }}>
                           {u.firstName} {u.lastName}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setManualExpenseModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-gradient" style={{ flex: 1 }}>Ekle</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* AI Scanner Modal */}
      {aiModal && (
        <div className="modal-overlay" onClick={() => { setAiModal(false); setScanResult(null); setReceiptFile(null); setReceiptPreview(null); }}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.25rem' }}>
                 <Sparkles size={22} color="var(--accent-color)" /> Yapay Zeka ile Fiş Tara
               </h2>
               <button onClick={() => { setAiModal(false); setScanResult(null); setReceiptFile(null); setReceiptPreview(null); }} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>
             
             <p style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
               Fişinizin fotoğrafını yükleyin. Yapay zeka tutarı ve kalemleri otomatik tespit eder.
             </p>
             
             {scanResult ? (
                <div className="alert-box alert-success" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <h4 style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }}>Başarıyla Analiz Edildi!</h4>
                  <div style={{ fontSize: '0.9rem' }}>
                     <div><strong>Başlık:</strong> {scanResult.title}</div>
                     <div><strong>Toplam Tutar:</strong> ₺{scanResult.totalAmount}</div>
                  </div>
                  <button className="btn btn-gradient" style={{ width: '100%', marginTop: '1rem' }} onClick={() => {setAiModal(false); navigate(`/expenses/${scanResult._id}`); }}>
                    Detayları Görüntüle ve Bölüştür &rarr;
                  </button>
                </div>
             ) : (
             <form onSubmit={scanReceipt}>
               <input type="file" ref={receiptInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleReceiptFileSelect} />
               
               <div 
                 onClick={() => receiptInputRef.current?.click()}
                 style={{ 
                   border: '2px dashed var(--surface-border-glow)', borderRadius: 'var(--radius-md)', 
                   padding: receiptPreview ? '0.5rem' : '2rem 1rem', textAlign: 'center', 
                   cursor: 'pointer', transition: 'all 0.3s',
                   background: receiptPreview ? 'rgba(0,0,0,0.2)' : 'var(--primary-light)',
                   marginBottom: '1rem'
                 }}
               >
                 {receiptPreview ? (
                   <div>
                     <img src={receiptPreview} alt="Fiş önizleme" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Değiştirmek için tıklayın</p>
                   </div>
                 ) : (
                   <div>
                     <Camera size={36} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
                     <p style={{ fontWeight: '700', marginBottom: '0.2rem' }}>Fiş veya Fatura Seçin</p>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>JPG, PNG, WebP • Maks 5MB</p>
                   </div>
                 )}
               </div>
               
               <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => {setAiModal(false); setScanResult(null); setReceiptFile(null); setReceiptPreview(null); }}>İptal</button>
                 <button type="submit" className="btn btn-gradient" style={{ flex: 1 }} disabled={scanning || !receiptFile}>
                   {scanning ? 'Analiz Ediliyor...' : 'Tarat ve Ekle'}
                 </button>
               </div>
             </form>
             )}
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
               <h2>Grubu Düzenle</h2>
               <button onClick={() => setEditModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>
             <form onSubmit={updateGroup}>
               <div className="input-group">
                 <label className="input-label">Grup Adı</label>
                 <input type="text" className="glass-input" value={editName} onChange={e=>setEditName(e.target.value)} required />
               </div>
               <div className="input-group">
                 <label className="input-label">Açıklama</label>
                 <textarea className="glass-input" rows="3" value={editDesc} onChange={e=>setEditDesc(e.target.value)} />
               </div>
               
               <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-gradient" style={{ flex: 1 }}>Kaydet</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Add Member / Guest Modal */}
      {memberModal && (
        <div className="modal-overlay" onClick={() => setMemberModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Gruba Üye Ekle</h2>
               <button onClick={() => setMemberModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>

             {/* Tab Selector */}
             <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
               <button 
                 type="button"
                 className={`btn btn-sm ${memberTab === 'registered' ? 'btn-primary' : 'btn-outline'}`}
                 style={{ flex: 1, border: 'none' }}
                 onClick={() => setMemberTab('registered')}
               >
                 <UserPlus size={15} /> Kayıtlı Üye
               </button>
               <button 
                 type="button"
                 className={`btn btn-sm ${memberTab === 'guest' ? 'btn-primary' : 'btn-outline'}`}
                 style={{ flex: 1, border: 'none' }}
                 onClick={() => setMemberTab('guest')}
               >
                 <UserCheck size={15} /> Misafir Üye
               </button>
             </div>

             {memberTab === 'registered' ? (
               <form onSubmit={addMember}>
                 <div className="input-group">
                   <label className="input-label">E-posta Adresi</label>
                   <input type="email" className="glass-input" placeholder="Arkadaşınızın SplitBro e-postası" value={newMemberEmail} onChange={e=>setNewMemberEmail(e.target.value)} required />
                 </div>
                 
                 <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                   <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMemberModal(false)}>İptal</button>
                   <button type="submit" className="btn btn-gradient" style={{ flex: 1 }}>Davet Et</button>
                 </div>
               </form>
             ) : (
               <form onSubmit={addGuestMember}>
                 <div className="input-group">
                   <label className="input-label">Misafir Adı</label>
                   <input type="text" className="glass-input" placeholder="Örn: Mehmet Ali, Ahmet" value={newGuestName} onChange={e=>setNewGuestName(e.target.value)} required />
                 </div>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                   Sisteme kayıtlı olmayan kişiler için hızlıca hesapsız bir misafir profili oluşturabilirsiniz.
                 </p>
                 
                 <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                   <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMemberModal(false)}>İptal</button>
                   <button type="submit" className="btn btn-gradient" style={{ flex: 1 }}>Misafir Ekle</button>
                 </div>
               </form>
             )}
          </div>
        </div>
      )}

      {/* Quick Split Modal */}
      {quickSplitModal && selectedExpenseForSplit && (
        <div className="modal-overlay" onClick={() => setQuickSplitModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h2>Hızlı Bölüştür</h2>
               <button onClick={() => setQuickSplitModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
               <strong>{selectedExpenseForSplit.title}</strong> (₺{selectedExpenseForSplit.totalAmount}) harcamasına dahil olan kişileri seçin.
             </p>
             
             <form onSubmit={handleQuickSplitSubmit}>
               <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                 {members.map((m, idx) => {
                   const u = m.user;
                   const isSelected = selectedSplitUserIds.includes(u._id);
                   return (
                     <div 
                       key={idx} 
                       onClick={() => toggleUserInSplit(u._id)} 
                       style={{ 
                         display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', 
                         background: isSelected ? 'var(--primary-light)' : 'rgba(255,255,255,0.03)', 
                         border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--surface-border)', 
                         borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' 
                       }}
                     >
                       <input type="checkbox" checked={isSelected} readOnly style={{ width: '18px', height: '18px' }} />
                       <div style={{ flex: 1, fontWeight: isSelected ? '700' : '500', fontSize: '0.9rem' }}>
                         {u.firstName} {u.lastName}
                       </div>
                     </div>
                   );
                 })}
               </div>
               
               <div style={{ display: 'flex', gap: '0.75rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setQuickSplitModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-gradient" style={{ flex: 1 }}>Kaydet</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Group Debts (Settlement) Modal */}
      {groupDebtsModal && (
        <div className="modal-overlay" onClick={() => setGroupDebtsModal(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', margin: 0, fontSize: '1.25rem' }}>
                 <Wallet size={24} /> Borç Optimizasyonu
               </h2>
               <button onClick={() => setGroupDebtsModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>
             
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
               En az işlemle ödeşme hesabı yapılmıştır.
             </p>
             
             <div style={{ overflowY: 'auto', maxHeight: '350px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {groupDebts.length === 0 ? (
                 <div className="alert-box alert-success" style={{ textAlign: 'center', justifyContent: 'center' }}>
                    Tebrikler! Kimsenin kimseye borcu kalmamış. 🎉
                 </div>
               ) : (
                 groupDebts.map((debt, idx) => {
                   const debtorObj = members.find(m => m.user._id === debt.from)?.user;
                   const creditorObj = members.find(m => m.user._id === debt.to)?.user;
                   
                   const debtorName = debtorObj ? `${debtorObj.firstName} ${debtorObj.lastName}` : "Bilinmeyen";
                   const creditorName = creditorObj ? `${creditorObj.firstName} ${creditorObj.lastName}` : "Bilinmeyen";
                   
                   return (
                     <div key={idx} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', borderLeft: '4px solid var(--primary-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 180px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{debtorName}</span>
                          <ArrowRight size={16} color="var(--text-secondary)" />
                          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{creditorName}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                            ₺{debt.amount.toFixed(2)}
                          </div>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={async () => {
                              if(!window.confirm(`${debtorName} \u2192 ${creditorName} arasındaki \u20ba${debt.amount.toFixed(2)} borç kapatılsın mı?`)) return;
                              try {
                                await api.post(`/groups/${groupId}/settle`, { paidBy: debt.from, paidTo: debt.to, amount: debt.amount });
                                const res = await api.get(`/groups/${groupId}/calculate`);
                                setGroupDebts(res.data?.data || res.data);
                                fetchData();
                              } catch(err) {
                                alert("Ödeşme kaydedilemedi: " + (err.response?.data?.message || ''));
                              }
                            }}
                          >💳 Ödeştik</button>
                        </div>
                     </div>
                   );
                 })
               )}
             </div>
             
             <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setGroupDebtsModal(false)}>Kapat</button>
          </div>
        </div>
      )}

    </>
  );
};

export default GroupDetail;
