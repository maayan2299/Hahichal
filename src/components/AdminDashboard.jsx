import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Edit3, Save, X, Upload, Image as ImageIcon, Tag, LogOut, Eye, EyeOff, Search } from 'lucide-react';

// Supabase Configuration - ההיכל
const supabaseUrl = 'https://taewbxptprdixsusvjfh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZXdieHB0cHJkaXhzdXN2amZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNDk0MjIsImV4cCI6MjA4NjgyNTQyMn0.TVgjzOt3UQW8FQVFk0Ze5Se2qOwS-WpqTSDHJlkIrFc';
const supabase = createClient(supabaseUrl, supabaseKey);

// פרטי התחברות לדשבורד
const ADMIN_USERNAME = 'heichal';
const ADMIN_PASSWORD = 'heichal2026';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('heichal_admin_auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('heichal_admin_auth', 'authenticated');
      setLoginError('');
    } else {
      setLoginError('שם משתמש או סיסמה שגויים');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('heichal_admin_auth');
    setLoginForm({ username: '', password: '' });
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEFDFB', fontFamily: '"Frank Ruhl Libre", "Heebo", sans-serif', direction: 'rtl', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#fff', border: '2px solid #D4AF37', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(212,175,55,0.15)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', textAlign: 'center', color: '#2D2420' }}>ההיכל</h1>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '32px' }}>ניהול מוצרים</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} style={{ width: '100%', padding: '14px', border: '1px solid #ddd', fontSize: '15px', borderRadius: '4px' }} placeholder="שם משתמש" />
            </div>
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} style={{ width: '100%', padding: '14px', paddingLeft: '45px', border: '1px solid #ddd', fontSize: '15px', borderRadius: '4px' }} placeholder="סיסמה" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {loginError && <div style={{ padding: '12px', background: '#ffe6e6', color: '#cc0000', marginBottom: '20px', fontSize: '14px', textAlign: 'center', borderRadius: '4px' }}>{loginError}</div>}
            <button type="submit" style={{ width: '100%', padding: '14px', background: '#D4AF37', color: '#fff', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#B8941F'} onMouseOut={(e) => e.currentTarget.style.background = '#D4AF37'}>כניסה</button>
          </form>
        </div>
      </div>
    );
  }

  return <MainDashboard onLogout={handleLogout} />;
};

const MainDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal states
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(null);
  const [showColorsModal, setShowColorsModal] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', display_order: 0 });
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    stock_quantity: 0,
    engraving_available: false,
    is_featured: false,
    on_sale: false,
    sale_type: 'percentage',
    sale_percentage: '',
    sale_price: ''
  });
  
  // Image/Color states
  const [productImages, setProductImages] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newColor, setNewColor] = useState({ name: '', code: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select(`*, categories(name), product_images(image_url, is_primary)`).eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order')
      ]);
      
      if (productsRes.data) {
        setProducts(productsRes.data.map(p => ({
          ...p,
          category_name: p.categories?.name || '',
          primary_image: p.product_images?.find(i => i.is_primary)?.image_url || p.product_images?.[0]?.image_url,
          images_count: p.product_images?.length || 0
        })));
      }
      
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const uploadImage = async (file, bucket = 'product-images') => {
    if (!file) return null;
    try {
      setUploading(true);
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      setUploading(false);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      return null;
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert('אנא הזן שם קטגוריה');
      return;
    }

    try {
      let imageUrl = editingCategory?.image_url || null;
      
      if (categoryImageFile) {
        imageUrl = await uploadImage(categoryImageFile, 'product-images');
      }

      if (editingCategory) {
        await supabase.from('categories').update({
          name: categoryForm.name.trim(),
          image_url: imageUrl
        }).eq('id', editingCategory.id);
        alert('הקטגוריה עודכנה!');
      } else {
        const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order || 0)) : 0;
        await supabase.from('categories').insert([{
          name: categoryForm.name.trim(),
          display_order: maxOrder + 1,
          image_url: imageUrl
        }]);
        alert('הקטגוריה נוספה!');
      }

      setCategoryForm({ name: '', display_order: 0 });
      setCategoryImageFile(null);
      setShowCategoryModal(false);
      setEditingCategory(null);
      await loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה בשמירת קטגוריה');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('למחוק את הקטגוריה? כל המוצרים בקטגוריה זו יאבדו את הקטגוריה שלהם.')) return;
    
    try {
      await supabase.from('categories').delete().eq('id', categoryId);
      alert('הקטגוריה נמחקה!');
      await loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה במחיקה');
    }
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      display_order: category.display_order || 0
    });
    setCategoryImageFile(null);
    setShowCategoryModal(true);
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', display_order: 0 });
    setCategoryImageFile(null);
    setShowCategoryModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('אנא מלא שם ומחיר');
      return;
    }

    try {
      let finalSalePrice = null;
      if (formData.on_sale) {
        if (formData.sale_type === 'percentage' && formData.sale_percentage) {
          const discount = (parseFloat(formData.price) * parseFloat(formData.sale_percentage)) / 100;
          finalSalePrice = parseFloat(formData.price) - discount;
        } else if (formData.sale_type === 'fixed' && formData.sale_price) {
          finalSalePrice = parseFloat(formData.sale_price);
        }
      }

      if (editingProduct) {
        await supabase.from('products').update({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          category_id: formData.category_id || null,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          engraving_available: formData.engraving_available,
          is_featured: formData.is_featured,
          sale_price: finalSalePrice
        }).eq('id', editingProduct.id);
        
        alert('המוצר עודכן!');
      } else {
        const { data: newProduct, error } = await supabase.from('products').insert([{
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          category_id: formData.category_id || null,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          engraving_available: formData.engraving_available,
          is_featured: formData.is_featured,
          sale_price: finalSalePrice,
          is_active: true
        }]).select().single();

        if (error) throw error;

        if (newImageFile) {
          const imageUrl = await uploadImage(newImageFile);
          if (imageUrl) {
            await supabase.from('product_images').insert([{
              product_id: newProduct.id,
              image_url: imageUrl,
              is_primary: true,
              display_order: 0
            }]);
          }
        }
        
        alert('המוצר נוסף!');
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה: ' + error.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('למחוק את המוצר?')) return;
    
    try {
      const { data: images } = await supabase.from('product_images').select('image_url').eq('product_id', productId);
      if (images) {
        for (const img of images) {
          const fileName = img.image_url.split('/').pop();
          await supabase.storage.from('product-images').remove([fileName]);
        }
      }
      
      await supabase.from('product_images').delete().eq('product_id', productId);
      await supabase.from('products').delete().eq('id', productId);
      
      await loadData();
      alert('המוצר נמחק!');
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה במחיקה');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category_id: product.category_id || '',
      stock_quantity: product.stock_quantity || 0,
      engraving_available: product.engraving_available || false,
      is_featured: product.is_featured || false,
      sale_price: product.sale_price || ''
    });
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      category_id: '',
      stock_quantity: 0,
      engraving_available: false,
      is_featured: false,
      sale_price: ''
    });
    setNewImageFile(null);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setShowAddModal(false);
    setNewImageFile(null);
  };

  const openImagesModal = async (product) => {
    setShowImagesModal(product);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('display_order');
    setProductImages(data || []);
  };

  const addImage = async () => {
    if (!newImageFile || !showImagesModal) return;
    
    const imageUrl = await uploadImage(newImageFile);
    if (!imageUrl) return;

    await supabase.from('product_images').insert([{
      product_id: showImagesModal.id,
      image_url: imageUrl,
      is_primary: productImages.length === 0,
      display_order: productImages.length
    }]);

    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []);
    setNewImageFile(null);
    await loadData();
  };

  const deleteImage = async (imageId, imageUrl) => {
    if (!confirm('למחוק תמונה?')) return;
    
    const fileName = imageUrl.split('/').pop();
    await supabase.storage.from('product-images').remove([fileName]);
    await supabase.from('product_images').delete().eq('id', imageId);
    
    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []);
    await loadData();
  };

  const setPrimary = async (imageId) => {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', showImagesModal.id);
    await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId);
    
    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []);
    await loadData();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEFDFB' }}>
        <div style={{ fontSize: '18px', color: '#D4AF37', fontWeight: '600' }}>טוען...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FEFDFB', fontFamily: '"Frank Ruhl Libre", "Heebo", sans-serif', direction: 'rtl' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;600;700&family=Heebo:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input, select, textarea { border: 1px solid #ddd; padding: 12px; font-family: 'Heebo', sans-serif; font-size: 15px; width: 100%; borderRadius: 4px; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #D4AF37; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal { background: #fff; border-radius: 8px; padding: 30px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }
        @media (max-width: 768px) { .modal { padding: 20px; } }
      `}</style>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '2px solid #D4AF37', padding: '20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2D2420', marginBottom: '4px' }}>ההיכל</h1>
            <p style={{ fontSize: '14px', color: '#666' }}>ניהול מוצרים ותשמישי קדושה</p>
          </div>
          <button onClick={onLogout} style={{ background: '#D4AF37', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#B8941F'} onMouseOut={(e) => e.currentTarget.style.background = '#D4AF37'}>
            <LogOut size={16} /> יציאה
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0' }}>
          {['overview', 'products', 'categories'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #D4AF37' : '3px solid transparent',
                color: activeTab === tab ? '#D4AF37' : '#666',
                fontWeight: activeTab === tab ? '600' : '400',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'overview' && 'סקירה כללית'}
              {tab === 'products' && 'מוצרים'}
              {tab === 'categories' && 'קטגוריות'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(212,175,55,0.1)', border: '1px solid #D4AF37' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>סה"כ מוצרים</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#D4AF37' }}>{products.length}</div>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>קטגוריות</div>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>{categories.length}</div>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>מוצרים מומלצים</div>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>{products.filter(p => p.is_featured).length}</div>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>מוצרים במבצע</div>
                <div style={{ fontSize: '32px', fontWeight: '700' }}>{products.filter(p => p.sale_price).length}</div>
              </div>
            </div>

            {/* Categories Overview */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>קטגוריות</h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {categories.map(cat => {
                  const count = products.filter(p => p.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id.toString());
                        setActiveTab('products');
                      }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '4px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'right' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#FFF8E7'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f9f9f9'}
                    >
                      <span style={{ fontSize: '15px', fontWeight: '500' }}>{cat.name}</span>
                      <span style={{ fontSize: '14px', color: '#666' }}>{count} מוצרים</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Toolbar */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <button onClick={openAddModal} style={{ background: '#D4AF37', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#B8941F'} onMouseOut={(e) => e.currentTarget.style.background = '#D4AF37'}>
                <Plus size={20} /> הוסף מוצר חדש
              </button>
              
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="חיפוש מוצר..." style={{ paddingRight: '40px', borderRadius: '4px' }} />
              </div>

              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ minWidth: '180px', borderRadius: '4px' }}>
                <option value="">כל הקטגוריות</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredProducts.map(product => (
                <div key={product.id} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s', cursor: 'pointer', position: 'relative' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  
                  {product.is_featured && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: '#D4AF37', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(212,175,55,0.4)' }}>
                      ⭐
                    </div>
                  )}

                  <div style={{ width: '100%', height: '250px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.primary_image ? (
                      <img src={product.primary_image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={60} color="#ccc" />
                    )}
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#2D2420' }}>{product.name}</h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>{product.category_name || 'ללא קטגוריה'}</p>
                    
                    {product.sale_price && (
                      <div style={{ display: 'inline-block', background: '#D4AF37', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                        🏷️ מבצע!
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        {product.sale_price ? (
                          <div>
                            <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through', marginLeft: '8px' }}>₪{product.price}</span>
                            <span style={{ fontSize: '22px', fontWeight: '700', color: '#D4AF37' }}>₪{product.sale_price}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '20px', fontWeight: '700', color: '#2D2420' }}>₪{product.price}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '14px', color: '#666' }}>מלאי: {product.stock_quantity || 0}</span>
                    </div>

                    {product.engraving_available && (
                      <div style={{ fontSize: '13px', color: '#4CAF50', marginBottom: '12px' }}>✓ חריטה אישית</div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <button onClick={() => openImagesModal(product)} style={{ flex: 1, padding: '8px', background: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                        📷 {product.images_count} תמונות
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(product)} style={{ flex: 1, padding: '10px', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#B8941F'} onMouseOut={(e) => e.currentTarget.style.background = '#D4AF37'}>
                        ערוך
                      </button>
                      <button onClick={() => handleDelete(product.id)} style={{ padding: '10px 16px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <p style={{ fontSize: '18px' }}>לא נמצאו מוצרים</p>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ניהול קטגוריות</h2>
                <button 
                  onClick={openAddCategoryModal}
                  style={{ background: '#D4AF37', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#B8941F'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#D4AF37'}
                >
                  + הוסף קטגוריה
                </button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {categories.map(cat => {
                  const count = products.filter(p => p.category_id === cat.id).length;
                  return (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {cat.image_url && (
                          <img src={cat.image_url} alt={cat.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{cat.name}</div>
                          <div style={{ fontSize: '13px', color: '#666' }}>{count} מוצרים</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => openEditCategoryModal(cat)} 
                          style={{ padding: '8px 16px', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                        >
                          ערוך
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)} 
                          style={{ padding: '8px', background: '#fff', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{editingCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה חדשה'}</h2>
              <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>שם הקטגוריה *</label>
                  <input 
                    type="text" 
                    value={categoryForm.name} 
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})} 
                    placeholder="לדוגמה: מזוזות" 
                    required 
                    style={{ borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>תמונה ראשית</label>
                  {editingCategory?.image_url && !categoryImageFile && (
                    <div style={{ marginBottom: '12px' }}>
                      <img src={editingCategory.image_url} alt="Current" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setCategoryImageFile(e.target.files[0])} 
                    style={{ padding: '8px' }} 
                  />
                  {!editingCategory && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>התמונה תופיע בעמוד הבית בסקשן "הקטגוריות שלנו"</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" disabled={uploading} style={{ flex: 1, padding: '14px', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', opacity: uploading ? 0.5 : 1 }}>
                    {uploading ? 'שומר...' : (editingCategory ? 'שמור שינויים' : 'הוסף קטגוריה')}
                  </button>
                  <button type="button" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} style={{ padding: '14px 24px', background: '#fff', color: '#2D2420', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                    ביטול
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal - ממשיך בהודעה הבאה עקב אורך */}
      {(showAddModal || editingProduct) && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{editingProduct ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>שם המוצר *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="לדוגמה: מזוזה אלומיניום שחור" required style={{ borderRadius: '4px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>מחיר (₪) *</label>
                    <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required style={{ borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>כמות במלאי</label>
                    <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} style={{ borderRadius: '4px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>קטגוריה</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} style={{ borderRadius: '4px' }}>
                    <option value="">בחר קטגוריה</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>תיאור</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="4" placeholder="תיאור מפורט של המוצר..." style={{ borderRadius: '4px' }}></textarea>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.engraving_available} onChange={(e) => setFormData({...formData, engraving_available: e.target.checked})} style={{ width: 'auto' }} />
                    <span style={{ fontSize: '15px' }}>מאפשר חריטה אישית</span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} style={{ width: 'auto' }} />
                    <span style={{ fontSize: '15px' }}>⭐ מומלץ שלנו (יופיע בעמוד הבית)</span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>מחיר מבצע (₪)</label>
                  <input type="number" step="0.01" value={formData.sale_price} onChange={(e) => setFormData({...formData, sale_price: e.target.value})} placeholder="אם יש הנחה - הכנס מחיר אחרי הנחה" style={{ borderRadius: '4px' }} />
                </div>

                {!editingProduct && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>תמונה ראשית</label>
                    <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0])} style={{ padding: '8px' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" disabled={uploading} style={{ flex: 1, padding: '14px', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', opacity: uploading ? 0.5 : 1 }}>
                    {uploading ? 'שומר...' : (editingProduct ? 'שמור שינויים' : 'הוסף מוצר')}
                  </button>
                  <button type="button" onClick={closeModal} style={{ padding: '14px 24px', background: '#fff', color: '#2D2420', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                    ביטול
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Images Modal */}
      {showImagesModal && (
        <div className="modal-overlay" onClick={() => setShowImagesModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ניהול תמונות - {showImagesModal.name}</h2>
              <button onClick={() => setShowImagesModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0])} style={{ marginBottom: '10px', borderRadius: '4px' }} />
              <button onClick={addImage} disabled={!newImageFile || uploading} style={{ width: '100%', padding: '12px', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (!newImageFile || uploading) ? 0.5 : 1 }}>
                {uploading ? 'מעלה...' : 'הוסף תמונה'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {productImages.map(img => (
                <div key={img.id} style={{ position: 'relative', border: img.is_primary ? '3px solid #D4AF37' : '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '4px', left: '4px' }}>
                    <button onClick={() => deleteImage(img.id, img.image_url)} style={{ background: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {img.is_primary ? (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#D4AF37', color: '#fff', padding: '4px', fontSize: '11px', textAlign: 'center', fontWeight: '600' }}>ראשית</div>
                  ) : (
                    <button onClick={() => setPrimary(img.id)} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', border: 'none', padding: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>הגדר ראשית</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;