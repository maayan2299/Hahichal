import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Plus, Trash2, Edit3, Save, X, Package, Upload,
  Image as ImageIcon, Tag, LogOut, Eye, EyeOff,
  Star, Check, AlertCircle, Percent, Grid, ChevronRight, ArrowRight, Instagram
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_USERNAME = 'hahiechal';
const ADMIN_PASSWORD = 'hiechal2026';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 shadow-2xl text-white text-sm font-medium
      ${type === 'success' ? 'bg-black' : 'bg-red-600'}`}>
      {type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-black' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'right-0.5' : 'left-0.5'}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function Label({ children }) {
  return <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">{children}</label>;
}
function Input({ className = '', ...props }) {
  return <input className={`w-full px-3 py-2.5 border border-gray-200 focus:outline-none focus:border-black text-sm transition-colors bg-white ${className}`} {...props} />;
}
function Textarea({ className = '', ...props }) {
  return <textarea className={`w-full px-3 py-2.5 border border-gray-200 focus:outline-none focus:border-black text-sm transition-colors bg-white resize-none ${className}`} {...props} />;
}
function SelEl({ children, className = '', ...props }) {
  return <select className={`w-full px-3 py-2.5 border border-gray-200 focus:outline-none focus:border-black text-sm transition-colors bg-white ${className}`} {...props}>{children}</select>;
}

// ─────────────────────────────────────────
// Product Form
// ─────────────────────────────────────────
function ProductForm({ editingId, initialForm, initialImages, categories, onSave, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(initialImages || []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  function handleImagesChange(e) {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);
    try {
      const newImageUrls = [];
      for (const file of imageFiles) {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('products').upload(fileName, file, { upsert: true });
        if (upErr) throw upErr;
        newImageUrls.push(`${supabaseUrl}/storage/v1/object/public/products/${fileName}`);
      }
      const allImages = [...existingImages, ...newImageUrls];
      const productData = {
        name: form.name,
        price: parseFloat(form.price) || 0,
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        description: form.description,
        category_id: form.category_id || null,
        stock_quantity: form.stock_quantity !== '' ? parseInt(form.stock_quantity) : null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        show_stock: form.show_stock,
        images: allImages,
      };
      if (editingId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
      }
      onSave(editingId ? 'עודכן ✓' : 'נוסף ✓');
    } catch (err) {
      onSave(null, 'שגיאה: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-base">{editingId ? 'עריכת מוצר' : 'מוצר חדש'}</h3>
        <button onClick={onCancel} className="text-gray-300 hover:text-black"><X size={20} /></button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>שם המוצר *</Label>
            <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="לדוגמה: פמוטי שבת מוכספים" />
          </div>
          <div>
            <Label>קטגוריה</Label>
            <SelEl value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">ללא קטגוריה</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelEl>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>מחיר רגיל (₪) *</Label>
            <Input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <Label>מחיר מבצע (₪)</Label>
            <div className="relative">
              <Input type="number" step="0.01" min="0" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} placeholder="ריק = אין מבצע" className="pl-7" />
              <Percent size={11} className="absolute left-2.5 top-3 text-gray-300" />
            </div>
          </div>
          <div>
            <Label>כמות במלאי</Label>
            <Input type="number" min="0" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} placeholder="ריק = ללא מעקב" />
          </div>
        </div>
        <div className="mb-4">
          <Label>תיאור המוצר</Label>
          <Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="תיאור קצר..." />
        </div>
        <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100 mb-5">
          <Toggle value={form.is_active} onChange={v => setForm({ ...form, is_active: v })} label="מוצר פעיל באתר" />
          <Toggle value={form.is_featured} onChange={v => setForm({ ...form, is_featured: v })} label="⭐ מוצר מומלץ" />
          <Toggle value={form.show_stock} onChange={v => setForm({ ...form, show_stock: v })} label="הצג סטטוס מלאי" />
        </div>
        <div className="mb-6">
          <Label>תמונות המוצר</Label>
          {existingImages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {existingImages.map((url, i) => (
                <div key={i} className="relative group w-20 h-20">
                  <img src={url} className="w-full h-full object-cover border border-gray-200" />
                  <button type="button" onClick={() => setExistingImages(p => p.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                  {i === 0 && <span className="absolute bottom-0 inset-x-0 text-center text-[9px] bg-black/60 text-white py-0.5">ראשית</span>}
                </div>
              ))}
            </div>
          )}
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {imagePreviews.map((url, i) => (
                <div key={i} className="relative group w-20 h-20">
                  <img src={url} className="w-full h-full object-cover border-2 border-[#D4AF37]/50" />
                  <button type="button" onClick={() => { setImageFiles(p => p.filter((_, j) => j !== i)); setImagePreviews(p => p.filter((_, j) => j !== i)); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-[#D4AF37] transition-colors cursor-pointer p-5 text-center">
            <div className="flex flex-col items-center gap-1.5 text-gray-400">
              <Upload size={20} />
              <p className="text-sm font-medium">לחץ להוספת תמונות</p>
              <p className="text-xs">ניתן לבחור מספר תמונות · JPG, PNG, WEBP</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-200 text-sm hover:bg-gray-50 transition-colors">ביטול</button>
          <button type="submit" disabled={uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-bold hover:bg-[#D4AF37] transition-colors disabled:opacity-50">
            {uploading
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> שומר...</>
              : <><Save size={14} /> {editingId ? 'שמור שינויים' : 'הוסף מוצר'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────
// Product Row
// ─────────────────────────────────────────
function ProductRow({ product, categories, onEdit, onDelete, onRefresh, showToast }) {
  const firstImg = product.images?.[0];
  const catName = categories.find(c => c.id === product.category_id)?.name || '—';
  const isOutOfStock = product.stock_quantity === 0;
  const isOnSale = !!product.sale_price;

  async function quickToggle(field, value) {
    await supabase.from('products').update({ [field]: !value }).eq('id', product.id);
    onRefresh();
  }

  return (
    <div className="bg-white border border-gray-100 p-3 flex items-center gap-3 hover:border-gray-300 transition-colors">
      <div className="w-12 h-12 flex-shrink-0 bg-gray-50 border border-gray-100 overflow-hidden">
        {firstImg
          ? <img src={firstImg} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={18} /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm truncate">{product.name}</p>
          {isOutOfStock && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-100">SOLD OUT</span>}
          {isOnSale && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">SALE</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400">{catName}</span>
          <span className="text-gray-200">·</span>
          {isOnSale ? (
            <span className="flex items-center gap-1">
              <span className="text-xs text-gray-300 line-through">₪{parseFloat(product.price).toLocaleString('he-IL')}</span>
              <span className="text-xs font-bold text-[#D4AF37]">₪{parseFloat(product.sale_price).toLocaleString('he-IL')}</span>
            </span>
          ) : (
            <span className="text-xs text-gray-600">₪{parseFloat(product.price || 0).toLocaleString('he-IL')}</span>
          )}
          {product.stock_quantity !== null && (
            <>
              <span className="text-gray-200">·</span>
              <span className={`text-xs ${isOutOfStock ? 'text-red-400' : 'text-green-600'}`}>
                {isOutOfStock ? 'אזל מהמלאי' : `${product.stock_quantity} יח׳`}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className={`text-[10px] px-2 py-1 ${product.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
          {product.is_active ? 'פעיל' : 'מוסתר'}
        </span>
        <button onClick={() => quickToggle('is_featured', product.is_featured)}
          className={`p-1.5 transition-colors ${product.is_featured ? 'text-[#D4AF37]' : 'text-gray-200 hover:text-[#D4AF37]'}`}>
          <Star size={15} fill={product.is_featured ? 'currentColor' : 'none'} />
        </button>
        <button onClick={() => quickToggle('is_active', product.is_active)}
          className="p-1.5 text-gray-300 hover:text-black transition-colors">
          {product.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={() => onEdit(product)} className="p-1.5 text-gray-300 hover:text-black transition-colors">
          <Edit3 size={14} />
        </button>
        <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Login Screen
// ─────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.username === ADMIN_USERNAME && form.password === ADMIN_PASSWORD) {
      localStorage.setItem('hiechal_admin_auth', 'authenticated');
      onLogin();
    } else {
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-5" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] mb-3">Admin Panel</p>
          <h1 className="text-4xl font-bold tracking-[0.3em]" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>ההיכל</h1>
          <div className="h-px w-12 bg-[#D4AF37] mx-auto mt-4" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>שם משתמש</Label>
            <Input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="relative">
            <Label>סיסמה</Label>
            <Input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute left-3 bottom-2.5 text-gray-300 hover:text-black transition-colors">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs text-center flex items-center justify-center gap-1.5"><AlertCircle size={13} /> {error}</p>}
          <button className="w-full py-3 bg-black text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#D4AF37] transition-colors duration-300">כניסה</button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────
function MainDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products');
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  const tabs = [
    { id: 'products', label: 'מוצרים', icon: <Package size={15} /> },
    { id: 'featured', label: 'מומלצים', icon: <Star size={15} /> },
    { id: 'categories', label: 'קטגוריות', icon: <Grid size={15} /> },
    { id: 'banner', label: 'באנר', icon: <ImageIcon size={15} /> },
    { id: 'instagram', label: 'אינסטגרם', icon: <Instagram size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F6]" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold tracking-widest text-lg" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>ההיכל</h1>
            <div className="h-4 w-px bg-gray-100" />
            <span className="text-[10px] tracking-widest uppercase text-gray-400">ניהול</span>
          </div>
          <nav className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-4 text-xs font-semibold tracking-wide border-b-2 transition-all
                  ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors">
            <LogOut size={14} />
            <span className="hidden sm:inline">יציאה</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'products' && <ProductsTab showToast={showToast} />}
        {activeTab === 'featured' && <FeaturedTab showToast={showToast} />}
        {activeTab === 'categories' && <CategoriesTab showToast={showToast} />}
        {activeTab === 'banner' && <BannerTab showToast={showToast} />}
        {activeTab === 'instagram' && <InstagramTab showToast={showToast} />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// Products Tab
// ─────────────────────────────────────────
const EMPTY_FORM = {
  name: '', price: '', sale_price: '', description: '',
  category_id: '', stock_quantity: '', is_active: true,
  is_featured: false, show_stock: true,
};

function ProductsTab({ showToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('display_order'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  }

  function startNew() { setEditingProduct(null); setShowForm(true); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); }
  function startEdit(product) { setEditingProduct(product); setShowForm(true); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); }

  function handleSave(successMsg, errMsg) {
    if (errMsg) { showToast(errMsg, 'error'); return; }
    showToast(successMsg);
    setShowForm(false);
    setEditingProduct(null);
    fetchAll();
  }

  async function handleDelete(id) {
    if (!confirm('למחוק את המוצר?')) return;
    await supabase.from('products').delete().eq('id', id);
    showToast('נמחק');
    fetchAll();
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const inStock = products.filter(p => (p.stock_quantity ?? 1) > 0).length;
  const soldOut = products.filter(p => p.stock_quantity === 0).length;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'סה"כ מוצרים', value: products.length, color: 'text-black' },
          { label: 'במלאי', value: inStock, color: 'text-green-600' },
          { label: 'SOLD OUT', value: soldOut, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-5">
        <input type="text" placeholder="חיפוש מוצר..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black bg-white" />
        <button onClick={startNew}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-[#D4AF37] transition-colors whitespace-nowrap">
          <Plus size={15} /> מוצר חדש
        </button>
      </div>
      {showForm && (
        <ProductForm
          editingId={editingProduct?.id}
          initialForm={editingProduct ? {
            name: editingProduct.name || '', price: editingProduct.price || '',
            sale_price: editingProduct.sale_price || '', description: editingProduct.description || '',
            category_id: editingProduct.category_id || '', stock_quantity: editingProduct.stock_quantity ?? '',
            is_active: editingProduct.is_active ?? true, is_featured: editingProduct.is_featured ?? false,
            show_stock: editingProduct.show_stock ?? true,
          } : { ...EMPTY_FORM }}
          initialImages={editingProduct?.images || []}
          categories={categories}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}
      {loading ? (
        <div className="text-center py-20 text-gray-300 text-sm">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <Package size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{searchQuery ? 'לא נמצאו תוצאות' : 'אין מוצרים עדיין'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-2">💡 לחצי על הכוכב ⭐ כדי לסמן מוצר כנבחר / להסיר</p>
          {filtered.map(product => (
            <ProductRow key={product.id} product={product} categories={categories}
              onEdit={startEdit} onDelete={handleDelete} onRefresh={fetchAll} showToast={showToast} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Categories Tab
// ─────────────────────────────────────────
function CategoriesTab({ showToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newForm, setNewForm] = useState({ name: '', display_order: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const [catProducts, setCatProducts] = useState([]);
  const [catProductsLoading, setCatProductsLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
    setLoading(false);
  }

  async function openCategory(cat) {
    setSelectedCategory(cat);
    setShowProductForm(false);
    setEditingProduct(null);
    setCatProductsLoading(true);
    const { data } = await supabase.from('products').select('*').eq('category_id', cat.id).order('created_at', { ascending: false });
    setCatProducts(data || []);
    setCatProductsLoading(false);
  }

  async function refreshCatProducts() {
    if (!selectedCategory) return;
    setCatProductsLoading(true);
    const { data } = await supabase.from('products').select('*').eq('category_id', selectedCategory.id).order('created_at', { ascending: false });
    setCatProducts(data || []);
    setCatProductsLoading(false);
  }

  function handleProductSave(successMsg, errMsg) {
    if (errMsg) { showToast(errMsg, 'error'); return; }
    showToast(successMsg);
    setShowProductForm(false);
    setEditingProduct(null);
    refreshCatProducts();
  }

  async function handleDeleteProduct(id) {
    if (!confirm('למחוק?')) return;
    await supabase.from('products').delete().eq('id', id);
    showToast('נמחק');
    refreshCatProducts();
  }

  async function saveEditCat() {
    setUploading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `cat-${editingId}-${Date.now()}.${ext}`;
        await supabase.storage.from('categories').upload(fileName, imageFile, { upsert: true });
        imageUrl = `${supabaseUrl}/storage/v1/object/public/categories/${fileName}`;
      }
      const { error } = await supabase.from('categories').update({
        name: editForm.name,
        display_order: parseInt(editForm.display_order) || 0,
        ...(imageUrl && { image_url: imageUrl })
      }).eq('id', editingId);
      if (error) throw error;
      showToast('עודכן ✓');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      showToast('שגיאה: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function addCategory() {
    if (!newForm.name) return;
    const slug = newForm.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0590-\u05FF-]/g, '');
    const { error } = await supabase.from('categories').insert({ name: newForm.name, slug, display_order: parseInt(newForm.display_order) || 99 });
    if (error) { showToast('שגיאה: ' + error.message, 'error'); return; }
    showToast('נוספה ✓');
    setShowNewCatForm(false);
    setNewForm({ name: '', display_order: '' });
    fetchCategories();
  }

  async function deleteCategory(id) {
    if (!confirm('למחוק קטגוריה זו?')) return;
    await supabase.from('categories').delete().eq('id', id);
    showToast('נמחקה');
    fetchCategories();
  }

  if (selectedCategory) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => { setSelectedCategory(null); setShowProductForm(false); }}
            className="text-sm text-gray-400 hover:text-black transition-colors">קטגוריות</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-sm font-semibold">{selectedCategory.name}</span>
        </div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold">{selectedCategory.name}</h2>
            <p className="text-xs text-gray-400 mt-1">{catProducts.length} מוצרים בקטגוריה זו</p>
          </div>
          <button onClick={() => { setShowProductForm(true); setEditingProduct(null); }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-[#D4AF37] transition-colors">
            <Plus size={15} /> הוסף מוצר לקטגוריה
          </button>
        </div>
        {showProductForm && (
          <ProductForm
            editingId={editingProduct?.id}
            initialForm={editingProduct ? {
              name: editingProduct.name || '', price: editingProduct.price || '',
              sale_price: editingProduct.sale_price || '', description: editingProduct.description || '',
              category_id: selectedCategory.id, stock_quantity: editingProduct.stock_quantity ?? '',
              is_active: editingProduct.is_active ?? true, is_featured: editingProduct.is_featured ?? false,
              show_stock: editingProduct.show_stock ?? true,
            } : { ...EMPTY_FORM, category_id: selectedCategory.id }}
            initialImages={editingProduct?.images || []}
            categories={categories}
            onSave={handleProductSave}
            onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
          />
        )}
        {catProductsLoading ? (
          <div className="text-center py-20 text-gray-300 text-sm">טוען...</div>
        ) : catProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-300 border-2 border-dashed border-gray-200">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-3">אין מוצרים בקטגוריה זו עדיין</p>
            <button onClick={() => setShowProductForm(true)}
              className="flex items-center gap-2 mx-auto bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-[#D4AF37] transition-colors">
              <Plus size={14} /> הוסף מוצר ראשון
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-2">💡 לחצי על הכוכב ⭐ לסימון נבחר</p>
            {catProducts.map(product => (
              <ProductRow key={product.id} product={product} categories={categories}
                onEdit={p => { setEditingProduct(p); setShowProductForm(true); }}
                onDelete={handleDeleteProduct} onRefresh={refreshCatProducts} showToast={showToast} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold">ניהול קטגוריות</h2>
          <p className="text-xs text-gray-400 mt-1">{categories.length} קטגוריות · לחצי על קטגוריה לצפייה במוצרים</p>
        </div>
        <button onClick={() => setShowNewCatForm(!showNewCatForm)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-[#D4AF37] transition-colors">
          <Plus size={14} /> קטגוריה חדשה
        </button>
      </div>
      {showNewCatForm && (
        <div className="bg-white border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-2">
              <Label>שם הקטגוריה *</Label>
              <Input value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} placeholder="לדוגמה: שבת וחגים" />
            </div>
            <div>
              <Label>סדר תצוגה</Label>
              <Input type="number" value={newForm.display_order} onChange={e => setNewForm({ ...newForm, display_order: e.target.value })} placeholder="1" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNewCatForm(false)} className="px-4 py-2 border border-gray-200 text-sm hover:bg-gray-50">ביטול</button>
            <button onClick={addCategory} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold hover:bg-[#D4AF37] transition-colors">
              <Plus size={13} /> הוסף
            </button>
          </div>
        </div>
      )}
      {loading ? <div className="text-center py-20 text-gray-300 text-sm">טוען...</div> : (
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white border border-gray-100 hover:border-gray-300 transition-colors">
              {editingId === cat.id ? (
                <div className="p-3 flex flex-wrap gap-3 items-end">
                  <div><Label>שם</Label><Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-40" /></div>
                  <div><Label>סדר</Label><Input type="number" value={editForm.display_order} onChange={e => setEditForm({ ...editForm, display_order: e.target.value })} className="w-16" /></div>
                  <div>
                    <Label>תמונה</Label>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-gray-200 text-xs text-gray-400 hover:border-[#D4AF37] transition-colors">
                      <Upload size={13} /> {imagePreview ? '✓ נבחרה' : 'העלה'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }} />
                  </div>
                  {imagePreview && <img src={imagePreview} className="w-10 h-10 object-cover border" />}
                  <div className="flex gap-2">
                    <button onClick={saveEditCat} disabled={uploading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold hover:bg-[#D4AF37] transition-colors">
                      <Save size={12} /> {uploading ? 'שומר...' : 'שמור'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-2 border border-gray-200 text-xs hover:bg-gray-50">ביטול</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={() => openCategory(cat)} className="flex items-center gap-3 flex-1 p-3 text-right">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                      {cat.image_url
                        ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-200"><Tag size={14} /></div>}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold">{cat.name}</p>
                      <p className="text-xs text-gray-300">לחץ לצפייה במוצרים ←</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 ml-1" />
                  </button>
                  <div className="flex gap-1 p-3 pl-3">
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(cat.id); setEditForm({ name: cat.name, display_order: cat.display_order || 0 }); setImagePreview(null); setImageFile(null); }}
                      className="p-1.5 text-gray-300 hover:text-black transition-colors"><Edit3 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Featured Tab
// ─────────────────────────────────────────
function FeaturedTab({ showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').eq('is_active', true).order('name');
    setProducts(data || []);
    setLoading(false);
  }

  async function toggle(product) {
    await supabase.from('products').update({ is_featured: !product.is_featured }).eq('id', product.id);
    showToast(product.is_featured ? 'הוסר מהנבחרים' : '⭐ נוסף לנבחרים');
    fetchAll();
  }

  const featured = products.filter(p => p.is_featured);
  const rest = products.filter(p => !p.is_featured);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-bold">מוצרים נבחרים</h2>
        <p className="text-xs text-gray-400 mt-1">{featured.length} מוצרים יוצגו בסקשן "המיוחדים שלנו" · לחצי על מוצר לסימון/ביטול</p>
      </div>
      {loading ? <div className="text-center py-20 text-gray-300 text-sm">טוען...</div> : (
        <>
          {featured.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#D4AF37] mb-3">⭐ נבחרים ({featured.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {featured.map(p => <FeaturedCard key={p.id} product={p} onToggle={() => toggle(p)} isFeatured />)}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-300 mb-3">שאר המוצרים</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {rest.map(p => <FeaturedCard key={p.id} product={p} onToggle={() => toggle(p)} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FeaturedCard({ product, onToggle, isFeatured }) {
  const img = product.images?.[0];
  return (
    <div onClick={onToggle}
      className={`relative border-2 cursor-pointer group overflow-hidden transition-all
        ${isFeatured ? 'border-[#D4AF37]' : 'border-gray-100 hover:border-gray-200'}`}>
      <div className="aspect-square bg-gray-50">
        {img
          ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={20} /></div>}
      </div>
      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow
        ${isFeatured ? 'bg-[#D4AF37] text-white' : 'bg-white text-gray-300'}`}>
        <Star size={11} fill={isFeatured ? 'currentColor' : 'none'} />
      </div>
      <div className="p-2 bg-white border-t border-gray-50">
        <p className="text-xs font-semibold truncate">{product.name}</p>
        <p className="text-xs text-[#D4AF37] mt-0.5">
          {product.sale_price ? `₪${parseFloat(product.sale_price).toLocaleString('he-IL')}` : `₪${parseFloat(product.price || 0).toLocaleString('he-IL')}`}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Banner Tab
// ─────────────────────────────────────────
function BannerTab({ showToast }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    setCurrentBanner(`${supabaseUrl}/storage/v1/object/public/banners/banner.png?t=${Date.now()}`);
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { error } = await supabase.storage.from('banners').upload('banner.png', file, { upsert: true, contentType: file.type });
      if (error) throw error;
      setCurrentBanner(`${supabaseUrl}/storage/v1/object/public/banners/banner.png?t=${Date.now()}`);
      setPreview(null);
      showToast('הבאנר עודכן! 🎉');
    } catch (err) {
      showToast('שגיאה: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-base font-bold">באנר ראשי</h2>
        <p className="text-xs text-gray-400 mt-1">התמונה המוצגת בראש דף הבית</p>
      </div>
      <div className="bg-white border border-gray-100 p-6">
        {currentBanner && (
          <div className="mb-5">
            <p className="text-[10px] tracking-widest uppercase text-gray-300 mb-2">באנר נוכחי</p>
            <img src={currentBanner} alt="banner" className="w-full max-h-48 object-cover border border-gray-100"
              onError={e => e.target.style.display = 'none'} />
          </div>
        )}
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-[#D4AF37] transition-colors cursor-pointer p-10 text-center">
          {preview ? (
            <><img src={preview} alt="preview" className="mx-auto max-h-40 object-contain mb-2" /><p className="text-xs text-[#D4AF37]">לחץ לבחירת תמונה אחרת</p></>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <Upload size={28} />
              <p className="text-sm font-medium text-gray-500">לחץ להעלאת באנר חדש</p>
              <p className="text-xs">מומלץ: 1920×600px · JPG או PNG</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin" /> מעלה...
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4 p-3 bg-gray-50">💡 לאחר העלאה, רענן את דף הבית לראות את השינוי.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Instagram Tab — NEW
// ─────────────────────────────────────────
function InstagramTab({ showToast }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchImages(); }, []);

  async function fetchImages() {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('instagram')
        .list('', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      const imgs = (data || [])
        .filter(f => f.name && !f.name.startsWith('.') && f.name !== '.emptyFolderPlaceholder')
        .map(f => ({
          name: f.name,
          url: `${supabaseUrl}/storage/v1/object/public/instagram/${f.name}`,
          created_at: f.created_at,
        }));
      setImages(imgs);
    } catch (err) {
      showToast('שגיאה בטעינה: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function uploadFiles(files) {
    if (!files.length) return;
    setUploading(true);
    let successCount = 0;
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        // שם קובץ: post1.jpg, post2.jpg וכו' — או timestamp
        const fileName = `post${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
        const { error } = await supabase.storage
          .from('instagram')
          .upload(fileName, file, { upsert: false, contentType: file.type });
        if (!error) successCount++;
      }
      showToast(`${successCount} תמונות הועלו בהצלחה ✓`);
      fetchImages();
    } catch (err) {
      showToast('שגיאה: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(name) {
    if (!confirm(`למחוק את התמונה "${name}"?`)) return;
    const { error } = await supabase.storage.from('instagram').remove([name]);
    if (error) { showToast('שגיאה: ' + error.message, 'error'); return; }
    showToast('נמחקה ✓');
    fetchImages();
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    uploadFiles(files);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-base font-bold">גלריית אינסטגרם</h2>
        <p className="text-xs text-gray-400 mt-1">
          התמונות שיוצגו בסקשן "עקבו אחרינו" בדף הבית · {images.length} תמונות
        </p>
      </div>

      {/* הסבר מבנה */}
      <div className="bg-amber-50 border border-amber-200 p-4 mb-6 text-right">
        <p className="text-xs font-bold text-amber-800 mb-1">💡 איך זה עובד?</p>
        <p className="text-xs text-amber-700">
          תמונות שתעלי כאן יופיעו אוטומטית בסקשן האינסטגרם בדף הבית.
          ניתן לבחור עד <strong>6 תמונות</strong> לתצוגה — הישנות ביותר יוסתרו.
          לחצי על X למחיקת תמונה.
        </p>
      </div>

      {/* אזור העלאה */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed transition-colors cursor-pointer p-10 text-center mb-8
          ${dragOver ? 'border-[#CFAA52] bg-amber-50' : 'border-gray-200 hover:border-[#CFAA52]'}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#CFAA52] rounded-full animate-spin" />
            <p className="text-sm">מעלה תמונות...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload size={32} />
            <p className="text-base font-medium text-gray-600">לחצי להעלאת תמונות</p>
            <p className="text-xs">או גררי תמונות לכאן · JPG, PNG, WEBP · ניתן לבחור מספר תמונות</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => uploadFiles(Array.from(e.target.files))} />
      </div>

      {/* גלריה */}
      {loading ? (
        <div className="text-center py-20 text-gray-300 text-sm">טוען...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-gray-200 border-2 border-dashed border-gray-100">
          <Instagram size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm text-gray-400">אין תמונות עדיין</p>
          <p className="text-xs text-gray-300 mt-1">העלי תמונות למעלה כדי שיופיעו בדף הבית</p>
        </div>
      ) : (
        <>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">
            תמונות קיימות ({images.length}) — 6 הראשונות יוצגו בדף הבית
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {images.map((img, i) => (
              <div key={img.name} className="relative group aspect-square">
                {/* תג "מוצג" לראשונות */}
                {i < 6 && (
                  <div className="absolute top-1.5 right-1.5 z-10 bg-[#CFAA52] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                    {i + 1}
                  </div>
                )}
                <img
                  src={img.url}
                  alt={img.name}
                  className={`w-full h-full object-cover border-2 transition-all
                    ${i < 6 ? 'border-[#CFAA52]/60' : 'border-gray-100 opacity-60'}`}
                />
                {/* מחיקה */}
                <button
                  onClick={() => deleteImage(img.name)}
                  className="absolute -top-1.5 -left-1.5 z-20 w-6 h-6 bg-red-500 text-white rounded-full
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={11} />
                </button>
                {/* שם קובץ */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                  {img.name}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Root
// ─────────────────────────────────────────
export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => { if (localStorage.getItem('hiechal_admin_auth') === 'authenticated') setIsAuthenticated(true); }, []);
  return isAuthenticated
    ? <MainDashboard onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('hiechal_admin_auth'); }} />
    : <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
}