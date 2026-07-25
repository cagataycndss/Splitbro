import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calculator, Plus, SplitSquareHorizontal, Sparkles, CheckCircle2, AlertTriangle, AlertCircle, ShoppingBag, Receipt, Users, Trash2, X } from 'lucide-react';

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
      const cat = res.data?.data?.categories?.[0]?.category || res.data?.categories?.[0]?.category;
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

  if (loading) return (
    <>
      <Header />
      <div className="app-container">
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Yükleniyor...
        </div>
      </div>
    </>
  );

  if (!expense) return null;

  return (
    <>
      <Header />
      <div className="app-container">
        <Link to={`/groups/${expense.groupId}`} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Gruba Geri Dön
        </Link>

        {/* Header Info */}
        <div className="glass-panel animate-fade-in flex-between-responsive" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <Receipt color="var(--primary-color)" size={28} /> {expense.title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Ödeyen: <strong>{expense.paidById?.firstName} {expense.paidById?.lastName}</strong> • {new Date(expense.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toplam Gider</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)' }}>₺{expense.totalAmount}</div>
          </div>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-gradient" onClick={() => setAddItemModal(true)}>
            <Plus size={18} /> Yeni Ürün Ekle
          </button>
          <button className="btn btn-success" onClick={handleCalculateDebts}>
            <Calculator size={18} /> Borç Hesapla (AI)
          </button>
        </div>

        {/* Selected Items List */}
        <div className="glass-panel animate-fade-in">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <ShoppingBag size={22} color="var(--primary-color)"/> Ürün Kalemleri ({expense.items?.length || 0})
            </h2>
          </div>
          
          <div style={{ padding: '1.25rem' }}>
            {(!expense.items || expense.items.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                <ShoppingBag size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                <p>Bu gidere henüz ürün kalemi eklenmedi.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                 {expense.items.map((item, idx) => (
                   <div key={idx} className="glass-card" style={{ padding: '1.15rem', position: 'relative' }}>
                     <button 
                       onClick={() => handleDeleteItem(item._id)} 
                       className="btn btn-danger btn-sm"
                       style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.35rem', minHeight: 'auto' }} 
                       title="Sil"
                     >
                       <Trash2 size={15} />
                     </button>

                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingRight: '2rem' }}>
                       <div style={{ flex: '1 1 200px' }}>
                         <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</div>
                         <div style={{ marginBottom: '0.5rem' }}>
                           <span className="badge badge-primary">
                              Kategori: {item.category}
                           </span>
                         </div>
                       
                         <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                           <Users size={14} color="var(--secondary-color)" /> Bölüşüm: 
                           {item.assignedUserIds?.length > 0 
                             ? item.assignedUserIds.map(u => typeof u === 'string' ? '(?id)' : `${u.firstName} ${u.lastName}`).join(', ') 
                             : 'Henüz kimse atanmadı'}
                         </div>
                       </div>

                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-color)' }}>₺{item.price}</div>
                         <button className="btn btn-outline btn-sm" onClick={() => openSplitModal(item)}>
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
        <div className="modal-overlay" onClick={() => setAddItemModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
               <h2>Yeni Ürün Ekle</h2>
               <button onClick={() => setAddItemModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>
             
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
                 <button type="button" className="btn btn-outline btn-sm" style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }} onClick={handleCategorizeWithAI} disabled={aiCatLoading}>
                    <Sparkles size={14} /> {aiCatLoading ? 'AI Sınıflandırıyor...' : 'AI Kategorize Et'}
                 </button>
                 <button type="button" className="btn btn-outline btn-sm" style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }} onClick={handleVerifyPriceWithAI} disabled={aiPriceLoading}>
                    <AlertTriangle size={14} /> {aiPriceLoading ? 'AI İnceliyor...' : 'AI Fiyat Kontrolü'}
                 </button>
               </div>

               {aiPriceResult && (
                 <div className={`alert-box ${aiPriceResult.isAnomalous ? 'alert-danger' : 'alert-success'}`}>
                   {aiPriceResult.isAnomalous ? (
                     <><AlertCircle size={18}/> <div><strong>Anomali Tespit Edildi:</strong> {aiPriceResult.reason}</div></>
                   ) : (
                     <><CheckCircle2 size={18}/> <div><strong>Fiyat Normal:</strong> {aiPriceResult.reason}</div></>
                   )}
                 </div>
               )}

               <div className="input-group">
                 <label className="input-label">Kategori</label>
                 <input type="text" className="glass-input" placeholder="Örn: Gıda, Eğlence..." value={newItemCategory} onChange={e=>setNewItemCategory(e.target.value)} />
               </div>
               
               <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setAddItemModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-gradient" style={{ flex: 1 }}>Ekle</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* SPLIT ITEM MODAL */}
      {splitModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setSplitModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h2>Ürünü Bölüştür</h2>
               <button onClick={() => setSplitModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
               <strong>{selectedItem.name}</strong> (₺{selectedItem.price}) ürününü kimler kullandı?
             </p>
             
             <form onSubmit={handleSplitSubmit}>
               <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                 {members.map((m, idx) => {
                   const u = m.user;
                   const isSelected = selectedUserIds.includes(u._id);
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
                 <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSplitModal(false)}>İptal</button>
                 <button type="submit" className="btn btn-gradient" style={{ flex: 1 }}>Kaydet</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* CALCULATE DEBTS MODAL */}
      {calcModal && (
        <div className="modal-overlay" onClick={() => setCalcModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
               <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)', margin: 0, fontSize: '1.25rem' }}>
                 <Calculator size={22} /> Borç Dağılım Sonucu
               </h2>
               <button onClick={() => setCalcModal(false)} className="btn btn-outline btn-sm" style={{ padding: '0.35rem', minHeight: 'auto' }}>
                 <X size={18} />
               </button>
             </div>
             
             {debts.length === 0 ? (
               <div className="alert-box alert-info">
                 Kimsenin kimseye borcu yok veya hiçbir ürün ataması yapılmamış.
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                 {debts.map((debt, idx) => {
                   const debtorObj = members.find(m => m.user._id === debt.debtorId)?.user;
                   const creditorObj = members.find(m => m.user._id === debt.creditorId)?.user;
                   const debtorName = debtorObj ? `${debtorObj.firstName} ${debtorObj.lastName}` : "Bilinmeyen";
                   const creditorName = creditorObj ? `${creditorObj.firstName} ${creditorObj.lastName}` : "Ödeyen Kişi";
                   return (
                     <div key={idx} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--success-color)' }}>
                       <div style={{ fontSize: '0.95rem' }}>
                         <strong>{debtorName}</strong> &rarr; <strong style={{ color: 'var(--secondary-color)' }}>{creditorName}</strong>: <span style={{ color: 'var(--primary-color)', fontWeight: '800' }}>₺{debt.amount.toFixed(2)}</span>
                       </div>
                     </div>
                 )})}
               </div>
             )}
             
             <button className="btn btn-gradient" style={{ width: '100%' }} onClick={() => setCalcModal(false)}>Kapat</button>
          </div>
        </div>
      )}

    </>
  );
};

export default ExpenseDetail;
