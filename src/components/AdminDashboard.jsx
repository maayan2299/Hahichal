import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, LogOut, Eye, EyeOff, Search, Star, Settings, Image, Package, Tag, Award, Grid, MessageSquare, Percent, Bell, AlertTriangle, Edit, Upload, Truck, ShoppingBag } from 'lucide-react';
import { supabase, supabaseUrl } from '../lib/supabase';

const ADMIN_USERNAME = 'heichal';
const ADMIN_PASSWORD = 'heichal2026';

const G = '#C9A84C';
const BK = '#111111';
const WH = '#FFFFFF';
const BG = '#F8F7F4';
const BR = '#E8E2D8';

const btn = (bg, col, extra = {}) => ({
  background: bg, color: col, border: 'none', padding: '10px 18px',
  borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  fontFamily: '"Heebo",sans-serif', display: 'inline-flex', alignItems: 'center',
  gap: '6px', ...extra
});
const inp = {
  border: `1.5px solid ${BR}`, padding: '11px 14px', fontFamily: '"Heebo",sans-serif',
  fontSize: '14px', width: '100%', borderRadius: '8px', outline: 'none', background: WH, color: BK
};
const card = { background: WH, borderRadius: '14px', border: `1px solid ${BR}` };

const ENGRAVING_OPTIONS = [
  { value: 'engraving', label: 'חריטה', icon: '✍️' },
  { value: 'embroidery', label: 'רקמה', icon: '🧵' },
  { value: 'embossing', label: 'הטבעה', icon: '🔏' },
  { value: 'printing', label: 'הדפסה', icon: '🖨️' },
];

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('heichal_admin_auth') === 'authenticated') setIsAuthenticated(true);
    // טעינת לוגו
    const url = `${supabaseUrl}/storage/v1/object/public/banners/logo.png?t=${Date.now()}`;
    setLogoUrl(url);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('heichal_admin_auth', 'authenticated');
    } else setLoginError('שם משתמש או סיסמה שגויים');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: '"Heebo",sans-serif', direction: 'rtl', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', ...card, padding: '40px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="לוגו" style={{ height: '60px', objectFit: 'contain', marginBottom: '12px' }}
                onError={e => { e.target.style.display = 'none'; }} />
            ) : (
              <div style={{ width: '52px', height: '52px', background: BK, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <span style={{ color: G, fontSize: '20px', fontWeight: '700' }}>✦</span>
              </div>
            )}
            <div style={{ fontSize: '24px', fontWeight: '700', color: BK }}>ההיכל</div>
            <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>מערכת ניהול</div>
          </div>
          <form onSubmit={handleLogin}>
            <input type="text" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={{...inp, marginBottom: '12px'}} placeholder="שם משתמש" />
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={{...inp, paddingLeft: '44px'}} placeholder="סיסמה" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {loginError && <div style={{ padding: '10px', background: '#fff5f5', color: '#dc2626', marginBottom: '16px', fontSize: '13px', textAlign: 'center', borderRadius: '8px', border: '1px solid #fecaca' }}>{loginError}</div>}
            <button type="submit" style={{...btn(BK, WH), width: '100%', justifyContent: 'center', padding: '13px', fontSize: '15px'}}>כניסה</button>
          </form>
        </div>
      </div>
    );
  }

  return <MainDashboard onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('heichal_admin_auth'); }} logoUrl={logoUrl} setLogoUrl={setLogoUrl} />;
};

