import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Camera, Users, Trash2, Edit3, UserPlus, LogOut, Receipt, Plus, SplitSquareHorizontal, Calculator, Wallet, ArrowRight } from 'lucide-react';

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
  
  const [memberTab, setMemberTab] = useState('registered'); // 'registered' or 'guest'
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('');
  const [expCurrency, setExpCurrency] = useState('TRY');

  const currencySymbols = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };

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
         currency: expCurrency,
         paidById: expPaidBy || undefined
      });
      setManualExpenseModal(false);
      setExpTitle('');
      setExpAmount('');
      setExpPaidBy('');
      setExpCurrency('TRY');
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

  const addGuest = async (e) => {
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
             <div style={{textAlign:'center', padding:'3rem'}}>Yükleniyor...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Top Info Banner */}
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   {group.name}
                   {isOwner && (
                     <button onClick={() => { setEditName(group.name); setEditDesc(group.description); setEditModal(true); }} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', border: 'none' }} title="Düzenle">
                       <Edit3 size={18} />
                     </button>
                   )}
                </h1>
                <p>{group.description}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={leaveGroup} className="btn btn-outline" style={{ color: 'var(--text-secondary)' }}>
                  <LogOut size={18} /> {isOwner ? 'Yetki Devret' : 'Ayrıl'}
                </button>
                {isOwner && (
                  <button onClick={deleteGroup} className="btn btn-danger">
                    <Trash2 size={18} /> Grubu Sil
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
               
               {/* Left Column: Expenses */}
               <div className="glass-panel animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                   <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                     <Receipt size={24} color="var(--primary-color)"/> Fişler ve Harcamalar
                   </h2>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setManualExpenseModal(true)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <Plus size={18} /> Manuel Gider
                      </button>
                      <button onClick={() => setAiModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <Camera size={18} /> AI Fiş Tara
                      </button>
                   </div>
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
                             <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => navigate(`/expenses/${expense._id}`)}>
                               <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>{expense.title}</h3>
                               <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  Ödeyen: {expense.paidById?.firstName} {expense.paidById?.lastName} • {new Date(expense.createdAt).toLocaleDateString('tr-TR')}
                               </span>
                               {expense.receiptData && expense.receiptData.confidenceScore && (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                                   <Camera size={14} /> AI Güven Skoru: %{expense.receiptData.confidenceScore}
                                 </div>
                               )}
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                               <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                 {currencySymbols[expense.currency] || '₺'}{expense.totalAmount}
                               </div>
                               {expense.items?.length === 1 && (
                                 <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={(e) => openQuickSplit(e, expense)}>
                                   <SplitSquareHorizontal size={16} /> Bölüştür
                                 </button>
                               )}
                               <button onClick={(e) => handleDeleteExpense(e, expense._id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }} title="Harcamayı Sil">
                                 <Trash2 size={16} />
                               </button>
                             </div>
                         </div>
                      ))}
                   </div>
                 )}
               </div>

               {/* Right Column: Members */}
               <div className="glass-panel animate-fade-in" style={{ padding: '2rem', alignSelf: 'start', animationDelay: '0.2s' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.3rem' }}>
                      <Users size={20} color="var(--secondary-color)"/> Üyeler ({members.length})
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleCalculateGroupDebts} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success-color)', borderColor: 'var(--success-color)' }}>
                        <Calculator size={16} /> Grup Hesaplaşması
                      </button>
                      <button onClick={() => setMemberModal(true)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <UserPlus size={16} /> Davet
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {members.map((member, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {(member.user?.firstName?.[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: '500', fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{member.guestName || `${member.user?.firstName} ${member.user?.lastName}`}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                            {member.role === 'owner' ? 'Kurucu' : (member.role === 'guest' ? 'Misafir' : member.role)}
                            {member.user && <span style={{color: 'rgba(255,255,255,0.4)', marginLeft:'5px'}}>{member.user?._id?.substring(0,6)}...</span>}
                          </div>
                        </div>
                        {isOwner && member.role !== 'owner' && (
                          <button onClick={() => kickMember(member._id)} style={{ background: 'none', border:'none', color: 'var(--danger-color)', cursor: 'pointer' }} title="Gruptan Çıkar">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {members.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Üye listesi bulunamadı.</p>}
                  </div>
               </div>

            </div>
          </div>
        )}
      </div>

      {/* Manual Expense Modal */}
      {manualExpenseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '450px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
             <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Receipt size={24} color="var(--primary-color)" /> Manuel Gider Ekle</h2>
             <form onSubmit={createManualExpense}>
               <div className="input-group">
                 <label className="input-label">Neye Harcandı?</label>
                 <input type="text" className="glass-input" placeholder="Örn: Akşam Yemeği" value={expTitle} onChange={e=>setExpTitle(e.target.value)} required />
               </div>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="input-group" style={{ flex: 3 }}>
                    <label className="input-label">Toplam Tutar</label>
                    <input type="number" step="0.01" className="glass-input" placeholder="Örn: 250" value={expAmount} onChange={e=>setExpAmount(e.target.value)} required />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Birim</label>
                    <select className="glass-input" value={expCurrency} onChange={e=>setExpCurrency(e.target.value)} style={{ cursor: 'pointer' }}>
                      <option value="TRY">₺ TRY</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </select>
                  </div>
                </div>
               
               <div className="input-group">
                 <label className="input-label" style={{ marginBottom: '0.75rem' }}>Bu harcamayı kim ödedi?</label>
                 <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {members.map((m, idx) => {
                     const uId = m.user?._id || m._id;
                     const isSelected = expPaidBy === uId;
                     return (
                       <div key={idx} onClick={() => setExpPaidBy(uId)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem', background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0,0,0,0.2)', border: isSelected ? '1px solid var(--primary-color)' : '1px solid transparent', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                         <input type="radio" name="paidBy" checked={isSelected} readOnly style={{ width: '16px', height: '16px' }} />
                         <div style={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '0.9rem' }}>
                           {m.guestName || `${m.user?.firstName} ${m.user?.lastName}`}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setManualExpenseModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Ekle</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* AI Scanner Modal */}
      {aiModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '500px', padding: '2rem' }}>
             <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Camera size={24} color="var(--secondary-color)" /> Fiş/Fatura Tara (Yapay Zeka)</h2>
             <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fişinizin veya faturanızın fotoğrafını yükleyin. Yapay zeka restoran adını, tutarı ve ürünleri otomatik olarak tespit edecektir.</p>
             
             {scanResult ? (
                <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }}>Başarıyla Analiz Edildi!</h4>
                  <ul style={{ listStyle:'none', padding:0, fontSize:'0.9rem' }}>
                     <li><strong>Başlık:</strong> {scanResult.title}</li>
                     <li><strong>Toplam Tutar:</strong> ₺{scanResult.totalAmount}</li>
                     {scanResult.receiptData?.ocrText && (
                        <li><strong>Okunan Metin:</strong> {scanResult.receiptData.ocrText.substring(0,60)}...</li>
                     )}
                  </ul>
                </div>
             ) : (
             <form onSubmit={scanReceipt}>
               <input type="file" ref={receiptInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleReceiptFileSelect} />
               
               <div 
                 onClick={() => receiptInputRef.current?.click()}
                 style={{ 
                   border: '2px dashed var(--surface-border)', borderRadius: '12px', 
                   padding: receiptPreview ? '0.5rem' : '2.5rem 1rem', textAlign: 'center', 
                   cursor: 'pointer', transition: 'all 0.3s',
                   background: receiptPreview ? 'rgba(0,0,0,0.2)' : 'rgba(99, 102, 241, 0.05)',
                   marginBottom: '1rem'
                 }}
               >
                 {receiptPreview ? (
                   <div>
                     <img src={receiptPreview} alt="Fiş önizleme" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', objectFit: 'contain' }} />
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Değiştirmek için tıklayın</p>
                   </div>
                 ) : (
                   <div>
                     <Camera size={40} color="var(--primary-color)" style={{ marginBottom: '0.75rem' }} />
                     <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Fiş/Fatura Resmi Yükle</p>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>JPG, PNG veya WebP • Maks 5MB</p>
                   </div>
                 )}
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => {setAiModal(false); setScanResult(null); setReceiptFile(null); setReceiptPreview(null); }}>İptal</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={scanning || !receiptFile}>
                   {scanning ? 'Analiz Ediliyor...' : 'Tarat ve Ekle'}
                 </button>
               </div>
             </form>
             )}
             {scanResult && (
               <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {setAiModal(false); navigate(`/expenses/${scanResult._id}`); }}>Fişin İçine Gir ve Ürünleri Bölüştür &rarr;</button>
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
             <h2 style={{ marginBottom: '1rem' }}>Üye Ekle</h2>
             
             <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
               <button onClick={() => setMemberTab('registered')} style={{ background: 'none', border: 'none', color: memberTab === 'registered' ? 'var(--primary-color)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: memberTab === 'registered' ? 'bold' : 'normal', borderBottom: memberTab === 'registered' ? '2px solid var(--primary-color)' : 'none', paddingBottom: '0.25rem' }}>Kayıtlı Kullanıcı</button>
               <button onClick={() => setMemberTab('guest')} style={{ background: 'none', border: 'none', color: memberTab === 'guest' ? 'var(--primary-color)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: memberTab === 'guest' ? 'bold' : 'normal', borderBottom: memberTab === 'guest' ? '2px solid var(--primary-color)' : 'none', paddingBottom: '0.25rem' }}>Kayıtsız Misafir</button>
             </div>

             {memberTab === 'registered' ? (
               <form onSubmit={addMember}>
                 <div className="input-group">
                   <label className="input-label">Kullanıcı E-posta Adresi</label>
                   <input type="email" className="glass-input" placeholder="ali@gmail.com" value={newMemberEmail} onChange={e=>setNewMemberEmail(e.target.value)} required />
                 </div>
                 
                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                   <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMemberModal(false)}>İptal</button>
                   <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Davet Et</button>
                 </div>
               </form>
             ) : (
               <form onSubmit={addGuest}>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Arkadaşınızın sisteme kaydolmasına gerek kalmadan bir misafir profili ekleyin.</p>
                 <div className="input-group">
                   <label className="input-label">Misafir Adı ve Soyadı</label>
                   <input type="text" className="glass-input" placeholder="Örn: Ayşe Yılmaz" value={newGuestName} onChange={e=>setNewGuestName(e.target.value)} required />
                 </div>
                 
                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                   <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMemberModal(false)}>İptal</button>
                   <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Misafir Ekle</button>
                 </div>
               </form>
             )}
          </div>
        </div>
      )}

      {/* Quick Split Modal */}
      {quickSplitModal && selectedExpenseForSplit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem' }}>
             <h2 style={{ marginBottom: '0.5rem' }}>Hızlı Bölüştür</h2>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
               {selectedExpenseForSplit.title} <strong>(₺{selectedExpenseForSplit.totalAmount})</strong> adlı gidere kimlerin ne kadar dahil olacağını buradan hızlıca seçin.
             </p>
             
             <form onSubmit={handleQuickSplitSubmit}>
               <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                 {members.map((m, idx) => {
                   const u = m.user;
                   const isSelected = selectedSplitUserIds.includes(u._id);
                   return (
                     <div key={idx} onClick={() => toggleUserInSplit(u._id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0,0,0,0.2)', border: isSelected ? '1px solid var(--primary-color)' : '1px solid transparent', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                       <input type="checkbox" checked={isSelected} readOnly style={{ width: '18px', height: '18px' }} />
                       <div style={{ flex: 1, fontWeight: isSelected ? 'bold' : 'normal' }}>
                         {u.firstName} {u.lastName}
                       </div>
                     </div>
                   );
                 })}
               </div>
               
               <div style={{ display: 'flex', gap: '1rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setQuickSplitModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Kaydet</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Group Debts (Settlement) Modal */}
      {groupDebtsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '550px', padding: '2rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
             <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)' }}>
               <Wallet size={24} /> Genel Borç Optimizasyonu
             </h2>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
               Gruptaki tüm harcamalar optimize edilerek en az transfer ile hesaplaşma listesi oluşturulmuştur.
             </p>
             
             <div style={{ overflowY: 'auto', flex: 1, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {groupDebts.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Tebrikler! Kimsenin kimseye borcu kalmamış veya henüz hiçbir gider eklenmemiş. 🎉
                 </div>
               ) : (
                 groupDebts.map((debt, idx) => {
                   const debtorMember = members.find(m => (m.user?._id || m._id) === debt.from);
                   const creditorMember = members.find(m => (m.user?._id || m._id) === debt.to);
                   
                   const debtorName = debtorMember ? (debtorMember.guestName || `${debtorMember.user?.firstName} ${debtorMember.user?.lastName}`) : "Bilinmeyen";
                   const creditorName = creditorMember ? (creditorMember.guestName || `${creditorMember.user?.firstName} ${creditorMember.user?.lastName}`) : "Bilinmeyen";
                   const sym = currencySymbols[debt.currency] || '₺';
                   
                   return (
                     <div key={idx} className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderLeft: '4px solid var(--primary-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 'bold' }}>{debtorName}</span>
                          <ArrowRight size={16} color="var(--text-secondary)" />
                          <span style={{ fontWeight: 'bold' }}>{creditorName}</span>
                          {debt.currency && debt.currency !== 'TRY' && <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>{debt.currency}</span>}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            {sym}{debt.amount.toFixed(2)}
                          </div>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success-color)', borderColor: 'var(--success-color)', whiteSpace: 'nowrap' }}
                            onClick={async () => {
                              if(!window.confirm(`${debtorName} → ${creditorName} arasındaki ${sym}${debt.amount.toFixed(2)} borç kapatılsın mı?`)) return;
                              try {
                                await api.post(`/groups/${groupId}/settle`, { paidBy: debt.from, paidTo: debt.to, amount: debt.amount, currency: debt.currency || 'TRY' });
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
             
             <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setGroupDebtsModal(false)}>Kapat</button>
          </div>
        </div>
      )}

    </>
  );
};

export default GroupDetail;
