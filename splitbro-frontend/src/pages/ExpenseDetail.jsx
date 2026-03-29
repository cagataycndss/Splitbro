import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calculator, Plus, SplitSquareHorizontal, Sparkles, CheckCircle2, AlertTriangle, AlertCircle, ShoppingBag, Receipt, Users, Trash2 } from 'lucide-react';

const ExpenseDetail = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [expense, setExpense] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addItemModal, setAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  const [splitModal, setSplitModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [calcModal, setCalcModal] = useState(false);
  const [debts, setDebts] = useState([]);

  const [aiCatLoading, setAiCatLoading] = useState(false);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [aiPriceResult, setAiPriceResult] = useState(null);

  const fetchExpenseAndMembers = async () => {
    try {
      const expRes = await api.get(`/expenses/${expenseId}`);
      if (!expRes.data.data) { navigate('/dashboard'); return; }
      
      setExpense(expRes.data.data);

      const memRes = await api.get(`/groups/${expRes.data.data.groupId}/members`);
      setMembers(memRes.data.data?.members || memRes.data.data || memRes.data);
    } catch (err) {
      console.error(err);
      if(err.response?.status === 404) navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseAndMembers();
  }, [expenseId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/expenses/${expenseId}/items`, {
        name: newItemName,
        price: Number(newItemPrice),
        category: newItemCategory || 'Diğer'
      });
      setAddItemModal(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemCategory('');
      fetchExpenseAndMembers();
    } catch (error) {
      alert("Ürün eklenemedi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCategorizeWithAI = async () => {
    if(!newItemName) return alert("Önce ürün adını giriniz.");
    setAiCatLoading(true);
    try {
      const res = await api.post('/ai/item-categorization', { itemsList: [newItemName] });
      const cat = res.data?.data?.results?.[0]?.category || res.data?.results?.[0]?.category;
      if (cat) setNewItemCategory(cat);
    } catch (err) {
      alert("AI Sınıflandırma hatası.");
    } finally {
      setAiCatLoading(false);
    }
  };

  const handleVerifyPriceWithAI = async () => {
    if(!newItemName || !newItemPrice) return alert("Ürün adını ve fiyatını girmelisiniz.");
    setAiPriceLoading(true);
    setAiPriceResult(null);
    try {
      const res = await api.post('/ai/verify-price', { itemName: newItemName, price: Number(newItemPrice) });
      const analysis = res.data?.data?.analysis?.[0] || res.data?.analysis?.[0];
      if (analysis) {
        setAiPriceResult(analysis);
      }
    } catch (err) {
      alert("AI Anomali tespiti yapılamadı.");
    } finally {
      setAiPriceLoading(false);
    }
  };

  const openSplitModal = (item) => {
    setSelectedItem(item);
    setSelectedUserIds(item.assignedUserIds.map(u => typeof u === 'string' ? u : u._id));
    setSplitModal(true);
  };

  const toggleUserInSplit = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSplitSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/expenses/${expenseId}/items/${selectedItem._id}/split`, {
        assignedUserIds: selectedUserIds
      });
      setSplitModal(false);
      fetchExpenseAndMembers();
    } catch (error) {
       alert("Paylaştırılamadı: " + (error.response?.data?.message || ""));
    }
  };

  const handleCalculateDebts = async () => {
    try {
      const res = await api.get(`/expenses/${expenseId}/calculate`);
      setDebts(res.data?.data || res.data);
      setCalcModal(true);
    } catch (error) {
      alert("Hesaplanamadı: " + (error.response?.data?.message || ''));
    }
  };

  const handleDeleteItem = async (itemId) => {
    if(!window.confirm("Bu ürün kalemini silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/expenses/${expenseId}/items/${itemId}`);
      fetchExpenseAndMembers();
    } catch (error) {
       alert("Silinemedi: " + (error.response?.data?.message || ""));
    }
  };

  if (loading) return <div className="app-container" style={{textAlign:'center', marginTop: '50px'}}>Yükleniyor...</div>;
  if (!expense) return null;

  const isOwner = expense.paidById?._id === (user?.id || user?._id);

  return (
    <>
      <Header />
      <div className="app-container">
        <Link to={`/groups/${expense.groupId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Gruba Geri Dön
        </Link>

        {/* Header Info */}
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Receipt color="var(--primary-color)" /> {expense.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Ödeyen: <strong>{expense.paidById?.firstName} {expense.paidById?.lastName}</strong> • {new Date(expense.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Toplam Gider</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₺{expense.totalAmount}</div>
          </div>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn btn-primary" onClick={() => setAddItemModal(true)}>
            <Plus size={18} /> Yeni Ürün Ekle
          </button>
          <button className="btn btn-outline" style={{ border: '1px solid var(--success-color)', color: 'var(--success-color)' }} onClick={handleCalculateDebts}>
            <Calculator size={18} /> Borç Hesapla (AI)
          </button>
        </div>

        {/* Selected Items List */}
        <div className="glass-panel animate-fade-in">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingBag size={20}/> Satın Alınan Ürün Listesi</h2>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            {(!expense.items || expense.items.length === 0) ? (
              <p style={{ color: 'var(--text-secondary)' }}>Bu gidere henüz hiç spesifik ürün girilmemiş.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                 {expense.items.map((item, idx) => (
                   <div key={idx} className="glass-card" style={{ padding: '1.25rem', position: 'relative' }}>
                     <button onClick={() => handleDeleteItem(item._id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border:'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px' }} title="Ürünü Sil">
                       <Trash2 size={16} />
                     </button>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                       <div>
                         <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</div>
                         <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Kategori: {item.category}
                         </div>
                       
                         <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <Users size={14} /> Şunlar arasında bölüşülecek: 
                           {item.assignedUserIds?.length > 0 
                             ? item.assignedUserIds.map(u => typeof u === 'string' ? '(?id)' : u.firstName).join(', ') 
                             : 'Henüz kimse atanmadı'}
                         </div>
                       </div>

                       <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                         <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₺{item.price}</div>
                         <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openSplitModal(item)}>
                           <SplitSquareHorizontal size={16} /> Bölüştür
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ADD ITEM MODAL */}
      {addItemModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '450px', padding: '2rem' }}>
             <h2 style={{ marginBottom: '1.5rem' }}>Yeni Ürün Ekle</h2>
             <form onSubmit={handleAddItem}>
               <div className="input-group">
                 <label className="input-label">Ürün Adı</label>
                 <input type="text" className="glass-input" placeholder="Örn: 2 Kg Domates" value={newItemName} onChange={e=>setNewItemName(e.target.value)} required />
               </div>
               
               <div className="input-group">
                 <label className="input-label">Fiyat (₺)</label>
                 <input type="number" step="0.01" className="glass-input" placeholder="Örn: 85.50" value={newItemPrice} onChange={e=>setNewItemPrice(e.target.value)} required />
               </div>

               {/* AI TOOLS */}
               <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                 <button type="button" className="btn btn-outline" style={{ border: '1px solid var(--secondary-color)', color: 'var(--secondary-color)', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={handleCategorizeWithAI} disabled={aiCatLoading}>
                    <Sparkles size={14} /> {aiCatLoading ? 'AI Düşünüyor...' : 'Otomatik Kategorize Et (AI)'}
                 </button>
                 <button type="button" className="btn btn-outline" style={{ border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={handleVerifyPriceWithAI} disabled={aiPriceLoading}>
                    <AlertTriangle size={14} /> {aiPriceLoading ? 'AI İnceliyor...' : 'Fiyat Anomali Kontrolü (AI)'}
                 </button>
               </div>

               {aiPriceResult && (
                 <div style={{ background: aiPriceResult.isAnomalous ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                   {aiPriceResult.isAnomalous ? (
                     <div style={{ color: 'var(--danger-color)', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16}/> <strong>Anomali Tespit Edildi!</strong> {aiPriceResult.reason}</div>
                   ) : (
                     <div style={{ color: 'var(--success-color)', display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16}/> <strong>Mantıklı Fiyat!</strong> {aiPriceResult.reason}</div>
                   )}
                 </div>
               )}

               <div className="input-group">
                 <label className="input-label">Kategori</label>
                 <input type="text" className="glass-input" placeholder="Örn: Gıda, Eğlence..." value={newItemCategory} onChange={e=>setNewItemCategory(e.target.value)} />
               </div>
               
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setAddItemModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Ekle</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* SPLIT ITEM MODAL */}
      {splitModal && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem' }}>
             <h2 style={{ marginBottom: '0.5rem' }}>Ürünü Bölüştür</h2>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{selectedItem.name} <strong>(₺{selectedItem.price})</strong> ürününü kimler yedi/kullandı?</p>
             
             <form onSubmit={handleSplitSubmit}>
               <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                 {members.map((m, idx) => {
                   const u = m.user;
                   const isSelected = selectedUserIds.includes(u._id);
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
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSplitModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Kaydet</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* CALCULATE DEBTS MODAL */}
      {calcModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '500px', padding: '2rem' }}>
             <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)' }}><Calculator size={24} /> Borç Dağılımı Sonucu</h2>
             
             {debts.length === 0 ? (
               <p style={{ color: 'var(--text-secondary)' }}>Kimsenin kimseye borcu yok veya hiçbir ürün ataması yapılmamış.</p>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                 {debts.map((debt, idx) => {
                   const debtorObj = members.find(m => m.user._id === debt.debtorId)?.user;
                   const creditorObj = members.find(m => m.user._id === debt.creditorId)?.user;
                   const debtorName = debtorObj ? `${debtorObj.firstName} ${debtorObj.lastName}` : "Bilinmeyen";
                   const creditorName = creditorObj ? `${creditorObj.firstName} ${creditorObj.lastName}` : "Ödeyen Kişi";
                   return (
                     <div key={idx} style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '4px solid var(--success-color)' }}>
                       <div style={{ fontSize: '1.1rem' }}>
                         <strong>{debtorName}</strong>'in <strong style={{ color: 'var(--secondary-color)' }}>{creditorName}</strong>'e ödemesi gerek: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>₺{debt.amount.toFixed(2)}</span>
                       </div>
                     </div>
                 )})}
               </div>
             )}
             
             <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setCalcModal(false)}>Teşekkürler, Kapat</button>
          </div>
        </div>
      )}

    </>
  );
};

export default ExpenseDetail;