const MainDashboard = ({ onLogout, logoUrl, setLogoUrl }) => {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([])
  const [orders, setOrders] = useState([]);
  const [popup, setPopup] = useState({ is_active: false, title: '', message: '', button_text: 'סגור', image_url: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [openParents, setOpenParents] = useState({});
  const [selCatPanel, setSelCatPanel] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(`${supabaseUrl}/storage/v1/object/public/banners/banner.png?t=${Date.now()}`);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(logoUrl);
  const [popupImageFile, setPopupImageFile] = useState(null);
  const [popupImagePreview, setPopupImagePreview] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showImagesModal, setShowImagesModal] = useState(null);
  const [showColorsModal, setShowColorsModal] = useState(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [catForm, setCatForm] = useState({ name: '', is_parent: false, parent_id: '' });
  const [catImageFile, setCatImageFile] = useState(null);
  const [reviewForm, setReviewForm] = useState({ text: '', stars: 5 });
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order: '', is_active: true, expires_at: '' });

  const [productForm, setProductForm] = useState({
    name: '', price: '', description: '', category_id: '',
    stock_quantity: 0, allows_engraving: false, engraving_types: [],
    is_featured: false, on_sale: false, sale_type: 'percentage',
    sale_percentage: '', sale_price: '', dimensions: '', material: '',
    complementary_ids: [], product_options: [],
    has_sizes: false, sizes: [], has_colors: false, inline_colors: [], extra_category_ids: [], engraving_prices: {}
  });

  // הגדרות משלוח
  const DEFAULT_SHIPPING = {
    standard: { name: 'משלוח רגיל', description: '5-7 ימי עסקים', price: 35, free_above: 400, enabled: true },
    express: { name: 'משלוח מהיר', description: '1-2 ימי עסקים', price: 60, enabled: true },
    pickup: { name: 'איסוף עצמי מקריית אתא', description: 'ללא עלות', price: 0, enabled: true }
  };
  const DEFAULT_BRANDING = {
    engraving: { price: 10, text_limit: 30 },
    embroidery: { price: 40, text_limit: 50 },
    embossing: { price: 15, text_limit: 30 },
    printing: { price: 8, text_limit: 100 }
  };
  const [shippingSettings, setShippingSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('heichal_shipping_settings')) || DEFAULT_SHIPPING; } catch { return DEFAULT_SHIPPING; }
  });
  const [brandingSettings, setBrandingSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('heichal_branding_settings')) || DEFAULT_BRANDING; } catch { return DEFAULT_BRANDING; }
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => localStorage.getItem('heichal_whatsapp') || '972542115584');
  const [instagramName, setInstagramName] = useState(() => localStorage.getItem('heichal_instagram') || '');

  const [productImages, setProductImages] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newColor, setNewColor] = useState({ name: '', code: '' });

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (popup.image_url) setPopupImagePreview(popup.image_url);
  }, [popup.image_url]);

  const loadAll = async () => {
    setLoading(true);
    const [pRes, cRes, rRes, cpRes, ppRes, oRes, sRes] = await Promise.all([
      supabase.from('products').select(`*, categories!products_category_id_fkey(name), product_images(image_url, is_primary), product_colors(id)`).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('popup_settings').select('*').limit(1).maybeSingle(),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('store_settings').select('*').eq('key', 'branding').maybeSingle()
    ]);
    if (pRes.data) setProducts(pRes.data.map(p => ({
      ...p,
      category_name: p.categories?.name || '',
      primary_image: p.product_images?.find(i => i.is_primary)?.image_url || p.product_images?.[0]?.image_url,
      images_count: p.product_images?.length || 0,
      colors_count: p.product_colors?.length || 0
    })));
    if (cRes.data) setCategories(cRes.data);
    if (rRes.data) setReviews(rRes.data);
    if (cpRes.data) setCoupons(cpRes.data);
    if (oRes?.data) setOrders(oRes.data);
    if (sRes?.data?.value) setBrandingSettings(sRes.data.value);
    setLoading(false);
  };
  const upload = async (file, bucket = 'product-images', fileName = null) => {
    if (!file) return null;
    setUploading(true);
    const name = fileName || `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from(bucket).upload(name, file, { upsert: true });
    if (error) { setUploading(false); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(name);
    setUploading(false);
    return data.publicUrl;
  };

  // ── PRODUCTS ──
  const saveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) { alert('שם ומחיר חובה'); return; }
    let salePrice = null;
    if (productForm.on_sale) {
      if (productForm.sale_type === 'percentage' && productForm.sale_percentage)
        salePrice = parseFloat(productForm.price) * (1 - parseFloat(productForm.sale_percentage) / 100);
      else if (productForm.sale_type === 'fixed' && productForm.sale_price)
        salePrice = parseFloat(productForm.sale_price);
    }
    // שמור גדלים כ-product_options
    const sizesOption = productForm.has_sizes && productForm.sizes?.filter(s => s.label).length > 0
      ? [{ type: 'sizes', name: 'גודל', required: true, values: productForm.sizes.filter(s => s.label) }]
      : null;
    const data = {
      name: productForm.name, price: parseFloat(productForm.price),
      description: productForm.description, category_id: productForm.category_id || null,
      stock_quantity: parseInt(productForm.stock_quantity) || 0,
      allows_engraving: productForm.allows_engraving,
      engraving_type: productForm.allows_engraving && productForm.engraving_types.length > 0
        ? productForm.engraving_types
        : null,
      is_featured: productForm.is_featured, on_sale: productForm.on_sale,
      sale_type: productForm.on_sale ? productForm.sale_type : null,
      sale_percentage: productForm.on_sale && productForm.sale_type === 'percentage' ? parseInt(productForm.sale_percentage) : null,
      sale_price: salePrice,
      dimensions: productForm.dimensions || null,
      material: productForm.material || null,
      complementary_ids: productForm.complementary_ids?.length > 0 ? productForm.complementary_ids : null,
      product_options: sizesOption
    };
    try {
      let productId;
      if (editingProduct) {
        await supabase.from('products').update(data).eq('id', editingProduct.id);
        productId = editingProduct.id;
      } else {
        const { data: np, error } = await supabase.from('products').insert([{ ...data, is_active: true }]).select().single();
        if (error) throw error;
        productId = np.id;
        if (newImageFile) {
          const url = await upload(newImageFile);
          if (url) await supabase.from('product_images').insert([{ product_id: np.id, image_url: url, is_primary: true, display_order: 0 }]);
        }
      }
      // שמור צבעים inline אם הוגדרו
      if (productForm.has_colors && productForm.inline_colors?.filter(c => c.name).length > 0) {
        if (editingProduct) await supabase.from('product_colors').delete().eq('product_id', productId);
        const colorsToInsert = productForm.inline_colors.filter(c => c.name).map((c, i) => ({
          product_id: productId, color_name: c.name, color_code: c.code || '#000000', display_order: i
        }));
        await supabase.from('product_colors').insert(colorsToInsert);
      }
      if (productForm.extra_category_ids?.length > 0) {
        await supabase.from('product_categories').delete().eq('product_id', productId);
        const catRows = productForm.extra_category_ids.map(cid => ({ product_id: productId, category_id: cid }));
        await supabase.from('product_categories').insert(catRows);
      } else {
        await supabase.from('product_categories').delete().eq('product_id', productId);
      }
      await loadAll();
      closeProductModal();
    } catch (e) { alert('שגיאה: ' + e.message); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('למחוק?')) return;
    const { data: imgs } = await supabase.from('product_images').select('image_url').eq('product_id', id);
    if (imgs) for (const i of imgs) await supabase.storage.from('product-images').remove([i.image_url.split('/').pop()]);
    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('product_colors').delete().eq('product_id', id);
    await supabase.from('products').delete().eq('id', id);
    await loadAll();
  };

  const toggleFeatured = async (p) => {
    await supabase.from('products').update({ is_featured: !p.is_featured }).eq('id', p.id);
    await loadAll();
  };

  const openProductModal = (product = null, prefillCat = '') => {
    setEditingProduct(product);
    setProductForm(product ? {
      name: product.name, price: product.price, description: product.description || '',
      category_id: product.category_id || '', stock_quantity: product.stock_quantity || 0,
      allows_engraving: product.allows_engraving || false,
      engraving_types: Array.isArray(product.engraving_type) ? product.engraving_type : (product.engraving_type ? [product.engraving_type] : []),
      is_featured: product.is_featured || false, on_sale: product.on_sale || false,
      sale_type: product.sale_type || 'percentage', sale_percentage: product.sale_percentage || '',
      sale_price: product.sale_price || '', dimensions: product.dimensions || '', material: product.material || '',
      complementary_ids: product.complementary_ids || [], product_options: product.product_options || [],
      has_sizes: !!(product.product_options?.find(o => o.type === 'sizes')?.values?.length),
      sizes: product.product_options?.find(o => o.type === 'sizes')?.values || [],
      has_colors: false, inline_colors: [], extra_category_ids: [], engraving_prices: {}
    } : {
      name: '', price: '', description: '', category_id: prefillCat,
      stock_quantity: 0, allows_engraving: false, engraving_types: [],
      is_featured: false, on_sale: false, sale_type: 'percentage',
      sale_percentage: '', sale_price: '', dimensions: '', material: '',
      complementary_ids: [], product_options: [],
      has_sizes: false, sizes: [], has_colors: false, inline_colors: [], extra_category_ids: [], engraving_prices: {}
    });
    setNewImageFile(null);
    setShowProductModal(true);
  };

  const closeProductModal = () => { setShowProductModal(false); setEditingProduct(null); setNewImageFile(null); };

  const toggleEngravingType = (val) => {
    const types = productForm.engraving_types || [];
    if (types.includes(val)) {
      setProductForm({...productForm, engraving_types: types.filter(t => t !== val)});
    } else {
      setProductForm({...productForm, engraving_types: [...types, val]});
    }
  };

  // ── IMAGES ──
  const openImagesModal = async (p) => {
    setShowImagesModal(p);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', p.id).order('display_order');
    setProductImages(data || []);
  };
  const addImage = async () => {
    if (!newImageFile) return;
    const url = await upload(newImageFile);
    if (!url) return;
    await supabase.from('product_images').insert([{ product_id: showImagesModal.id, image_url: url, is_primary: productImages.length === 0, display_order: productImages.length }]);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []); setNewImageFile(null); await loadAll();
  };
  const deleteImage = async (imgId, imgUrl) => {
    if (!confirm('למחוק?')) return;
    await supabase.storage.from('product-images').remove([imgUrl.split('/').pop()]);
    await supabase.from('product_images').delete().eq('id', imgId);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []); await loadAll();
  };
  const setPrimary = async (imgId) => {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', showImagesModal.id);
    await supabase.from('product_images').update({ is_primary: true }).eq('id', imgId);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []); await loadAll();
  };

  // ── COLORS ──
  const openColorsModal = async (p) => {
    setShowColorsModal(p);
    const { data } = await supabase.from('product_colors').select('*').eq('product_id', p.id).order('display_order');
    setProductColors(data || []);
  };
  const addColor = async () => {
    if (!newColor.name || !newColor.code) { alert('מלא שם וקוד'); return; }
    let c = newColor.code.trim();
    if (!c.startsWith('#')) c = '#' + c;
    await supabase.from('product_colors').insert([{ product_id: showColorsModal.id, color_name: newColor.name, color_code: c.toLowerCase(), display_order: productColors.length, price_delta: newColor.price_delta || 0 }]);
    const { data } = await supabase.from('product_colors').select('*').eq('product_id', showColorsModal.id);
    setProductColors(data || []); setNewColor({ name: '', code: '', price_delta: 0 }); await loadAll();
  };
  const deleteColor = async (id) => {
    if (!confirm('למחוק?')) return;
    await supabase.from('product_colors').delete().eq('id', id);
    const { data } = await supabase.from('product_colors').select('*').eq('product_id', showColorsModal.id);
    setProductColors(data || []); await loadAll();
  };

  // ── CATEGORIES ──
  const saveCat = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) { alert('שם חובה'); return; }
    let imageUrl = editingCat?.image_url || null;
    if (catImageFile) imageUrl = await upload(catImageFile);
    const data = { 
      name: catForm.name.trim(), 
      slug: `category-${Date.now()}`,
      image_url: imageUrl, 
      is_parent: catForm.is_parent, 
      parent_id: catForm.parent_id || null 
    };
    if (editingCat) {
      await supabase.from('categories').update(data).eq('id', editingCat.id);
    } else {
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order || 0)) : 0;
      await supabase.from('categories').insert([{ ...data, display_order: maxOrder + 1 }]);
    }
    setCatForm({ name: '', is_parent: false, parent_id: '' }); setCatImageFile(null);
    setShowCatModal(false); setEditingCat(null); await loadAll();
  };
  const deleteCat = async (id) => { if (!confirm('למחוק?')) return; await supabase.from('categories').delete().eq('id', id); await loadAll(); };
  const openEditCat = (cat) => { setEditingCat(cat); setCatForm({ name: cat.name, is_parent: cat.is_parent || false, parent_id: cat.parent_id || '' }); setCatImageFile(null); setShowCatModal(true); };

  // ── REVIEWS ──
  const saveReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.text.trim()) return;
    if (editingReview) await supabase.from('testimonials').update({ text: reviewForm.text, stars: reviewForm.stars }).eq('id', editingReview.id);
    else await supabase.from('testimonials').insert([{ text: reviewForm.text, stars: reviewForm.stars }]);
    setReviewForm({ text: '', stars: 5 }); setShowReviewModal(false); setEditingReview(null); await loadAll();
  };
  const deleteReview = async (id) => { if (!confirm('למחוק?')) return; await supabase.from('testimonials').delete().eq('id', id); await loadAll(); };

  // ── COUPONS ──
  const saveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discount_value) { alert('קוד וערך הנחה חובה'); return; }
    const data = { code: couponForm.code.toUpperCase(), discount_type: couponForm.discount_type, discount_value: parseFloat(couponForm.discount_value), min_order: parseFloat(couponForm.min_order) || 0, is_active: couponForm.is_active, expires_at: couponForm.expires_at || null };
    if (editingCoupon) await supabase.from('coupons').update(data).eq('id', editingCoupon.id);
    else await supabase.from('coupons').insert([data]);
    setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', min_order: '', is_active: true, expires_at: '' });
    setShowCouponModal(false); setEditingCoupon(null); await loadAll();
  };
  const deleteCoupon = async (id) => { if (!confirm('למחוק?')) return; await supabase.from('coupons').delete().eq('id', id); await loadAll(); };
  const toggleCoupon = async (c) => { await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id); await loadAll(); };

  // ── POPUP ──
  const savePopup = async () => {
    try {
      let imageUrl = popup.image_url || null;
      if (popupImageFile) {
        imageUrl = await upload(popupImageFile, 'popup', 'popup-image.png');
      }
      const popupData = {
        is_active: popup.is_active,
        title: popup.title,
        message: popup.message,
        button_text: popup.button_text,
        image_url: imageUrl
      };
      if (popup.id) {
        await supabase.from('popup_settings').update(popupData).eq('id', popup.id);
      } else {
        // אין שורה בטבלה — צור אחת
        const { data: newPopup } = await supabase.from('popup_settings').insert([popupData]).select().single();
        if (newPopup) setPopup(prev => ({ ...prev, id: newPopup.id }));
      }
      setPopup(prev => ({ ...prev, image_url: imageUrl }));
      alert('הפופ-אפ עודכן!');
    } catch (e) {
      alert('שגיאה בשמירה');
    }
  };

  // ── SETTINGS ──
  const saveStoreSettings = async () => {
    localStorage.setItem('heichal_shipping_settings', JSON.stringify(shippingSettings));
    await supabase.from('store_settings').upsert({ key: 'branding', value: brandingSettings });
    localStorage.setItem('heichal_whatsapp', whatsappNumber);
    localStorage.setItem('heichal_instagram', instagramName);
    alert('ההגדרות נשמרו!');
  };

  const updateShipping = (method, field, value) => {
    setShippingSettings(prev => ({ ...prev, [method]: { ...prev[method], [field]: value } }));
  };
  const updateBranding = (type, field, value) => {
    setBrandingSettings(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  // אפשרויות מוצר (ווריאנטים)
  const addProductOption = () => {
    setProductForm(prev => ({
      ...prev,
      product_options: [...(prev.product_options || []), { name: '', required: false, values: [] }]
    }));
  };
  const updateProductOption = (idx, field, value) => {
    setProductForm(prev => {
      const opts = [...(prev.product_options || [])];
      opts[idx] = { ...opts[idx], [field]: value };
      return { ...prev, product_options: opts };
    });
  };
  const removeProductOption = (idx) => {
    setProductForm(prev => ({
      ...prev,
      product_options: prev.product_options.filter((_, i) => i !== idx)
    }));
  };
  const addOptionValue = (optIdx) => {
    setProductForm(prev => {
      const opts = [...(prev.product_options || [])];
      opts[optIdx] = { ...opts[optIdx], values: [...(opts[optIdx].values || []), { label: '', price_delta: 0 }] };
      return { ...prev, product_options: opts };
    });
  };
  const updateOptionValue = (optIdx, valIdx, field, value) => {
    setProductForm(prev => {
      const opts = [...(prev.product_options || [])];
      const vals = [...(opts[optIdx].values || [])];
      vals[valIdx] = { ...vals[valIdx], [field]: field === 'price_delta' ? parseFloat(value) || 0 : value };
      opts[optIdx] = { ...opts[optIdx], values: vals };
      return { ...prev, product_options: opts };
    });
  };
  const removeOptionValue = (optIdx, valIdx) => {
    setProductForm(prev => {
      const opts = [...(prev.product_options || [])];
      opts[optIdx] = { ...opts[optIdx], values: opts[optIdx].values.filter((_, i) => i !== valIdx) };
      return { ...prev, product_options: opts };
    });
  };
  const toggleComplementary = (productId) => {
    setProductForm(prev => {
      const ids = prev.complementary_ids || [];
      return {
        ...prev,
        complementary_ids: ids.includes(productId)
          ? ids.filter(id => id !== productId)
          : [...ids, productId]
      };
    });
  };

  // ── BANNER & LOGO ──
  const uploadBanner = async () => {
    if (!bannerFile) return;
    setUploading(true);
    await supabase.storage.from('banners').remove(['banner.png']);
    const { error } = await supabase.storage.from('banners').upload('banner.png', bannerFile, { upsert: true });
    setUploading(false);
    if (error) { alert('שגיאה'); return; }
    alert('הבאנר עודכן!');
    setBannerFile(null);
    setBannerPreview(`${supabaseUrl}/storage/v1/object/public/banners/banner.png?t=${Date.now()}`);
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    const url = await upload(logoFile, 'banners', 'logo.png');
    if (url) {
      const newUrl = `${url}?t=${Date.now()}`;
      setLogoUrl(newUrl);
      setLogoPreview(newUrl);
      setLogoFile(null);
      alert('הלוגו עודכן!');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const exportMarketingEmails = () => {
    const consented = orders.filter(o => o.marketing_consent);
    if (consented.length === 0) { alert('אין לקוחות שהסכימו לדיוור'); return; }
    const csv = 'שם,אימייל,טלפון\n' + consented.map(o => `${o.customer_name},${o.customer_email},${o.customer_phone || ''}`).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'רשימת_דיוור.csv'; a.click();
  };

  const filtered = products.filter(p => {
    const s = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const c = !filterCat || p.category_id?.toString() === filterCat;
    return s && c;
  });

  const parentCats = categories.filter(c => c.is_parent);
  const regularCats = categories.filter(c => !c.is_parent && !c.parent_id);
  const subCats = (pid) => categories.filter(c => c.parent_id?.toString() === pid?.toString());
  const featured = products.filter(p => p.is_featured);

  const TABS = [
    { id: 'overview', label: 'סקירה', icon: <Grid size={15}/> },
    { id: 'products', label: 'מוצרים', icon: <Package size={15}/> },
    { id: 'featured', label: 'מומלצים', icon: <Star size={15}/> },
    { id: 'categories', label: 'קטגוריות', icon: <Tag size={15}/> },
    { id: 'reviews', label: 'המלצות', icon: <MessageSquare size={15}/> },
    { id: 'coupons', label: 'קופונים', icon: <Percent size={15}/> },
    { id: 'popup', label: 'פופ-אפ', icon: <Bell size={15}/> },
    { id: 'banner', label: 'באנר/לוגו', icon: <Image size={15}/> },
    { id: 'shipping', label: 'משלוחים', icon: <Truck size={15}/> },
    { id: 'settings', label: 'הגדרות', icon: <Settings size={15}/> },
    { id: 'orders', label: 'הזמנות', icon: <ShoppingBag size={15}/> },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', border: `3px solid ${BR}`, borderTopColor: G, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color: '#999', fontSize: '14px', fontFamily: '"Heebo",sans-serif' }}>טוען...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: '"Heebo",sans-serif', direction: 'rtl' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea{font-family:"Heebo",sans-serif}
        input:focus,select:focus,textarea:focus{outline:2px solid ${G};outline-offset:-1px}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}
        .modal{background:#fff;border-radius:18px;padding:28px;max-width:620px;width:100%;max-height:92vh;overflow-y:auto}
        .pcard{transition:transform 0.15s,box-shadow 0.15s}
        .pcard:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.08)}
        .tabBtn{transition:all 0.15s}
        .tabBtn:hover{background:#f0ece3 !important}
        .arrow{display:inline-block;transition:transform 0.2s;font-size:10px;color:${G}}
        .arrow.open{transform:rotate(90deg)}
        @media(max-width:768px){
          .modal{padding:20px;border-radius:14px}
          .hide-mobile{display:none!important}
          .mobile-full{width:100%!important}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: BK, borderBottom: `2px solid ${G}`, padding: '0 20px', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="לוגו" style={{ height: '36px', objectFit: 'contain' }}
                onError={e => e.target.style.display = 'none'} />
            ) : (
              <div style={{ width: '32px', height: '32px', background: G, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: BK }}>✦</div>
            )}
            <span style={{ color: WH, fontSize: '15px', fontWeight: '700' }}>ההיכל</span>
            <span style={{ color: '#555', fontSize: '11px' }} className="hide-mobile">/ ניהול</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', background: 'none', border: 'none', color: WH, cursor: 'pointer', padding: '4px' }}
              className="mobile-menu-btn">
              ☰
            </button>
            <button onClick={onLogout} style={{ ...btn('#222', '#aaa'), fontSize: '12px', padding: '7px 12px' }}>
              <LogOut size={13}/> יציאה
            </button>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: WH, borderBottom: `1px solid ${BR}`, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', padding: '0 16px', minWidth: 'max-content' }}>
          {TABS.map(t => (
            <button key={t.id} className="tabBtn" onClick={() => { setTab(t.id); setMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '12px 14px', background: 'none', border: 'none', borderBottom: tab === t.id ? `3px solid ${G}` : '3px solid transparent', color: tab === t.id ? BK : '#888', fontWeight: tab === t.id ? '700' : '400', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: '"Heebo",sans-serif' }}>
              <span style={{ color: tab === t.id ? G : '#ccc' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>


       {/* ORDERS */}
      {tab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: BK }}>הזמנות</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{orders.length} הזמנות סה"כ</div>
            </div>
            <button onClick={exportMarketingEmails} style={btn(G, BK, { fontSize: '13px' })}>📧 ייצא רשימת דיוור</button>
          </div>
          {orders.length === 0 ? (
            <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#bbb' }}>
              <ShoppingBag size={40} color="#ddd" style={{ marginBottom: '10px' }}/>
              <p>אין הזמנות עדיין</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {orders.map(o => (
                <div key={o.id} style={{ ...card, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: BK }}>{o.order_number}</span>
                        {o.marketing_consent && <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#16a34a', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>📧 מסכים לדיוור</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: BK, fontWeight: '600' }}>{o.customer_name}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{o.customer_email} • {o.customer_phone}</div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                        {new Date(o.created_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: BK }}>₪{parseFloat(o.total || 0).toLocaleString('he-IL')}</div>
                <select value={o.status || 'pending'} onChange={e => updateOrderStatus(o.id, e.target.value)}
                  style={{ ...inp, width: 'auto', padding: '6px 10px', fontSize: '12px', fontWeight: '600',
                    background: o.status === 'completed' ? '#ecfdf5' : o.status === 'shipped' ? '#eff6ff' : o.status === 'processing' ? '#fef9ee' : '#f9f9f7',
                    color: o.status === 'completed' ? '#16a34a' : o.status === 'shipped' ? '#2563eb' : o.status === 'processing' ? '#92400e' : '#666'
                  }}>
                  <option value="pending">⏳ ממתין</option>
                  <option value="processing">🔧 בטיפול</option>
                  <option value="shipped">🚚 נשלח</option>
                  <option value="completed">✅ הושלם</option>
                  <option value="cancelled">❌ בוטל</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${BR}` }}>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>פריטים:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(Array.isArray(o.items) ? o.items : []).map((item, i) => (
                  <span key={i} style={{ fontSize: '11px', background: BG, border: `1px solid ${BR}`, padding: '3px 8px', borderRadius: '20px' }}>
                    {item.name} ×{item.quantity}
                  </span>
                ))}
              </div>
            </div>
            {o.notes && <div style={{ marginTop: '8px', fontSize: '12px', color: '#666', background: BG, padding: '8px 12px', borderRadius: '6px' }}>📝 {o.notes}</div>}
          </div>
        ))}
      </div>
    )}
  </div>
)}   
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'מוצרים', val: products.length, icon: <Package size={20} color={G}/>, sub: 'פעילים' },
                { label: 'קטגוריות', val: categories.filter(c=>!c.is_parent).length, icon: <Tag size={20} color={G}/>, sub: 'עם מוצרים' },
                { label: 'מומלצים', val: featured.length, icon: <Star size={20} color={G}/>, sub: 'בעמוד הבית' },
                { label: 'במבצע', val: products.filter(p=>p.on_sale).length, icon: <Percent size={20} color={G}/>, sub: 'עם הנחה' },
                { label: 'ללא תמונה', val: products.filter(p=>!p.primary_image).length, icon: <AlertTriangle size={20} color={products.filter(p=>!p.primary_image).length > 0 ? '#f59e0b' : G}/>, sub: 'לתשומת לב' },
                { label: 'המלצות', val: reviews.length, icon: <MessageSquare size={20} color={G}/>, sub: 'ביקורות' },
                { label: 'קופונים', val: coupons.filter(c=>c.is_active).length, icon: <Award size={20} color={G}/>, sub: 'פעילים' },
              ].map((s,i) => (
                <div key={i} style={{ ...card, padding: '16px 18px' }}>
                  <div style={{ marginBottom: '8px' }}>{s.icon}</div>
                  <div style={{ fontSize: '26px', fontWeight: '700', color: BK, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: BK, marginTop: '5px' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: BK, marginBottom: '12px' }}>פעולות מהירות</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => openProductModal()} style={btn(G, BK, { fontSize: '13px', padding: '9px 16px' })}><Plus size={14}/> מוצר</button>
                <button onClick={() => { setCatForm({name:'',is_parent:false,parent_id:''}); setCatImageFile(null); setEditingCat(null); setShowCatModal(true); }} style={btn(BK, WH, { fontSize: '13px', padding: '9px 16px' })}><Plus size={14}/> קטגוריה</button>
                <button onClick={() => setTab('banner')} style={{ ...btn(WH, BK, { fontSize: '13px', padding: '9px 16px', border: `1px solid ${BR}` }) }}><Image size={14}/> באנר</button>
                <button onClick={() => { setEditingReview(null); setReviewForm({text:'',stars:5}); setShowReviewModal(true); }} style={{ ...btn(WH, BK, { fontSize: '13px', padding: '9px 16px', border: `1px solid ${BR}` }) }}><Star size={14}/> המלצה</button>
                <button onClick={() => setTab('popup')} style={{ ...btn(WH, BK, { fontSize: '13px', padding: '9px 16px', border: `1px solid ${BR}` }) }}><Bell size={14}/> פופ-אפ</button>
              </div>
            </div>
          </div>
        )}



        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div style={{ ...card, padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => openProductModal()} style={btn(G, BK, { padding: '10px 18px' })}><Plus size={15}/> מוצר חדש</button>
              <div style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' }} />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="חיפוש..." style={{ ...inp, paddingRight: '34px', padding: '10px 34px 10px 12px' }} />
              </div>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inp, width: 'auto', minWidth: '140px', padding: '10px 12px' }}>
                <option value="">כל הקטגוריות</option>
                {categories.filter(c=>!c.is_parent).map(c => <option key={c.id} value={c.id}>{c.parent_id ? `↳ ${c.name}` : c.name}</option>)}
              </select>
            </div>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>{filtered.length} מוצרים</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '14px' }}>
              {filtered.map(p => (
                <div key={p.id} className="pcard" style={{ ...card, position: 'relative', overflow: 'hidden' }}>
                  {p.is_featured && <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: G, borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={12} fill={BK} color={BK}/></div>}
                  <div style={{ height: '190px', background: BG, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.primary_image ? <img src={p.primary_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={40} color="#ddd"/>}
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px', color: BK }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>{p.category_name || 'ללא קטגוריה'}</div>
                    {p.dimensions && <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>📐 {p.dimensions}</div>}
                    {p.material && <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>🔩 {p.material}</div>}
                    {p.allows_engraving && Array.isArray(p.engraving_type) && p.engraving_type.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {p.engraving_type.map(t => {
                          const opt = ENGRAVING_OPTIONS.find(o => o.value === t);
                          return opt ? (
                            <span key={t} style={{ fontSize: '10px', background: '#fef9ee', border: `1px solid ${G}`, color: '#8a6d00', padding: '2px 7px', borderRadius: '20px' }}>
                              {opt.icon} {opt.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      {p.on_sale && p.sale_price ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '12px', color: '#bbb', textDecoration: 'line-through' }}>₪{p.price}</span>
                          <span style={{ fontSize: '17px', fontWeight: '700', color: '#dc2626' }}>₪{p.sale_price}</span>
                        </div>
                      ) : <span style={{ fontSize: '17px', fontWeight: '700', color: BK }}>₪{p.price}</span>}
                      <span style={{ fontSize: '10px', color: '#bbb', background: BG, padding: '2px 7px', borderRadius: '20px' }}>מלאי: {p.stock_quantity || 0}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '7px' }}>
                      <button onClick={() => openImagesModal(p)} style={{ flex: 1, ...btn(BG, '#666', { padding: '6px', fontSize: '11px', justifyContent: 'center', border: `1px solid ${BR}` }) }}>📷 {p.images_count}</button>
                      <button onClick={() => openColorsModal(p)} style={{ flex: 1, ...btn(BG, '#666', { padding: '6px', fontSize: '11px', justifyContent: 'center', border: `1px solid ${BR}` }) }}>🎨 {p.colors_count}</button>
                      <button onClick={() => toggleFeatured(p)} style={{ ...btn(BG, p.is_featured ? G : '#bbb', { padding: '6px 9px', border: `1px solid ${p.is_featured ? G : BR}` }) }}><Star size={13} fill={p.is_featured ? G : 'none'}/></button>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => openProductModal(p)} style={{ flex: 1, ...btn(BK, WH, { padding: '7px', justifyContent: 'center', fontSize: '12px' }) }}><Edit size={12}/> ערוך</button>
                      <button onClick={() => deleteProduct(p.id)} style={{ ...btn(WH, '#dc2626', { padding: '7px 10px', border: '1px solid #fca5a5' }) }}><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#bbb' }}>
                <Package size={40} color="#ddd" style={{ marginBottom: '10px' }}/>
                <p>לא נמצאו מוצרים</p>
              </div>
            )}
          </div>
        )}

        {/* FEATURED */}
        {tab === 'featured' && (
          <div>
            <div style={{ ...card, padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: BK }}>מוצרים מומלצים</div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>מופיעים בעמוד הבית — "המיוחדים שלנו"</div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: G }}>{featured.length}</div>
            </div>
            {featured.length === 0 ? (
              <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#bbb' }}>
                <Star size={40} color="#ddd" style={{ marginBottom: '10px' }}/>
                <p>אין מוצרים מומלצים</p>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>לחץ על ⭐ בכרטיס מוצר</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '14px' }}>
                {featured.map(p => (
                  <div key={p.id} style={{ ...card, border: `2px solid ${G}`, overflow: 'hidden' }}>
                    <div style={{ height: '170px', background: BG, overflow: 'hidden', position: 'relative' }}>
                      {p.primary_image ? <img src={p.primary_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Package size={36} color="#ddd"/></div>}
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: G, borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={12} fill={BK} color={BK}/></div>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{p.name}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openProductModal(p)} style={{ flex: 1, ...btn(BK, WH, { padding: '7px', justifyContent: 'center', fontSize: '12px' }) }}>ערוך</button>
                        <button onClick={() => toggleFeatured(p)} style={{ ...btn(WH, '#dc2626', { padding: '7px 10px', border: '1px solid #fca5a5', fontSize: '11px' }) }}>הסר</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES */}
        {tab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: selCatPanel ? '280px 1fr' : '1fr', gap: '16px' }}>
            <div style={{ ...card, padding: '20px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: BK }}>קטגוריות</div>
                <button onClick={() => { setCatForm({name:'',is_parent:false,parent_id:''}); setCatImageFile(null); setEditingCat(null); setShowCatModal(true); }} style={btn(G, BK, { padding: '6px 12px', fontSize: '12px' })}>+ הוסף</button>
              </div>
              <div style={{ display: 'grid', gap: '5px' }}>
                {parentCats.map(pc => {
                  const isOpen = openParents[pc.id];
                  const subs = subCats(pc.id);
                  return (
                    <div key={pc.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: BK, borderRadius: isOpen ? '8px 8px 0 0' : '8px', cursor: 'pointer', borderRight: `4px solid ${G}` }}
                        onClick={() => setOpenParents(p => ({ ...p, [pc.id]: !p[pc.id] }))}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span className={`arrow ${isOpen ? 'open' : ''}`}>▶</span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: WH }}>{pc.name}</div>
                            <div style={{ fontSize: '10px', color: '#666' }}>{subs.length} תתי-קטגוריות</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEditCat(pc)} style={{ padding: '3px 7px', background: G, color: BK, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: '600' }}>ערוך</button>
                          <button onClick={() => deleteCat(pc.id)} style={{ padding: '3px 5px', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={10}/></button>
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{ background: '#fafaf8', border: `1px solid ${BR}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '4px' }}>
                          {subs.length === 0
                            ? <div style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#bbb' }}>אין תתי-קטגוריות</div>
                            : subs.map(sc => {
                              const cnt = products.filter(p => p.category_id?.toString() === sc.id?.toString()).length;
                              const isSel = selCatPanel?.toString() === sc.id?.toString();
                              return (
                                <div key={sc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: isSel ? BK : WH, borderRadius: '6px', marginBottom: '2px', cursor: 'pointer', borderRight: `3px solid ${G}` }}
                                  onClick={() => setSelCatPanel(isSel ? null : sc.id)}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {sc.image_url && <img src={sc.image_url} alt={sc.name} style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '3px' }} />}
                                    <div>
                                      <div style={{ fontSize: '12px', fontWeight: '600', color: isSel ? WH : BK }}>↳ {sc.name}</div>
                                      <div style={{ fontSize: '10px', color: isSel ? '#888' : '#aaa' }}>{cnt} מוצרים</div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '3px' }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openEditCat(sc)} style={{ padding: '3px 6px', background: isSel ? G : BK, color: isSel ? BK : WH, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>ערוך</button>
                                    <button onClick={() => deleteCat(sc.id)} style={{ padding: '3px 4px', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={9}/></button>
                                  </div>
                                </div>
                              );
                            })
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
                {regularCats.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${BR}` }}>
                    <div style={{ fontSize: '10px', color: '#bbb', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>קטגוריות רגילות</div>
                    {regularCats.map(c => {
                      const cnt = products.filter(p => p.category_id?.toString() === c.id?.toString()).length;
                      const isSel = selCatPanel?.toString() === c.id?.toString();
                      return (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: isSel ? BK : '#f9f9f7', borderRadius: '7px', marginBottom: '3px', cursor: 'pointer', borderRight: '3px solid #aaa' }}
                          onClick={() => setSelCatPanel(isSel ? null : c.id)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {c.image_url && <img src={c.image_url} alt={c.name} style={{ width: '26px', height: '26px', objectFit: 'cover', borderRadius: '4px' }} />}
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: isSel ? WH : BK }}>{c.name}</div>
                              <div style={{ fontSize: '10px', color: isSel ? '#888' : '#aaa' }}>{cnt} מוצרים</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEditCat(c)} style={{ padding: '3px 7px', background: isSel ? G : BK, color: isSel ? BK : WH, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>ערוך</button>
                            <button onClick={() => deleteCat(c.id)} style={{ padding: '3px 5px', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={10}/></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {selCatPanel && (() => {
              const cat = categories.find(c => c.id?.toString() === selCatPanel?.toString());
              const catProds = products.filter(p => p.category_id?.toString() === selCatPanel?.toString());
              return (
                <div style={{ ...card, padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: BK }}>{cat?.name}</div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{catProds.length} מוצרים</div>
                    </div>
                    <button onClick={() => openProductModal(null, selCatPanel)} style={btn(G, BK, { fontSize: '13px' })}><Plus size={14}/> הוסף</button>
                  </div>
                  {catProds.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#bbb', border: `2px dashed ${BR}`, borderRadius: '10px' }}>
                      <Package size={32} color="#ddd" style={{ marginBottom: '8px' }}/>
                      <p style={{ marginBottom: '12px', fontSize: '13px' }}>אין מוצרים</p>
                      <button onClick={() => openProductModal(null, selCatPanel)} style={btn(G, BK, { fontSize: '12px' })}>+ הוסף ראשון</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '10px' }}>
                      {catProds.map(p => (
                        <div key={p.id} style={{ border: `1px solid ${BR}`, borderRadius: '9px', overflow: 'hidden' }}>
                          <div style={{ height: '120px', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            {p.primary_image ? <img src={p.primary_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={28} color="#ddd"/>}
                            {p.is_featured && <div style={{ position: 'absolute', top: '4px', right: '4px', background: G, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={9} fill={BK} color={BK}/></div>}
                          </div>
                          <div style={{ padding: '9px 10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: BK, marginBottom: '7px' }}>₪{p.sale_price || p.price}</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button onClick={() => openProductModal(p)} style={{ flex: 1, ...btn(BK, WH, { padding: '5px', fontSize: '10px', justifyContent: 'center' }) }}>ערוך</button>
                              <button onClick={() => openImagesModal(p)} style={{ ...btn(BG, '#666', { padding: '5px 6px', fontSize: '10px', border: `1px solid ${BR}` }) }}>📷</button>
                              <button onClick={() => deleteProduct(p.id)} style={{ ...btn(WH, '#dc2626', { padding: '5px', border: '1px solid #fca5a5' }) }}><Trash2 size={11}/></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '700', color: BK }}>המלצות</div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>מופיעות בעמוד הבית</div>
              </div>
              <button onClick={() => { setEditingReview(null); setReviewForm({text:'',stars:5}); setShowReviewModal(true); }} style={btn(G, BK, { fontSize: '13px' })}><Plus size={14}/> הוסף</button>
            </div>
            {reviews.length === 0 ? (
              <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#bbb' }}><MessageSquare size={36} color="#ddd" style={{ marginBottom: '10px' }}/><p>אין המלצות</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '12px' }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ ...card, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                      {[...Array(5)].map((_,i) => <Star key={i} size={14} fill={i < (r.stars||5) ? G : '#ddd'} color={i < (r.stars||5) ? G : '#ddd'}/>)}
                    </div>
                    <p style={{ fontSize: '13px', color: BK, lineHeight: '1.6', marginBottom: '12px' }}>"{r.text}"</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditingReview(r); setReviewForm({text:r.text,stars:r.stars||5}); setShowReviewModal(true); }} style={{ flex: 1, ...btn(BK, WH, { padding: '7px', justifyContent: 'center', fontSize: '12px' }) }}><Edit size={11}/> ערוך</button>
                      <button onClick={() => deleteReview(r.id)} style={{ ...btn(WH, '#dc2626', { padding: '7px 9px', border: '1px solid #fca5a5' }) }}><Trash2 size={13}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COUPONS */}
        {tab === 'coupons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '700', color: BK }}>קודי קופון</div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>ניהול הנחות לפי קוד</div>
              </div>
              <button onClick={() => { setEditingCoupon(null); setCouponForm({code:'',discount_type:'percentage',discount_value:'',min_order:'',is_active:true,expires_at:''}); setShowCouponModal(true); }} style={btn(G, BK, { fontSize: '13px' })}><Plus size={14}/> קופון חדש</button>
            </div>
            {coupons.length === 0 ? (
              <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#bbb' }}><Percent size={36} color="#ddd" style={{ marginBottom: '10px' }}/><p>אין קופונים</p></div>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {coupons.map(c => (
                  <div key={c.id} style={{ ...card, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{ background: c.is_active ? G : '#eee', color: c.is_active ? BK : '#aaa', padding: '5px 12px', borderRadius: '7px', fontWeight: '700', fontSize: '14px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{c.code}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: BK }}>
                          {c.discount_type === 'percentage' ? `${c.discount_value}% הנחה` : `₪${c.discount_value} הנחה`}
                        </div>
                        <div style={{ fontSize: '11px', color: '#aaa', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                          {c.min_order > 0 && <span>מינ׳ ₪{c.min_order}</span>}
                          {c.expires_at && <span>עד {new Date(c.expires_at).toLocaleDateString('he-IL')}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: c.is_active ? '#16a34a' : '#aaa' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.is_active ? '#16a34a' : '#ddd' }}></div>
                        {c.is_active ? 'פעיל' : 'כבוי'}
                      </div>
                      <button onClick={() => toggleCoupon(c)} style={{ ...btn(BG, BK, { padding: '5px 10px', fontSize: '11px', border: `1px solid ${BR}` }) }}>{c.is_active ? 'השבת' : 'הפעל'}</button>
                      <button onClick={() => { setEditingCoupon(c); setCouponForm({code:c.code,discount_type:c.discount_type,discount_value:c.discount_value,min_order:c.min_order||'',is_active:c.is_active,expires_at:c.expires_at||''}); setShowCouponModal(true); }} style={{ ...btn(BK, WH, { padding: '5px 10px', fontSize: '11px' }) }}><Edit size={12}/></button>
                      <button onClick={() => deleteCoupon(c.id)} style={{ ...btn(WH, '#dc2626', { padding: '5px 8px', border: '1px solid #fca5a5' }) }}><Trash2 size={13}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* POPUP */}
        {tab === 'popup' && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{ ...card, padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: BK }}>פופ-אפ קופץ</div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '3px' }}>חלון שמופיע אוטומטית למבקרים חדשים</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px', color: popup.is_active ? '#16a34a' : '#aaa', fontWeight: '600' }}>{popup.is_active ? 'פעיל' : 'כבוי'}</span>
                  <div style={{ position: 'relative', width: '42px', height: '22px' }} onClick={() => setPopup({...popup, is_active: !popup.is_active})}>
                    <div style={{ width: '42px', height: '22px', background: popup.is_active ? G : '#ddd', borderRadius: '11px', transition: 'background 0.2s' }}></div>
                    <div style={{ position: 'absolute', top: '3px', left: popup.is_active ? '22px' : '3px', width: '16px', height: '16px', background: WH, borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>

                {/* תמונת פופ-אפ */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: BK }}>
                    תמונת הפופ-אפ
                    <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '400', marginRight: '6px' }}>— זו התמונה שתקפוץ לגולשים</span>
                  </label>
                  <div style={{ background: BG, borderRadius: '10px', border: `2px dashed ${BR}`, padding: '16px', textAlign: 'center', marginBottom: '10px', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {popupImagePreview ? (
                      <div style={{ position: 'relative', width: '100%' }}>
                        <img src={popupImagePreview} alt="popup preview" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'contain' }} />
                        <button onClick={() => { setPopupImagePreview(null); setPopupImageFile(null); setPopup({...popup, image_url: null}); }}
                          style={{ position: 'absolute', top: '-8px', left: '-8px', background: '#dc2626', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: WH, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={12}/>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} color="#ccc" style={{ marginBottom: '8px' }}/>
                        <div style={{ fontSize: '12px', color: '#bbb' }}>העלה תמונה לפופ-אפ</div>
                        <div style={{ fontSize: '11px', color: '#ccc', marginTop: '3px' }}>מומלץ: 600×400px</div>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files[0];
                    if (f) { setPopupImageFile(f); setPopupImagePreview(URL.createObjectURL(f)); }
                  }} style={inp} />
                </div>

                {/* טקסט אופציונלי */}
                <div style={{ background: BG, borderRadius: '8px', padding: '14px', border: `1px solid ${BR}` }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: BK, marginBottom: '10px' }}>טקסט על הפופ-אפ (אופציונלי)</div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>כותרת</label>
                      <input value={popup.title || ''} onChange={e => setPopup({...popup, title: e.target.value})} style={{ ...inp, padding: '9px 12px', fontSize: '13px' }} placeholder="לדוגמה: 10% הנחה לנרשמים חדשים!" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>הודעה</label>
                      <textarea value={popup.message || ''} onChange={e => setPopup({...popup, message: e.target.value})} rows="2" style={{ ...inp, padding: '9px 12px', fontSize: '13px', resize: 'vertical' }} placeholder="תוכן ההודעה..."></textarea>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>טקסט כפתור סגירה</label>
                      <input value={popup.button_text || 'סגור'} onChange={e => setPopup({...popup, button_text: e.target.value})} style={{ ...inp, padding: '9px 12px', fontSize: '13px' }} />
                    </div>
                  </div>
                </div>

                {/* תצוגה מקדימה */}
                {popup.is_active && (popupImagePreview || popup.title) && (
                  <div style={{ background: BG, borderRadius: '10px', padding: '16px', border: `1px solid ${BR}` }}>
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px', fontWeight: '600' }}>👁 תצוגה מקדימה — כך יראה הפופ-אפ:</div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: WH, borderRadius: '12px', overflow: 'hidden', maxWidth: '280px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', position: 'relative' }}>
                        <button style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', color: WH, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>✕</button>
                        {popupImagePreview && <img src={popupImagePreview} alt="popup" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover' }} />}
                        {(popup.title || popup.message) && (
                          <div style={{ padding: '14px', textAlign: 'center' }}>
                            {popup.title && <div style={{ fontSize: '14px', fontWeight: '700', color: BK, marginBottom: '6px' }}>{popup.title}</div>}
                            {popup.message && <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5', marginBottom: '12px' }}>{popup.message}</div>}
                            <div style={{ background: G, color: BK, padding: '7px 16px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', display: 'inline-block' }}>{popup.button_text || 'סגור'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={savePopup} disabled={uploading} style={{ ...btn(G, BK, { padding: '13px', justifyContent: 'center', fontSize: '14px', width: '100%', opacity: uploading ? 0.6 : 1 }) }}>
                  {uploading ? 'שומר...' : '✓ שמור פופ-אפ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BANNER & LOGO */}
        {tab === 'banner' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>

            {/* באנר */}
            <div style={{ ...card, padding: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: BK, marginBottom: '4px' }}>באנר ראשי</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '18px' }}>התמונה הגדולה בראש עמוד הבית</div>
              <div style={{ background: BG, borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center', border: `2px dashed ${BR}`, minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {bannerPreview ? (
                  <img src={bannerPreview} alt="banner" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', objectFit: 'contain' }}
                    onError={e => e.target.style.display='none'} />
                ) : (
                  <div><Image size={32} color="#ddd" style={{ marginBottom: '8px' }}/><div style={{ color: '#bbb', fontSize: '12px' }}>תצוגה מקדימה</div></div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); } }} style={{ ...inp, marginBottom: '12px' }} />
              <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '14px' }}>מומלץ: 1400×600px לפחות</div>
              <button onClick={uploadBanner} disabled={!bannerFile || uploading} style={{ ...btn(G, BK, { padding: '11px 20px', opacity: (!bannerFile || uploading) ? 0.5 : 1 }) }}>
                {uploading ? 'מעלה...' : <><Upload size={14}/> עדכן באנר</>}
              </button>
            </div>

            {/* לוגו */}
            <div style={{ ...card, padding: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: BK, marginBottom: '4px' }}>לוגו החנות</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '18px' }}>מופיע בנאב האתר ובדשבורד הניהול</div>
              <div style={{ background: BG, borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center', border: `2px dashed ${BR}`, minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                    onError={e => e.target.style.display='none'} />
                ) : (
                  <div><Image size={28} color="#ddd" style={{ marginBottom: '6px' }}/><div style={{ color: '#bbb', fontSize: '12px' }}>תצוגה מקדימה</div></div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} style={{ ...inp, marginBottom: '12px' }} />
              <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '14px' }}>מומלץ: PNG שקוף, גובה 60px</div>
              <button onClick={uploadLogo} disabled={!logoFile || uploading} style={{ ...btn(BK, WH, { padding: '11px 20px', opacity: (!logoFile || uploading) ? 0.5 : 1 }) }}>
                {uploading ? 'מעלה...' : <><Upload size={14}/> עדכן לוגו</>}
              </button>
            </div>
          </div>
        )}

        {/* SHIPPING */}
        {tab === 'shipping' && (
          <div style={{ maxWidth: '700px' }}>
            <div style={{ ...card, padding: '28px', marginBottom: '20px' }}>
              <div style={{ fontSize: '17px', fontWeight: '700', color: BK, marginBottom: '6px' }}>אפשרויות משלוח</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '22px' }}>הגדר את שיטות המשלוח ומחיריהן</div>
              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { key: 'standard', label: 'משלוח רגיל', icon: '📦', showFree: true },
                  { key: 'express', label: 'משלוח מהיר', icon: '🚀', showFree: false },
                  { key: 'pickup', label: 'איסוף עצמי', icon: '🏪', showFree: false },
                ].map(({ key, label, icon, showFree }) => (
                  <div key={key} style={{ background: BG, borderRadius: '10px', padding: '16px', border: `1px solid ${BR}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: BK }}>{icon} {label}</div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={shippingSettings[key]?.enabled !== false} onChange={e => updateShipping(key, 'enabled', e.target.checked)} style={{ width: 'auto', accentColor: G }} />
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>פעיל</span>
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: showFree ? '1fr 1fr 1fr' : '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>שם</label>
                        <input value={shippingSettings[key]?.name || ''} onChange={e => updateShipping(key, 'name', e.target.value)} style={{ ...inp, padding: '9px 12px', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>תיאור</label>
                        <input value={shippingSettings[key]?.description || ''} onChange={e => updateShipping(key, 'description', e.target.value)} style={{ ...inp, padding: '9px 12px', fontSize: '13px' }} />
                      </div>
                      {showFree ? (
                        <>
                          <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>מחיר (₪)</label>
                            <input type="number" value={shippingSettings[key]?.price ?? ''} onChange={e => updateShipping(key, 'price', parseFloat(e.target.value) || 0)} style={{ ...inp, padding: '9px 12px', fontSize: '13px' }} />
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>משלוח חינם מעל (₪)</label>
                            <input type="number" value={shippingSettings[key]?.free_above ?? ''} onChange={e => updateShipping(key, 'free_above', parseFloat(e.target.value) || 0)} style={{ ...inp, padding: '9px 12px', fontSize: '13px', maxWidth: '200px' }} />
                          </div>
                        </>
                      ) : key !== 'pickup' && (
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>מחיר (₪)</label>
                          <input type="number" value={shippingSettings[key]?.price ?? ''} onChange={e => updateShipping(key, 'price', parseFloat(e.target.value) || 0)} style={{ ...inp, padding: '9px 12px', fontSize: '13px' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={() => { localStorage.setItem('heichal_shipping_settings', JSON.stringify(shippingSettings)); alert('הגדרות משלוח נשמרו!'); }} style={{ ...btn(G, BK, { padding: '13px', justifyContent: 'center', fontSize: '14px', width: '100%' }) }}>
                  <Truck size={15}/> שמור הגדרות משלוח
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div style={{ display: 'grid', gap: '20px', maxWidth: '700px' }}>
            {/* פרטי חנות */}
            <div style={{ ...card, padding: '28px' }}>
              <div style={{ fontSize: '17px', fontWeight: '700', color: BK, marginBottom: '22px' }}>פרטי החנות</div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: BK }}>שם החנות</label>
                  <input value="ההיכל" style={inp} readOnly />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: BK }}>מספר וואטסאפ</label>
                  <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} style={inp} placeholder="972542115584" />
                  <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>ללא + ומקפים — מספר זה ישמש לכפתור הוואטסאפ הצף</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: BK }}>שם אינסטגרם</label>
                  <input value={instagramName} onChange={e => setInstagramName(e.target.value)} style={inp} placeholder="hahiechal_judaica" />
                </div>
              </div>
            </div>

            {/* הגדרות מיתוג */}
            <div style={{ ...card, padding: '28px' }}>
              <div style={{ fontSize: '17px', fontWeight: '700', color: BK, marginBottom: '6px' }}>הגדרות מיתוג והתאמה אישית</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '18px' }}>הגדר מחיר ומגבלת תווים לכל סוג מיתוג</div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { key: 'engraving', label: 'חריטה', icon: '✍️' },
                  { key: 'embroidery', label: 'רקמה', icon: '🧵' },
                  { key: 'embossing', label: 'הטבעה', icon: '🔏' },
                  { key: 'printing', label: 'הדפסה', icon: '🖨️' },
                ].map(({ key, label, icon }) => (
                  <div key={key} style={{ background: BG, borderRadius: '10px', padding: '14px', border: `1px solid ${BR}` }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: BK, marginBottom: '10px' }}>{icon} {label}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>מחיר (₪)</label>
                        <input type="number" min="0" value={brandingSettings[key]?.price ?? ''} onChange={e => updateBranding(key, 'price', parseFloat(e.target.value) || 0)} style={{ ...inp, padding: '9px 12px', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600' }}>מגבלת תווים</label>
                        <input type="number" min="1" max="500" value={brandingSettings[key]?.text_limit ?? ''} onChange={e => updateBranding(key, 'text_limit', parseInt(e.target.value) || 30)} style={{ ...inp, padding: '9px 12px', fontSize: '13px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveStoreSettings} style={{ ...btn(G, BK, { padding: '13px', justifyContent: 'center', fontSize: '14px', width: '100%' }) }}>
              <Settings size={15}/> שמור את כל ההגדרות
            </button>
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => { setShowCatModal(false); setEditingCat(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '17px', fontWeight: '700' }}>{editingCat ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}</div>
              <button onClick={() => { setShowCatModal(false); setEditingCat(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={20}/></button>
            </div>
            <form onSubmit={saveCat}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>שם *</label>
                  <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} style={inp} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>סוג:</label>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {[
                      { v: 'regular', l: 'קטגוריה רגילה', d: 'עצמאית עם מוצרים', active: !catForm.is_parent && !catForm.parent_id },
                      { v: 'parent', l: 'קטגוריה ראשית', d: 'תפריט בנאב — ללא מוצרים', active: catForm.is_parent },
                      { v: 'sub', l: 'תת-קטגוריה', d: 'שייכת לקטגוריה ראשית', active: !catForm.is_parent && !!catForm.parent_id },
                    ].map(opt => (
                      <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 13px', background: opt.active ? BK : BG, borderRadius: '8px', cursor: 'pointer', border: `1px solid ${opt.active ? BK : BR}` }}>
                        <input type="radio" name="ctype" checked={opt.active} onChange={() => {
                          if (opt.v === 'regular') setCatForm({...catForm, is_parent: false, parent_id: ''});
                          if (opt.v === 'parent') setCatForm({...catForm, is_parent: true, parent_id: ''});
                          if (opt.v === 'sub') setCatForm({...catForm, is_parent: false, parent_id: parentCats[0]?.id || ''});
                        }} style={{ width: 'auto', accentColor: G }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: opt.active ? WH : BK }}>{opt.l}</div>
                          <div style={{ fontSize: '11px', color: opt.active ? '#888' : '#aaa' }}>{opt.d}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {!catForm.is_parent && !!catForm.parent_id && (
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>שייכת ל:</label>
                      <select value={catForm.parent_id} onChange={e => setCatForm({...catForm, parent_id: e.target.value})} style={inp}>
                        {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>תמונה</label>
                  {editingCat?.image_url && !catImageFile && <img src={editingCat.image_url} alt="" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '7px', marginBottom: '8px' }} />}
                  <input type="file" accept="image/*" onChange={e => setCatImageFile(e.target.files[0])} style={inp} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={uploading} style={{ flex: 1, ...btn(G, BK, { padding: '11px', justifyContent: 'center', opacity: uploading ? 0.5 : 1 }) }}>
                    {uploading ? 'שומר...' : (editingCat ? 'שמור' : 'הוסף')}
                  </button>
                  <button type="button" onClick={() => { setShowCatModal(false); setEditingCat(null); }} style={{ ...btn(BG, BK, { padding: '11px 16px', border: `1px solid ${BR}` }) }}>ביטול</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={closeProductModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '17px', fontWeight: '700' }}>{editingProduct ? 'עריכת מוצר' : 'מוצר חדש'}</div>
              <button onClick={closeProductModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={20}/></button>
            </div>
            <form onSubmit={saveProduct}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>שם המוצר *</label>
                  <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={inp} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>מחיר (₪) *</label>
                    <input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} style={inp} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>מלאי</label>
                    <input type="number" min="0" value={productForm.stock_quantity} 
                      onChange={e => setProductForm({...productForm, stock_quantity: parseInt(e.target.value) || 0})} 
                      style={inp} placeholder="כמות במלאי" />
                    <div style={{ fontSize: '11px', marginTop: '5px', fontWeight: '600',
                      color: productForm.stock_quantity > 0 ? '#16a34a' : '#dc2626' }}>
                      {productForm.stock_quantity > 0 ? `✅ במלאי (${productForm.stock_quantity} יחידות)` : '❌ אזל המלאי'}
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>קטגוריה</label>
                  <select value={productForm.category_id} onChange={e => setProductForm({...productForm, category_id: e.target.value})} style={inp}>
                    <option value="">בחר קטגוריה</option>
                    {categories.filter(c => !c.is_parent).map(c => <option key={c.id} value={c.id}>{c.parent_id ? `↳ ${c.name}` : c.name}</option>)}
                  </select>
                </div>
                <div style={{ background: BG, padding: '14px', borderRadius: '8px', border: `1px solid ${BR}` }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: BK, marginBottom: '8px' }}>🗂️ קטגוריות נוספות (אופציונלי)</div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px' }}>המוצר יופיע גם בקטגוריות הנוספות שתסמני</div>
                  <div style={{ display: 'grid', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
                    {categories.filter(c => !c.is_parent && c.id?.toString() !== productForm.category_id?.toString()).map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: (productForm.extra_category_ids || []).includes(c.id) ? BK : WH, borderRadius: '6px', cursor: 'pointer', border: `1px solid ${(productForm.extra_category_ids || []).includes(c.id) ? BK : BR}` }}>
                        <input type="checkbox" checked={(productForm.extra_category_ids || []).includes(c.id)} onChange={() => {
                          const ids = productForm.extra_category_ids || [];
                          setProductForm({...productForm, extra_category_ids: ids.includes(c.id) ? ids.filter(id => id !== c.id) : [...ids, c.id]});
                        }} style={{ width: 'auto', accentColor: G }} />
                        <span style={{ fontSize: '12px', fontWeight: '500', color: (productForm.extra_category_ids || []).includes(c.id) ? WH : BK }}>{c.parent_id ? `↳ ${c.name}` : c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>מידות / גודל</label>
                    <input value={productForm.dimensions} onChange={e => setProductForm({...productForm, dimensions: e.target.value})} style={inp} placeholder='לדוגמה: 15×10 ס"מ' />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>חומר</label>
                    <input value={productForm.material} onChange={e => setProductForm({...productForm, material: e.target.value})} style={inp} placeholder='כסף, קריסטל...' />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>תיאור</label>
                  <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows="3" style={{ ...inp, resize: 'vertical' }} placeholder="תיאור המוצר..."></textarea>
                </div>

                {/* checkboxes */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={productForm.is_featured} onChange={e => setProductForm({...productForm, is_featured: e.target.checked})} style={{ width: 'auto', accentColor: G }} />
                    <span style={{ fontSize: '13px' }}>⭐ מומלץ</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={productForm.allows_engraving} onChange={e => setProductForm({...productForm, allows_engraving: e.target.checked, engraving_types: e.target.checked ? productForm.engraving_types : []})} style={{ width: 'auto', accentColor: G }} />
                    <span style={{ fontSize: '13px' }}>✍️ התאמה אישית</span>
                  </label>
                </div>

                {/* סוגי התאמה אישית */}
                {productForm.allows_engraving && (
                  <div style={{ background: '#fef9ee', border: `1px solid ${G}40`, borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: BK, marginBottom: '10px' }}>בחר סוגי התאמה אישית (ניתן לסמן כמה):</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {ENGRAVING_OPTIONS.map(opt => {
                          const isChecked = productForm.engraving_types?.includes(opt.value);
                          return (
                            <div key={opt.value}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: isChecked ? BK : WH, borderRadius: '8px', cursor: 'pointer', border: `1.5px solid ${isChecked ? G : BR}`, transition: 'all 0.15s' }}>
                                <input type="checkbox" checked={isChecked} onChange={() => toggleEngravingType(opt.value)} style={{ width: 'auto', accentColor: G }} />
                                <span style={{ fontSize: '13px', fontWeight: '600', color: isChecked ? WH : BK }}>{opt.icon} {opt.label}</span>
                              </label>
                              {isChecked && (
                              <div style={{ marginTop: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                <input type="number" min="0" step="0.01"
                                  value={productForm.engraving_prices?.[opt.value]?.fixed || ''}
                                  onChange={e => setProductForm({...productForm, engraving_prices: {...(productForm.engraving_prices || {}), [opt.value]: {...(productForm.engraving_prices?.[opt.value] || {}), fixed: parseFloat(e.target.value) || 0}}})}
                                  placeholder="מחיר כללי (₪)"
                                  style={{ ...inp, padding: '8px 10px', fontSize: '12px' }} />
                                <input type="number" min="0" step="0.01"
                                  value={productForm.engraving_prices?.[opt.value]?.per_letter || ''}
                                  onChange={e => setProductForm({...productForm, engraving_prices: {...(productForm.engraving_prices || {}), [opt.value]: {...(productForm.engraving_prices?.[opt.value] || {}), per_letter: parseFloat(e.target.value) || 0}}})}
                                  placeholder="מחיר למילה (₪)"
                                  style={{ ...inp, padding: '8px 10px', fontSize: '12px' }} />
                              </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    {productForm.engraving_types?.length > 0 && (
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#8a6d00' }}>
                        ✓ נבחרו: {productForm.engraving_types.map(t => ENGRAVING_OPTIONS.find(o => o.value === t)?.label).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* מבצע */}
                <div style={{ background: BG, padding: '14px', borderRadius: '8px', border: `1px solid ${BR}` }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', marginBottom: productForm.on_sale ? '12px' : '0' }}>
                    <input type="checkbox" checked={productForm.on_sale} onChange={e => setProductForm({...productForm, on_sale: e.target.checked, sale_percentage: '', sale_price: ''})} style={{ width: 'auto', accentColor: G }} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>🏷️ מבצע / הנחה</span>
                  </label>
                  {productForm.on_sale && (
                    <div>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                        {[['percentage', 'אחוזים (%)'], ['fixed', 'מחיר קבוע (₪)']].map(([v, l]) => (
                          <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input type="radio" name="stype" value={v} checked={productForm.sale_type === v} onChange={e => setProductForm({...productForm, sale_type: e.target.value, sale_price: '', sale_percentage: ''})} style={{ width: 'auto', accentColor: G }} />
                            <span style={{ fontSize: '12px' }}>{l}</span>
                          </label>
                        ))}
                      </div>
                      {productForm.sale_type === 'percentage' ? (
                        <input type="number" min="1" max="99" value={productForm.sale_percentage} onChange={e => setProductForm({...productForm, sale_percentage: e.target.value})} placeholder="% הנחה" style={inp} required={productForm.on_sale} />
                      ) : (
                        <input type="number" step="0.01" value={productForm.sale_price} onChange={e => setProductForm({...productForm, sale_price: e.target.value})} placeholder="מחיר מבצע ₪" style={inp} required={productForm.on_sale} />
                      )}
                      {productForm.price && productForm.sale_percentage && productForm.sale_type === 'percentage' && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                          ✓ מחיר אחרי הנחה: ₪{(parseFloat(productForm.price) * (1 - parseFloat(productForm.sale_percentage)/100)).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>


                {/* אפשרויות מוצר */}
                <div style={{ background: BG, padding: '14px', borderRadius: '8px', border: `1px solid ${BR}` }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: BK, marginBottom: '12px' }}>📋 אפשרויות מוצר</div>

                  {/* גדלים */}
                  <div style={{ marginBottom: '10px', border: `1px solid ${BR}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: WH, cursor: 'pointer' }}>
                      <input type="checkbox" checked={(productForm.product_options || []).some(o => o.name === 'גודל')}
                        onChange={e => {
                          const opts = (productForm.product_options || []).filter(o => o.name !== 'גודל');
                          if (e.target.checked) opts.push({ name: 'גודל', required: true, values: [{ label: '', price_delta: 0 }] });
                          setProductForm({...productForm, product_options: opts});
                        }}
                        style={{ width: 'auto', accentColor: G }} />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>📐 גדלים / מידות</span>
                    </label>
                    {(productForm.product_options || []).some(o => o.name === 'גודל') && (
                      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BR}`, background: BG }}>
                        {((productForm.product_options || []).find(o => o.name === 'גודל')?.values || []).map((val, valIdx) => {
                          const optIdx = (productForm.product_options || []).findIndex(o => o.name === 'גודל');
                          return (
                            <div key={valIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                              <input value={val.label} onChange={e => {
                                const opts = [...productForm.product_options];
                                opts[optIdx].values[valIdx] = { ...opts[optIdx].values[valIdx], label: e.target.value };
                                setProductForm({...productForm, product_options: opts});
                              }} placeholder='למשל: קטן / 20X30' style={{ ...inp, flex: 2, padding: '7px 10px', fontSize: '13px' }} />
                              <input type="number" min="0" value={val.price_delta || ''} onChange={e => {
                                const opts = [...productForm.product_options];
                                opts[optIdx].values[valIdx] = { ...opts[optIdx].values[valIdx], price_delta: parseFloat(e.target.value) || 0 };
                                setProductForm({...productForm, product_options: opts});
                              }} placeholder="תוספת ₪" style={{ ...inp, width: '90px', padding: '7px 10px', fontSize: '13px' }} />
                              <button type="button" onClick={() => {
                                const opts = [...productForm.product_options];
                                opts[optIdx].values = opts[optIdx].values.filter((_, i) => i !== valIdx);
                                setProductForm({...productForm, product_options: opts});
                              }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb' }}><X size={14}/></button>
                            </div>
                          );
                        })}
                        <button type="button" onClick={() => {
                          const opts = [...productForm.product_options];
                          const optIdx = opts.findIndex(o => o.name === 'גודל');
                          opts[optIdx].values = [...(opts[optIdx].values || []), { label: '', price_delta: 0 }];
                          setProductForm({...productForm, product_options: opts});
                        }} style={{ ...btn(BK, WH, { padding: '5px 10px', fontSize: '11px' }) }}><Plus size={10}/> הוסף גודל</button>
                      </div>
                    )}
                  </div>

                  {/* ספייסרים */}
                  <div style={{ marginBottom: '10px', border: `1px solid ${BR}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: WH, cursor: 'pointer' }}>
                      <input type="checkbox" checked={(productForm.product_options || []).some(o => o.name === 'ספייסרים')}
                        onChange={e => {
                          const opts = (productForm.product_options || []).filter(o => o.name !== 'ספייסרים');
                          if (e.target.checked) opts.push({ name: 'ספייסרים', required: true, values: [
                            { label: 'כסף', price_delta: 2 },
                            { label: 'זהב', price_delta: 3 },
                            { label: 'שחור', price_delta: 3 }
                          ]});
                          setProductForm({...productForm, product_options: opts});
                        }}
                        style={{ width: 'auto', accentColor: G }} />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>🔩 ספייסרים</span>
                    </label>
                    {(productForm.product_options || []).some(o => o.name === 'ספייסרים') && (
                      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BR}`, background: BG }}>
                        {((productForm.product_options || []).find(o => o.name === 'ספייסרים')?.values || []).map((val, valIdx) => {
                          const optIdx = (productForm.product_options || []).findIndex(o => o.name === 'ספייסרים');
                          return (
                            <div key={valIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                              <input value={val.label} onChange={e => {
                                const opts = [...productForm.product_options];
                                opts[optIdx].values[valIdx] = { ...opts[optIdx].values[valIdx], label: e.target.value };
                                setProductForm({...productForm, product_options: opts});
                              }} placeholder='צבע ספייסר' style={{ ...inp, flex: 2, padding: '7px 10px', fontSize: '13px' }} />
                              <input type="number" min="0" value={val.price_delta || ''} onChange={e => {
                                const opts = [...productForm.product_options];
                                opts[optIdx].values[valIdx] = { ...opts[optIdx].values[valIdx], price_delta: parseFloat(e.target.value) || 0 };
                                setProductForm({...productForm, product_options: opts});
                              }} placeholder="תוספת ₪" style={{ ...inp, width: '90px', padding: '7px 10px', fontSize: '13px' }} />
                              <button type="button" onClick={() => {
                                const opts = [...productForm.product_options];
                                opts[optIdx].values = opts[optIdx].values.filter((_, i) => i !== valIdx);
                                setProductForm({...productForm, product_options: opts});
                              }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb' }}><X size={14}/></button>
                            </div>
                          );
                        })}
                        <button type="button" onClick={() => {
                          const opts = [...productForm.product_options];
                          const optIdx = opts.findIndex(o => o.name === 'ספייסרים');
                          opts[optIdx].values = [...(opts[optIdx].values || []), { label: '', price_delta: 0 }];
                          setProductForm({...productForm, product_options: opts});
                        }} style={{ ...btn(BK, WH, { padding: '5px 10px', fontSize: '11px' }) }}><Plus size={10}/> הוסף צבע</button>
                      </div>
                    )}
                  </div>

                  {/* התקנה */}
                  <div style={{ marginBottom: '10px', border: `1px solid ${BR}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: WH, cursor: 'pointer' }}>
                      <input type="checkbox" checked={(productForm.product_options || []).some(o => o.name === 'התקנה')}
                        onChange={e => {
                          const opts = (productForm.product_options || []).filter(o => o.name !== 'התקנה');
                          if (e.target.checked) opts.push({ name: 'התקנה', required: true, values: [
                            { label: 'ללא התקנה', price_delta: 0 },
                            { label: 'עם התקנה', price_delta: 50 }
                          ]});
                          setProductForm({...productForm, product_options: opts});
                        }}
                        style={{ width: 'auto', accentColor: G }} />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>🔧 התקנה</span>
                    </label>
                    {(productForm.product_options || []).some(o => o.name === 'התקנה') && (
                      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BR}`, background: BG }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '600' }}>מחיר התקנה (₪):</label>
                          <input type="number" min="0"
                            value={(productForm.product_options || []).find(o => o.name === 'התקנה')?.values?.find(v => v.label === 'עם התקנה')?.price_delta || ''}
                            onChange={e => {
                              const opts = [...productForm.product_options];
                              const optIdx = opts.findIndex(o => o.name === 'התקנה');
                              const price = parseFloat(e.target.value) || 0;
                              opts[optIdx].values = [
                                { label: 'ללא התקנה', price_delta: 0 },
                                { label: 'עם התקנה', price_delta: price }
                              ];
                              setProductForm({...productForm, product_options: opts});
                            }}
                            placeholder="למשל: 50"
                            style={{ ...inp, width: '100px', padding: '7px 10px', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    )}

                  {/* כיוון */}
                  <div style={{ border: `1px solid ${BR}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: WH, cursor: 'pointer' }}>
                      <input type="checkbox" checked={(productForm.product_options || []).some(o => o.name === 'כיוון')}
                        onChange={e => {
                          const opts = (productForm.product_options || []).filter(o => o.name !== 'כיוון');
                          if (e.target.checked) opts.push({ name: 'כיוון', required: true, values: [
                            { label: 'לאורך', price_delta: 0 },
                            { label: 'לרוחב', price_delta: 0 }
                          ]});
                          setProductForm({...productForm, product_options: opts});
                        }}
                        style={{ width: 'auto', accentColor: G }} />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>↕️ כיוון (לאורך / לרוחב)</span>
                    </label>
                    {(productForm.product_options || []).some(o => o.name === 'כיוון') && (
                      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BR}`, background: BG }}>
                        {((productForm.product_options || []).find(o => o.name === 'כיוון')?.values || []).map((val, valIdx) => {
                          const optIdx = (productForm.product_options || []).findIndex(o => o.name === 'כיוון');
                          return (
                            <div key={valIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                              <input value={val.label} onChange={e => {
                                const opts = [...productForm.product_options];
                                opts[optIdx].values[valIdx] = { ...opts[optIdx].values[valIdx], label: e.target.value };
                                setProductForm({...productForm, product_options: opts});
                              }} placeholder='לאורך / לרוחב' style={{ ...inp, flex: 2, padding: '7px 10px', fontSize: '13px' }} />
                              <input type="number" min="0" value={val.price_delta || ''} onChange={e => {
                                const opts = [...productForm.product_options];
                                opts[optIdx].values[valIdx] = { ...opts[optIdx].values[valIdx], price_delta: parseFloat(e.target.value) || 0 };
                                setProductForm({...productForm, product_options: opts});
                              }} placeholder="תוספת ₪" style={{ ...inp, width: '90px', padding: '7px 10px', fontSize: '13px' }} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>  
                </div>


                {/* מוצרים משלימים */}
                <div style={{ background: BG, padding: '14px', borderRadius: '8px', border: `1px solid ${BR}` }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: BK, marginBottom: '10px' }}>🔗 מוצרים משלימים (המלצה)</div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px' }}>בחר מוצרים שיוצגו כהמלצה בדף המוצר הנוכחי</div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'grid', gap: '4px' }}>
                    {products.filter(p => !editingProduct || p.id !== editingProduct.id).map(p => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: (productForm.complementary_ids || []).includes(p.id) ? BK : WH, borderRadius: '6px', cursor: 'pointer', border: `1px solid ${(productForm.complementary_ids || []).includes(p.id) ? BK : BR}` }}>
                        <input type="checkbox" checked={(productForm.complementary_ids || []).includes(p.id)} onChange={() => toggleComplementary(p.id)} style={{ width: 'auto', accentColor: G }} />
                        {p.primary_image && <img src={p.primary_image} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <span style={{ fontSize: '12px', fontWeight: '500', color: (productForm.complementary_ids || []).includes(p.id) ? WH : BK }}>{p.name}</span>
                        <span style={{ fontSize: '11px', color: '#aaa', marginRight: 'auto' }}>₪{p.price}</span>
                      </label>
                    ))}
                  </div>
                  {(productForm.complementary_ids || []).length > 0 && (
                    <div style={{ fontSize: '11px', color: G, marginTop: '6px', fontWeight: '600' }}>✓ {(productForm.complementary_ids || []).length} מוצרים נבחרו</div>
                  )}
                </div>

                {!editingProduct && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>תמונה ראשית</label>
                    <input type="file" accept="image/*" onChange={e => setNewImageFile(e.target.files[0])} style={inp} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={uploading} style={{ flex: 1, ...btn(G, BK, { padding: '12px', justifyContent: 'center', opacity: uploading ? 0.5 : 1 }) }}>
                    {uploading ? 'שומר...' : (editingProduct ? 'שמור שינויים' : 'הוסף מוצר')}
                  </button>
                  <button type="button" onClick={closeProductModal} style={{ ...btn(BG, BK, { padding: '12px 16px', border: `1px solid ${BR}` }) }}>ביטול</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Images Modal */}
      {showImagesModal && (
        <div className="modal-overlay" onClick={() => setShowImagesModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>תמונות — {showImagesModal.name}</div>
              <button onClick={() => setShowImagesModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={18}/></button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input type="file" accept="image/*" onChange={e => setNewImageFile(e.target.files[0])} style={{ ...inp, flex: 1 }} />
              <button onClick={addImage} disabled={!newImageFile || uploading} style={{ ...btn(G, BK, { opacity: (!newImageFile || uploading) ? 0.5 : 1, whiteSpace: 'nowrap', fontSize: '13px' }) }}>
                {uploading ? '...' : '+ הוסף'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: '8px' }}>
              {productImages.map(img => (
                <div key={img.id} style={{ position: 'relative', border: img.is_primary ? `3px solid ${G}` : `1px solid ${BR}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                  <button onClick={() => deleteImage(img.id, img.image_url)} style={{ position: 'absolute', top: '3px', left: '3px', background: 'rgba(255,255,255,0.9)', border: 'none', padding: '3px', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={12}/></button>
                  {img.is_primary
                    ? <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: G, color: BK, padding: '3px', fontSize: '9px', textAlign: 'center', fontWeight: '700' }}>ראשית</div>
                    : <button onClick={() => setPrimary(img.id)} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.92)', border: 'none', padding: '3px', fontSize: '9px', cursor: 'pointer', fontWeight: '600' }}>הגדר ראשית</button>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Colors Modal */}
      {showColorsModal && (
        <div className="modal-overlay" onClick={() => setShowColorsModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>צבעים — {showColorsModal.name}</div>
              <button onClick={() => setShowColorsModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={18}/></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '12px' }}>
              <input value={newColor.name} onChange={e => setNewColor({...newColor, name: e.target.value})} placeholder="שם צבע" style={inp} />
              <input type="number" min="0" step="0.01" value={newColor.price_delta || ''} onChange={e => setNewColor({...newColor, price_delta: parseFloat(e.target.value) || 0})} placeholder="תוספת מחיר ₪" style={inp} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={newColor.code || '#C9A84C'} onChange={e => setNewColor({...newColor, code: e.target.value})}
                  style={{ width: '44px', height: '44px', border: `1.5px solid ${BR}`, borderRadius: '8px', cursor: 'pointer', padding: '2px' }} />
                <span style={{ fontSize: '12px', color: '#aaa' }}>{newColor.code || '#C9A84C'}</span>
              </div>
              <button onClick={addColor} style={btn(G, BK, { fontSize: '13px' })}>+ הוסף</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {productColors.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: BG, borderRadius: '8px', border: `1px solid ${BR}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: c.color_code, border: `1px solid ${BR}` }}></div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{c.color_name}</div>
                      <div style={{ fontSize: '11px', color: '#aaa' }}>{c.color_code}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteColor(c.id)} style={{ ...btn(WH, '#dc2626', { padding: '5px 7px', border: '1px solid #fca5a5' }) }}><Trash2 size={13}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => { setShowReviewModal(false); setEditingReview(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>{editingReview ? 'עריכת המלצה' : 'המלצה חדשה'}</div>
              <button onClick={() => { setShowReviewModal(false); setEditingReview(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={18}/></button>
            </div>
            <form onSubmit={saveReview}>
              <div style={{ display: 'grid', gap: '13px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: '600' }}>דירוג</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm({...reviewForm, stars: s})} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: s <= reviewForm.stars ? G : '#ddd', padding: '0 1px' }}>★</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>טקסט *</label>
                  <textarea value={reviewForm.text} onChange={e => setReviewForm({...reviewForm, text: e.target.value})} rows="4" style={{ ...inp, resize: 'vertical' }} required></textarea>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, ...btn(G, BK, { padding: '11px', justifyContent: 'center' }) }}>
                    {editingReview ? 'שמור' : 'הוסף'}
                  </button>
                  <button type="button" onClick={() => { setShowReviewModal(false); setEditingReview(null); }} style={{ ...btn(BG, BK, { padding: '11px 14px', border: `1px solid ${BR}` }) }}>ביטול</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="modal-overlay" onClick={() => { setShowCouponModal(false); setEditingCoupon(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>{editingCoupon ? 'עריכת קופון' : 'קופון חדש'}</div>
              <button onClick={() => { setShowCouponModal(false); setEditingCoupon(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={18}/></button>
            </div>
            <form onSubmit={saveCoupon}>
              <div style={{ display: 'grid', gap: '13px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>קוד קופון *</label>
                  <input value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} style={{ ...inp, letterSpacing: '2px', fontWeight: '700' }} placeholder="SUMMER20" required />
                  <div style={{ fontSize: '11px', color: '#bbb', marginTop: '3px' }}>הקוד יהפוך לאותיות גדולות אוטומטית</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: '600' }}>סוג הנחה</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[['percentage', 'אחוזים (%)'], ['fixed', 'סכום קבוע (₪)']].map(([v, l]) => (
                      <label key={v} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', background: couponForm.discount_type === v ? BK : BG, borderRadius: '8px', cursor: 'pointer', border: `1px solid ${couponForm.discount_type === v ? BK : BR}` }}>
                        <input type="radio" name="dtype" value={v} checked={couponForm.discount_type === v} onChange={e => setCouponForm({...couponForm, discount_type: e.target.value})} style={{ width: 'auto', accentColor: G }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: couponForm.discount_type === v ? WH : BK }}>{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                      {couponForm.discount_type === 'percentage' ? 'אחוז הנחה *' : 'סכום (₪) *'}
                    </label>
                    <input type="number" min="1" value={couponForm.discount_value} onChange={e => setCouponForm({...couponForm, discount_value: e.target.value})} style={inp} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>מינימום הזמנה (₪)</label>
                    <input type="number" value={couponForm.min_order} onChange={e => setCouponForm({...couponForm, min_order: e.target.value})} style={inp} placeholder="0" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>תוקף עד (אופציונלי)</label>
                  <input type="date" value={couponForm.expires_at} onChange={e => setCouponForm({...couponForm, expires_at: e.target.value})} style={inp} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={couponForm.is_active} onChange={e => setCouponForm({...couponForm, is_active: e.target.checked})} style={{ width: 'auto', accentColor: G }} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>קופון פעיל</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, ...btn(G, BK, { padding: '11px', justifyContent: 'center' }) }}>
                    {editingCoupon ? 'שמור שינויים' : 'הוסף קופון'}
                  </button>
                  <button type="button" onClick={() => { setShowCouponModal(false); setEditingCoupon(null); }} style={{ ...btn(BG, BK, { padding: '11px 14px', border: `1px solid ${BR}` }) }}>ביטול</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;