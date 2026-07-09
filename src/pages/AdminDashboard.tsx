import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Product, Category, BusinessConfig, Order } from '../types';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Copy,
  DollarSign,
  Package,
  Eye,
  TrendingUp,
  Image as ImageIcon,
  Edit2,
  Save,
  Bell,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    logout,
    products,
    categories,
    orders,
    config,
    stats,
    saveProduct,
    deleteProduct,
    duplicateProduct,
    saveCategory,
    deleteCategory,
    saveConfig,
    updateOrderStatus,
    resetDatabase,
    lowStockAlerts
  } = useAdmin();

  // Abas do Painel
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'settings'>('dashboard');

  // Controle de Modais
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estados dos formulários de Produto
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<number | null>(null);
  const [prodPromoPrice, setProdPromoPrice] = useState<number | null>(null);
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState(10);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodBestSeller, setProdBestSeller] = useState(false);
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Estados dos formulários de Categoria
  const [newCatName, setNewCatName] = useState('');

  // Busca interna de produtos
  const [prodSearchQuery, setProdSearchQuery] = useState('');

  // Estados da configuração visual (White-Label)
  const [configName, setConfigName] = useState(config.name);
  const [configPhone, setConfigPhone] = useState(config.phone);
  const [configAddress, setConfigAddress] = useState(config.address);
  const [configDeliveryFee, setConfigDeliveryFee] = useState(config.deliveryFee);
  const [configWorkingHours, setConfigWorkingHours] = useState(config.workingHours);
  const [configPrimaryColor, setConfigPrimaryColor] = useState(config.primaryColor);
  const [configSecondaryColor, setConfigSecondaryColor] = useState(config.secondaryColor);
  const [configThemePreset, setConfigThemePreset] = useState(config.themePreset);
  const [configBorderRadius, setConfigBorderRadius] = useState(config.borderRadius);

  // --- MOCK THEMES PRESETS ---
  const THEME_PRESETS = [
    { id: 'forest-green', name: 'Verde Floresta (Clássico)', primary: '#1e3a1e', secondary: '#f7a8b8' },
    { id: 'elegant-rose', name: 'Rosê Romântico', primary: '#b53f60', secondary: '#f9e5e9' },
    { id: 'modern-lavender', name: 'Moderno Lavanda', primary: '#6a5acd', secondary: '#f3effa' },
    { id: 'tropical-orchid', name: 'Orquídea Tropical', primary: '#c71585', secondary: '#ffe4e1' },
  ];

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setConfigThemePreset(presetId);
      setConfigPrimaryColor(preset.primary);
      setConfigSecondaryColor(preset.secondary);
    }
  };

  // --- PRODUCT CRUD ACTIONS ---
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(null);
    setProdPromoPrice(null);
    setProdCategory(categories[0]?.id || '');
    setProdStock(10);
    setProdFeatured(false);
    setProdBestSeller(false);
    setProdImages([]);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description);
    setProdPrice(product.price);
    setProdPromoPrice(product.promoPrice);
    setProdCategory(product.categoryId);
    setProdStock(product.stock);
    setProdFeatured(product.featured);
    setProdBestSeller(product.bestSeller);
    setProdImages(product.images);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Math.floor(1000 + Math.random() * 9000)}`,
      name: prodName,
      description: prodDesc,
      price: prodPrice === null || prodPrice <= 0 ? null : prodPrice,
      promoPrice: prodPromoPrice === null || prodPromoPrice <= 0 ? null : prodPromoPrice,
      categoryId: prodCategory,
      stock: prodStock,
      featured: prodFeatured,
      bestSeller: prodBestSeller,
      active: editingProduct ? editingProduct.active : true,
      images: prodImages.length > 0 ? prodImages : ['https://via.placeholder.com/400x400?text=Sem+Foto'],
      views: editingProduct ? editingProduct.views : 0,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    saveProduct(productData);
    setIsProductModalOpen(false);
  };

  // Drag and drop handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    setProdImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // --- CATEGORY CRUD ACTIONS ---
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `cat-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      active: true
    };

    saveCategory(newCat);
    setNewCatName('');
  };

  // --- CONFIG ACTIONS ---
  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: BusinessConfig = {
      ...config,
      name: configName,
      phone: configPhone,
      address: configAddress,
      deliveryFee: Number(configDeliveryFee),
      workingHours: configWorkingHours,
      primaryColor: configPrimaryColor,
      secondaryColor: configSecondaryColor,
      themePreset: configThemePreset,
      borderRadius: configBorderRadius
    };
    saveConfig(updatedConfig);
  };

  // --- INLINE EDIT HELPERS ---
  const updateProductPriceInline = (id: string, val: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const num = val === '' ? null : Number(val);
    saveProduct({ ...prod, price: num });
  };

  const updateProductStockInline = (id: string, val: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    saveProduct({ ...prod, stock: Math.max(0, val) });
  };

  const toggleProductActive = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    saveProduct({ ...prod, active: !prod.active });
  };

  const toggleProductFeatured = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    saveProduct({ ...prod, featured: !prod.featured });
  };

  // --- FILTRO DE PRODUTOS NO ADMIN ---
  const getFilteredProductsAdmin = () => {
    if (!prodSearchQuery.trim()) return products;
    const q = prodSearchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  };

  const filteredProducts = getFilteredProductsAdmin();

  return (
    <div style={{
      backgroundColor: 'var(--color-admin-bg)',
      color: 'var(--color-admin-text)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '40px'
    }}>
      {/* Menu / Navegação do Administrador */}
      <div style={{ borderBottom: '1px solid var(--color-admin-border)', backgroundColor: 'var(--color-admin-card)', padding: '12px 0' }}>
        <div className="container flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-theme)',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: activeTab === 'dashboard' ? 'var(--color-primary)' : 'transparent',
                color: '#ffffff'
              }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-theme)',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: activeTab === 'products' ? 'var(--color-primary)' : 'transparent',
                color: '#ffffff'
              }}
            >
              <ShoppingBag size={18} /> Produtos
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-theme)',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: activeTab === 'categories' ? 'var(--color-primary)' : 'transparent',
                color: '#ffffff'
              }}
            >
              <FolderOpen size={18} /> Categorias
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-theme)',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: activeTab === 'settings' ? 'var(--color-primary)' : 'transparent',
                color: '#ffffff'
              }}
            >
              <Settings size={18} /> Customização / Loja
            </button>
          </div>

          <button
            onClick={logout}
            className="btn btn-sm btn-outline"
            style={{
              color: 'var(--color-accent)',
              borderColor: 'rgba(230, 97, 112, 0.2)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>

      {/* Área de Notificações / Alertas de Estoque Baixo */}
      {lowStockAlerts.length > 0 && activeTab === 'dashboard' && (
        <div className="container mt-6">
          <div style={{
            backgroundColor: 'rgba(255, 183, 3, 0.1)',
            border: '1px solid rgba(255, 183, 3, 0.3)',
            borderRadius: 'var(--border-radius-theme)',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }} className="animate-fade">
            <Bell size={20} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-warning)' }}>Alertas de Estoque Baixo</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-admin-text-muted)', marginTop: '4px' }}>
                Os seguintes itens precisam ser reabastecidos:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {lowStockAlerts.map(p => (
                  <span key={p.id} className="badge badge-warning" style={{ fontSize: '11px' }}>
                    {p.name} ({p.stock} un)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORPO DE ABAS */}
      <div className="container mt-6 flex-1">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Grid de Estatísticas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {/* Card Faturamento */}
              <div style={{
                backgroundColor: 'var(--color-admin-card)',
                border: '1px solid var(--color-admin-border)',
                borderRadius: 'var(--border-radius-theme)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  backgroundColor: 'rgba(46, 196, 182, 0.1)',
                  color: 'var(--color-success)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase' }}>Faturamento (Mês)</span>
                  <h4 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>R$ {stats.monthlyRevenue.toFixed(2)}</h4>
                </div>
              </div>

              {/* Card Produtos */}
              <div style={{
                backgroundColor: 'var(--color-admin-card)',
                border: '1px solid var(--color-admin-border)',
                borderRadius: 'var(--border-radius-theme)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  backgroundColor: 'rgba(30, 58, 30, 0.2)',
                  color: 'var(--color-success)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase' }}>Total Produtos</span>
                  <h4 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{stats.totalProducts}</h4>
                </div>
              </div>

              {/* Card Visualizações */}
              <div style={{
                backgroundColor: 'var(--color-admin-card)',
                border: '1px solid var(--color-admin-border)',
                borderRadius: 'var(--border-radius-theme)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  backgroundColor: 'rgba(90, 62, 135, 0.2)',
                  color: '#9f7aea',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Eye size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase' }}>Visitas Catálogo</span>
                  <h4 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{stats.catalogViews}</h4>
                </div>
              </div>

              {/* Card Sem Estoque */}
              <div style={{
                backgroundColor: 'var(--color-admin-card)',
                border: '1px solid var(--color-admin-border)',
                borderRadius: 'var(--border-radius-theme)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  backgroundColor: 'rgba(230, 57, 70, 0.1)',
                  color: 'var(--color-danger)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp size={24} style={{ transform: 'rotate(90deg)' }} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase' }}>Sem Estoque</span>
                  <h4 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{stats.outOfStockProducts}</h4>
                </div>
              </div>
            </div>

            {/* Atalhos Rápidos */}
            <div style={{
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              borderRadius: 'var(--border-radius-theme)',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>Atalhos Rápidos</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-primary" onClick={() => { openNewProductModal(); setActiveTab('products'); }}>
                  <Plus size={16} /> Cadastrar Produto
                </button>
                <button className="btn btn-sm btn-outline" style={{ color: 'var(--color-admin-text)' }} onClick={() => setActiveTab('categories')}>
                  Nova Categoria
                </button>
                <button className="btn btn-sm btn-outline" style={{ color: 'var(--color-admin-text)' }} onClick={() => setActiveTab('settings')}>
                  Alterar Tema
                </button>
              </div>
            </div>

            {/* Listas Inferiores (Pedidos Recentes & Visualizações) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px'
            }}>
              {/* Pedidos Recentes */}
              <div style={{
                backgroundColor: 'var(--color-admin-card)',
                border: '1px solid var(--color-admin-border)',
                borderRadius: 'var(--border-radius-theme)',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>Pedidos Recentes</h3>
                
                {orders.length === 0 ? (
                  <p style={{ color: 'var(--color-admin-text-muted)', fontSize: '13px' }}>Nenhum pedido recebido ainda.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map(order => (
                      <div key={order.id} style={{
                        padding: '12px',
                        border: '1px solid var(--color-admin-border)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'between',
                        gap: '16px'
                      }} className="justify-between">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>#{order.id}</span>
                            <span style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)' }}>{order.customerName}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', marginTop: '2px' }}>
                            {order.items.length} itens • R$ {order.total.toFixed(2)}
                          </div>
                        </div>

                        {/* Dropdown status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            style={{
                              backgroundColor: 'var(--color-admin-input)',
                              color: 'var(--color-admin-text)',
                              border: '1px solid var(--color-admin-border)',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              fontSize: '12px'
                            }}
                          >
                            <option value="pending">Pendente</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mais Vistos / Estatísticas Extras */}
              <div style={{
                backgroundColor: 'var(--color-admin-card)',
                border: '1px solid var(--color-admin-border)',
                borderRadius: 'var(--border-radius-theme)',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px' }}>Produtos Mais Visualizados</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.mostViewedProducts.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.images[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)' }}>
                          {p.price ? `R$ ${p.price.toFixed(2)}` : 'Sob Consulta'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                        <Eye size={14} style={{ color: 'var(--color-admin-text-muted)' }} /> {p.views}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUTOS */}
        {activeTab === 'products' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Barra de Busca de Produtos */}
              <input
                type="text"
                placeholder="Pesquise por nome na tabela..."
                value={prodSearchQuery}
                onChange={e => setProdSearchQuery(e.target.value)}
                className="form-control"
                style={{
                  maxWidth: '300px',
                  backgroundColor: 'var(--color-admin-input)',
                  borderColor: 'var(--color-admin-border)',
                  color: 'var(--color-admin-text)'
                }}
              />

              <button className="btn btn-primary" onClick={openNewProductModal}>
                <Plus size={16} /> Novo Produto
              </button>
            </div>

            {/* Listagem de Produtos / Edição In-line */}
            <div style={{
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              borderRadius: 'var(--border-radius-theme)',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-admin-border)', color: 'var(--color-admin-text-muted)' }}>
                    <th style={{ padding: '16px' }}>Foto</th>
                    <th style={{ padding: '16px' }}>Nome</th>
                    <th style={{ padding: '16px' }}>Preço (In-line)</th>
                    <th style={{ padding: '16px' }}>Estoque (In-line)</th>
                    <th style={{ padding: '16px' }}>Status / Destaque</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-admin-border)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <img src={p.images[0]} alt="" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--color-admin-text-muted)' }}>R$</span>
                            <input
                              type="number"
                              defaultValue={p.price || ''}
                              placeholder="Consulta"
                              onBlur={(e) => updateProductPriceInline(p.id, e.target.value)}
                              style={{
                                width: '80px',
                                padding: '6px',
                                borderRadius: '4px',
                                border: '1px solid var(--color-admin-border)',
                                backgroundColor: 'var(--color-admin-input)',
                                color: 'var(--color-admin-text)',
                                fontSize: '13px'
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <input
                            type="number"
                            defaultValue={p.stock}
                            onChange={(e) => updateProductStockInline(p.id, Number(e.target.value))}
                            style={{
                              width: '60px',
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid var(--color-admin-border)',
                              backgroundColor: 'var(--color-admin-input)',
                              color: 'var(--color-admin-text)',
                              fontSize: '13px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => toggleProductActive(p.id)}
                              className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}
                              style={{ border: 'none', cursor: 'pointer' }}
                            >
                              {p.active ? 'Ativo' : 'Inativo'}
                            </button>
                            <button
                              onClick={() => toggleProductFeatured(p.id)}
                              className={`badge ${p.featured ? 'badge-primary' : 'badge-secondary'}`}
                              style={{ border: 'none', cursor: 'pointer', color: p.featured ? '#fff' : 'var(--color-primary)' }}
                            >
                              {p.featured ? 'Destaque' : 'Normal'}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => openEditProductModal(p)}
                              style={{ padding: '6px', color: 'var(--color-admin-text)' }}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => duplicateProduct(p.id)}
                              style={{ padding: '6px', color: '#9f7aea' }}
                              title="Duplicar"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              style={{ padding: '6px', color: 'var(--color-danger)' }}
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIAS */}
        {activeTab === 'categories' && (
          <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Nova Categoria */}
            <div style={{
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              borderRadius: 'var(--border-radius-theme)',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Criar Nova Categoria</h3>
              <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Nome da Categoria</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="form-control"
                    placeholder="Ex: Vasos de Cerâmica"
                    style={{
                      backgroundColor: 'var(--color-admin-input)',
                      borderColor: 'var(--color-admin-border)',
                      color: 'var(--color-admin-text)'
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Cadastrar</button>
              </form>
            </div>

            {/* Listagem de Categorias */}
            <div style={{
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              borderRadius: 'var(--border-radius-theme)',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Categorias Cadastradas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categories.map(c => (
                  <div key={c.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'between',
                    padding: '12px',
                    border: '1px solid var(--color-admin-border)',
                    borderRadius: '6px'
                  }} className="justify-between">
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <button
                      onClick={() => deleteCategory(c.id)}
                      style={{ color: 'var(--color-danger)', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONFIGURAÇÕES / WHITE-LABEL */}
        {activeTab === 'settings' && (
          <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Informações da Loja */}
            <div style={{
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              borderRadius: 'var(--border-radius-theme)',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Dados do Negócio</h3>
              <form onSubmit={handleConfigSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Nome da Floricultura</label>
                  <input
                    type="text"
                    value={configName}
                    onChange={e => setConfigName(e.target.value)}
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Celular / WhatsApp (código de país incluso)</label>
                  <input
                    type="text"
                    value={configPhone}
                    onChange={e => setConfigPhone(e.target.value)}
                    className="form-control"
                    placeholder="5511999999999"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Endereço Completo</label>
                  <input
                    type="text"
                    value={configAddress}
                    onChange={e => setConfigAddress(e.target.value)}
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Taxa de Entrega (R$)</label>
                  <input
                    type="number"
                    value={configDeliveryFee}
                    onChange={e => setConfigDeliveryFee(Number(e.target.value))}
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={configWorkingHours}
                    onChange={e => setConfigWorkingHours(e.target.value)}
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} /> Salvar Informações
                </button>
              </form>
            </div>

            {/* Customização Visual (White-Label Theme) */}
            <div style={{
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              borderRadius: 'var(--border-radius-theme)',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Aparência & Identidade Visual</h3>
              <form onSubmit={handleConfigSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Presets */}
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Presets de Tema White-Label</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {THEME_PRESETS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p.id)}
                        style={{
                          padding: '10px',
                          border: `1px solid ${configThemePreset === p.id ? 'var(--color-primary)' : 'var(--color-admin-border)'}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: configThemePreset === p.id ? 'rgba(30, 58, 30, 0.2)' : 'var(--color-admin-input)',
                          color: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{p.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.primary }} />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.secondary }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Cor Primária</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="color"
                        value={configPrimaryColor}
                        onChange={e => { setConfigPrimaryColor(e.target.value); setConfigThemePreset('custom'); }}
                        style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={configPrimaryColor}
                        onChange={e => { setConfigPrimaryColor(e.target.value); setConfigThemePreset('custom'); }}
                        className="form-control"
                        style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Cor Secundária</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="color"
                        value={configSecondaryColor}
                        onChange={e => { setConfigSecondaryColor(e.target.value); setConfigThemePreset('custom'); }}
                        style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                      />
                      <input
                        type="text"
                        value={configSecondaryColor}
                        onChange={e => { setConfigSecondaryColor(e.target.value); setConfigThemePreset('custom'); }}
                        className="form-control"
                        style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Estilo de Bordas */}
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Estilo de Bordas (Arredondamento)</label>
                  <select
                    value={configBorderRadius}
                    onChange={e => setConfigBorderRadius(e.target.value)}
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  >
                    <option value="none">Retas (Clássico Rústico)</option>
                    <option value="sm">Pequeno (4px)</option>
                    <option value="md">Médio (8px - Padrão Moderno)</option>
                    <option value="lg">Grande (16px - Minimalista Arrojado)</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} /> Aplicar Design
                </button>
              </form>

              {/* Reset Banco */}
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed var(--color-admin-border)' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--color-danger)', fontWeight: 700 }}>Zona de Perigo</h4>
                <p style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', margin: '4px 0 16px 0' }}>
                  Restaura o catálogo para os dados e temas de demonstração iniciais. Suas modificações serão apagadas.
                </p>
                <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('Tem certeza? Isso apagará tudo.')) resetDatabase(); }}>
                  Restaurar Banco de Demonstração
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* MODAL: FORMULÁRIO PRODUTO (NOVO / EDICÃO) */}
      {isProductModalOpen && (
        <div className="modal-overlay animate-fade" onClick={() => setIsProductModalOpen(false)}>
          <div
            className="modal-content animate-scale"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '650px',
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              color: 'var(--color-admin-text)'
            }}
          >
            <div className="modal-header" style={{ borderColor: 'var(--color-admin-border)' }}>
              <h2 className="text-base font-bold">
                {editingProduct ? `Editar: ${editingProduct.name}` : 'Cadastrar Novo Produto'}
              </h2>
              <button className="modal-close" onClick={() => setIsProductModalOpen(false)} style={{ backgroundColor: 'var(--color-admin-input)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Nome e Categoria */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Nome do Produto*</label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={e => setProdName(e.target.value)}
                        className="form-control"
                        placeholder="Ex: Buquê de Girassol"
                        style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Categoria*</label>
                      <select
                        value={prodCategory}
                        onChange={e => setProdCategory(e.target.value)}
                        className="form-control"
                        style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Preços e Estoque */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Preço (R$)*</label>
                      <input
                        type="number"
                        step="0.01"
                        value={prodPrice === null ? '' : prodPrice}
                        onChange={e => setProdPrice(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control"
                        placeholder="Consulta se em branco"
                        style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Preço Promo (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={prodPromoPrice === null ? '' : prodPromoPrice}
                        onChange={e => setProdPromoPrice(e.target.value === '' ? null : Number(e.target.value))}
                        className="form-control"
                        placeholder="Sem promoção se em branco"
                        style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Qtd Estoque*</label>
                      <input
                        type="number"
                        required
                        value={prodStock}
                        onChange={e => setProdStock(Number(e.target.value))}
                        className="form-control"
                        style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Descrição Detalhada*</label>
                    <textarea
                      required
                      value={prodDesc}
                      onChange={e => setProdDesc(e.target.value)}
                      className="form-control"
                      rows={3}
                      placeholder="Descreva as flores, cores, embalagem, tamanho..."
                      style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)', resize: 'vertical' }}
                    />
                  </div>

                  {/* Destaque e Mais Vendido checkboxes */}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={prodFeatured}
                        onChange={e => setProdFeatured(e.target.checked)}
                      />
                      Destacar na Página Inicial
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={prodBestSeller}
                        onChange={e => setProdBestSeller(e.target.checked)}
                      />
                      Marcar como Mais Vendido
                    </label>
                  </div>

                  {/* Arrastar e Soltar Fotos (Drag & Drop) */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Fotos do Produto (Arraste ou Selecione)</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      style={{
                        border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-admin-border)'}`,
                        borderRadius: 'var(--border-radius-theme)',
                        padding: '24px',
                        textAlign: 'center',
                        backgroundColor: dragActive ? 'rgba(30, 58, 30, 0.2)' : 'var(--color-admin-input)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <ImageIcon size={32} style={{ color: 'var(--color-admin-text-muted)', marginBottom: '8px' }} />
                      <p style={{ fontSize: '13px', fontWeight: 500 }}>
                        Arraste fotos aqui ou <span style={{ color: '#9f7aea', textDecoration: 'underline' }}>procure arquivos</span>
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', marginTop: '4px' }}>
                        Suporta PNG, JPG (as fotos serão salvas localmente)
                      </p>
                    </div>

                    {/* Previa das Fotos carregadas */}
                    {prodImages.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                        {prodImages.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-admin-border)' }}>
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                              }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
              <div className="modal-footer" style={{ borderColor: 'var(--color-admin-border)' }}>
                <button type="button" className="btn btn-outline" style={{ color: 'var(--color-admin-text)' }} onClick={() => setIsProductModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
