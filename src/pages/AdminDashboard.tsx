import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import type { Product, Category, BusinessConfig, Role, RolePermissions } from '../types';
import { aiSimulator } from '../utils/aiSimulator';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Save,
  Bell,
  X,
  ArrowUp,
  ArrowDown,
  Monitor,
  Clock,
  Sparkles,
  Smartphone,
  UserPlus,
  Camera,
  Check
} from 'lucide-react';


// Função para gerar beeps sonoros de notificação usando a Web Audio API
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Primeira nota (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.12);

    // Segunda nota (E5) após 120ms
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain2.gain.setValueAtTime(0.08, ctx.currentTime);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.22);
    }, 120);
  } catch (err) {
    console.error('Falha ao reproduzir som de notificação:', err);
  }
};

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
    lowStockAlerts,
    refreshAdmin,
    currentUser,
    users,
    saveUser,
    deleteUser
  } = useAdmin();

  // Abas do Painel
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'editor' | 'settings'>('dashboard');

  // Sub-abas do Dashboard (Métricas vs Analytics Avançado)
  const [dashSubTab, setDashSubTab] = useState<'overview' | 'analytics' | 'heatmap' | 'messages'>('overview');

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
  // Estados dos formulários de Categoria
  const [newCatName, setNewCatName] = useState('');

  // Busca interna de produtos
  const [prodSearchQuery, setProdSearchQuery] = useState('');

  const [customerMessages, setCustomerMessages] = useState<any[]>([]);

  // --- ESTADOS E AUXILIARES DE IA & PERMISSÕES ---
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiTone, setAiTone] = useState('commercial');
  
  // Controle de Permissões
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<Role>('manager');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('staff');

  // Instagram Marketing Modal
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const [instagramProduct, setInstagramProduct] = useState<Product | null>(null);
  const [instagramCaption, setInstagramCaption] = useState('');
  const [instagramHashtags, setInstagramHashtags] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Chat/Auto-responder suggestion
  const [selectedMsgForAi, setSelectedMsgForAi] = useState<string | null>(null);
  const [aiChatDraft, setAiChatDraft] = useState('');

  // Obter permissões do perfil ativo
  const getPermissions = (): RolePermissions => {
    const role = currentUser?.role || 'owner';
    const permissions = config.rolePermissions?.[role] || {
      viewDashboard: true,
      manageProducts: true,
      manageCategories: true,
      manageOrders: true,
      manageChat: true,
      manageEditor: true,
      useAiTools: true
    };
    return permissions;
  };

  const perms = getPermissions();

  const getRoleLabel = (role?: string) => {
    const labels: Record<string, string> = {
      owner: 'Proprietário',
      manager: 'Gerente',
      staff: 'Funcionário',
      stock: 'Estoquista',
      support: 'Atendimento',
      marketing: 'Marketing'
    };
    return labels[role || ''] || 'Indefinido';
  };

  // Garante que o usuário navegue para uma aba permitida
  useEffect(() => {
    const tabChecks = {
      dashboard: perms.viewDashboard || perms.manageOrders || perms.manageChat,
      products: perms.manageProducts,
      categories: perms.manageCategories,
      editor: perms.manageEditor,
      settings: currentUser?.role === 'owner' || currentUser?.role === 'manager'
    };

    if (!tabChecks[activeTab]) {
      const firstPermitted = Object.keys(tabChecks).find(tab => tabChecks[tab as keyof typeof tabChecks]) as any;
      if (firstPermitted) {
        setActiveTab(firstPermitted);
      }
    }
  }, [currentUser, config.rolePermissions, activeTab]);

  // Handlers para IA de cadastro
  const handleSEOOptimize = async () => {
    if (!prodName.trim()) return;
    setAiLoading(prev => ({ ...prev, seo: true }));
    const catObj = categories.find(c => c.id === prodCategory);
    const opt = await aiSimulator.optimizeTitleSEO(prodName, catObj?.name || '');
    setProdName(opt);
    setAiLoading(prev => ({ ...prev, seo: false }));
  };

  const handleCategorySuggest = async () => {
    if (!prodName.trim()) return;
    setAiLoading(prev => ({ ...prev, category: true }));
    const suggestedId = await aiSimulator.suggestCategory(prodName, categories);
    if (suggestedId) {
      setProdCategory(suggestedId);
    }
    setAiLoading(prev => ({ ...prev, category: false }));
  };

  const handleDescriptionGenerate = async () => {
    if (!prodName.trim()) return;
    setAiLoading(prev => ({ ...prev, desc: true }));
    const catObj = categories.find(c => c.id === prodCategory);
    const desc = await aiSimulator.generateProductDescription(prodName, catObj?.name || '', aiTone);
    setProdDesc(desc);
    setAiLoading(prev => ({ ...prev, desc: false }));
  };

  const handleRemoveBG = async () => {
    if (prodImages.length === 0) return;
    setAiLoading(prev => ({ ...prev, removeBg: true }));
    const result = await aiSimulator.removeBackground(prodImages[0]);
    setProdImages(prev => [result, ...prev.slice(1)]);
    setAiLoading(prev => ({ ...prev, removeBg: false }));
  };

  // Handler para IA do Banner
  const [aiCampaignName, setAiCampaignName] = useState('');
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const handleGenerateBanner = async () => {
    if (!aiCampaignName.trim()) return;
    setAiLoading(prev => ({ ...prev, banner: true }));
    const result = await aiSimulator.generateBannerImage(aiCampaignName, config.name, config.primaryColor);
    setConfigBannerImage(result);
    
    // Auto-salva na configuração
    const updatedConfig = {
      ...config,
      bannerImage: result,
      bannerTitle: aiCampaignName
    };
    saveConfig(updatedConfig);

    setAiLoading(prev => ({ ...prev, banner: false }));
    setShowCampaignModal(false);
    setAiCampaignName('');
  };

  // Handler para Instagram Marketing Modal
  const handleInstagramGenerate = async (p: Product) => {
    setInstagramProduct(p);
    setInstagramModalOpen(true);
    setIsCopied(false);
    setAiLoading(prev => ({ ...prev, instagram: true }));
    const catObj = categories.find(c => c.id === p.categoryId);
    const tags = await aiSimulator.suggestHashtags(p.name, catObj?.name || '');
    setInstagramHashtags(tags);
    const caption = await aiSimulator.generateInstagramPost(p.name, p.price, p.promoPrice, tags);
    setInstagramCaption(caption);
    setAiLoading(prev => ({ ...prev, instagram: false }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(instagramCaption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handler para Auto-responder Chat
  const handleSuggestChatReply = (msgContent: string, msgId: string) => {
    setSelectedMsgForAi(msgId);
    const reply = aiSimulator.getFAQResponse(msgContent, config, products);
    setAiChatDraft(reply);
  };

  const handleSendChatReply = (msgId: string) => {
    // Adiciona a resposta simulada no localStorage das mensagens
    const messages = JSON.parse(localStorage.getItem('floricultura_customer_messages') || '[]');
    const index = messages.findIndex((m: any) => m.id === msgId);
    if (index >= 0) {
      messages[index].reply = aiChatDraft;
      messages[index].read = true;
      localStorage.setItem('floricultura_customer_messages', JSON.stringify(messages));
      setCustomerMessages(messages);
    }
    setSelectedMsgForAi(null);
    setAiChatDraft('');
  };

  // Handler para toggle de permissões pelo proprietário
  const handlePermissionToggle = (role: Role, field: keyof RolePermissions) => {
    const rolePerms = config.rolePermissions || {
      owner: { viewDashboard: true, manageProducts: true, manageCategories: true, manageOrders: true, manageChat: true, manageEditor: true, useAiTools: true },
      manager: { viewDashboard: true, manageProducts: true, manageCategories: true, manageOrders: true, manageChat: true, manageEditor: true, useAiTools: true },
      staff: { viewDashboard: false, manageProducts: true, manageCategories: false, manageOrders: true, manageChat: false, manageEditor: false, useAiTools: false },
      stock: { viewDashboard: false, manageProducts: true, manageCategories: false, manageOrders: false, manageChat: false, manageEditor: false, useAiTools: false },
      support: { viewDashboard: false, manageProducts: false, manageCategories: false, manageOrders: true, manageChat: true, manageEditor: false, useAiTools: false },
      marketing: { viewDashboard: true, manageProducts: false, manageCategories: true, manageOrders: false, manageChat: false, manageEditor: true, useAiTools: true },
    };

    const updatedRolePerms = {
      ...rolePerms,
      [role]: {
        ...rolePerms[role],
        [field]: !rolePerms[role][field]
      }
    };

    const updatedConfig = {
      ...config,
      rolePermissions: updatedRolePerms
    };
    saveConfig(updatedConfig);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newDisplayName.trim()) return;

    saveUser({
      username: newUsername.trim().toLowerCase(),
      password: newPassword,
      name: newDisplayName.trim(),
      role: newUserRole
    });

    setShowAddUserModal(false);
    setNewUsername('');
    setNewPassword('');
    setNewDisplayName('');
  };


  // Estados da configuração visual (Shopify-like Builder)
  const [configName, setConfigName] = useState(config.name);
  const [configPhone, setConfigPhone] = useState(config.phone);
  const [configAddress, setConfigAddress] = useState(config.address);
  const [configDeliveryFee, setConfigDeliveryFee] = useState(config.deliveryFee);
  const [configWorkingHours, setConfigWorkingHours] = useState(config.workingHours);
  
  // Customização Visual do Builder
  const [configPrimaryColor, setConfigPrimaryColor] = useState(config.primaryColor);
  const [configSecondaryColor, setConfigSecondaryColor] = useState(config.secondaryColor);
  const [configBgColor, setConfigBgColor] = useState(config.backgroundColor || '#f7f9f7');
  const [configTextColor, setConfigTextColor] = useState(config.textColor || '#2c3e2c');
  const [configThemePreset, setConfigThemePreset] = useState(config.themePreset);
  const [configBorderRadius, setConfigBorderRadius] = useState(config.borderRadius);
  const [configButtonStyle, setConfigButtonStyle] = useState(config.buttonStyle || 'rounded');
  
  // Banner Customizer
  const [configBannerTitle, setConfigBannerTitle] = useState(config.bannerTitle || 'Sua Floricultura Digital de Confiança');
  const [configBannerSubtitle, setConfigBannerSubtitle] = useState(config.bannerSubtitle || 'Escolha o presente perfeito, monte seu carrinho e finalize o pedido diretamente pelo WhatsApp.');
  const [configBannerImage, setConfigBannerImage] = useState(config.bannerImage || '/florist_banner.png');
  const configBannerBtnText = config.bannerBtnText || 'Ver Todos os Produtos';
  const [configSectionsOrder, setConfigSectionsOrder] = useState<string[]>(config.sectionsOrder || ['hero', 'categories', 'featured', 'bestsellers', 'catalog']);

  // --- 7 PRESETS DE TEMAS WHITE-LABEL ---
  const THEME_PRESETS = [
    { id: 'elegance', name: 'Floricultura Elegance', primary: '#b53f60', secondary: '#fcdfd7', bg: '#fbf8f7', text: '#3c242b', radius: 'md', btn: 'pill' },
    { id: 'garden-modern', name: 'Garden Modern (Padrão)', primary: '#198754', secondary: '#e8f5e9', bg: '#f8faf9', text: '#192f19', radius: 'md', btn: 'rounded' },
    { id: 'minimal', name: 'Minimal (P&B)', primary: '#000000', secondary: '#f1f1f1', bg: '#ffffff', text: '#111111', radius: 'none', btn: 'rect' },
    { id: 'premium', name: 'Premium (Esmeralda)', primary: '#0f5132', secondary: '#fcd3e5', bg: '#faf6f8', text: '#193024', radius: 'md', btn: 'rounded' },
    { id: 'dark', name: 'Dark Mode (Escuro)', primary: '#25d366', secondary: '#2d2f36', bg: '#121212', text: '#e2e8f0', radius: 'md', btn: 'pill' },
    { id: 'luxury', name: 'Luxury (Marinho)', primary: '#0f172a', secondary: '#caf0f8', bg: '#f8fafc', text: '#0f172a', radius: 'sm', btn: 'rect' },
    { id: 'natural', name: 'Natural (Terracota)', primary: '#2d6a4f', secondary: '#ffb703', bg: '#f9f6f0', text: '#1b4332', radius: 'lg', btn: 'rounded' }
  ];

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setConfigThemePreset(presetId);
      setConfigPrimaryColor(preset.primary);
      setConfigSecondaryColor(preset.secondary);
      setConfigBgColor(preset.bg);
      setConfigTextColor(preset.text);
      setConfigBorderRadius(preset.radius);
      setConfigButtonStyle(preset.btn as any);
      
      // Auto-salva no banco para atualizar o preview
      const updatedConfig: BusinessConfig = {
        ...config,
        themePreset: presetId,
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        backgroundColor: preset.bg,
        textColor: preset.text,
        borderRadius: preset.radius,
        buttonStyle: preset.btn as any
      };
      saveConfig(updatedConfig);
    }
  };

  // --- ESCUTADOR DE NOTIFICAÇÕES (PWA / STORAGE) ---
  useEffect(() => {
    // Carregar mensagens do cliente inicialmente
    setCustomerMessages(JSON.parse(localStorage.getItem('floricultura_customer_messages') || '[]'));

    // Pedir permissão de notificações do navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const handleStorageChange = () => {
      // 1. Monitora novos pedidos
      const savedOrders = JSON.parse(localStorage.getItem('floricultura_orders') || '[]');
      const lastOrderCount = Number(localStorage.getItem('last_order_count') || '0');
      
      if (savedOrders.length > lastOrderCount) {
        localStorage.setItem('last_order_count', savedOrders.length.toString());
        if (lastOrderCount > 0) {
          playNotificationSound();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🌸 Novo Pedido Recebido!', {
              body: `Pedido #${savedOrders[0].id} de ${savedOrders[0].customerName} no valor de R$ ${savedOrders[0].total.toFixed(2)}`,
              icon: '/favicon.svg'
            });
          }
        }
      } else {
        localStorage.setItem('last_order_count', savedOrders.length.toString());
      }

      // 2. Monitora mensagens do cliente
      const savedMsgs = JSON.parse(localStorage.getItem('floricultura_customer_messages') || '[]');
      setCustomerMessages(savedMsgs);
      const lastMsgCount = Number(localStorage.getItem('last_msg_count') || '0');
      
      if (savedMsgs.length > lastMsgCount) {
        localStorage.setItem('last_msg_count', savedMsgs.length.toString());
        if (lastMsgCount > 0) {
          playNotificationSound();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('💬 Nova Mensagem de Suporte!', {
              body: `${savedMsgs[0].name}: "${savedMsgs[0].message}"`,
              icon: '/favicon.svg'
            });
          }
        }
      } else {
        localStorage.setItem('last_msg_count', savedMsgs.length.toString());
      }

      // 3. Monitora se o estoque zerou
      const savedProducts = JSON.parse(localStorage.getItem('floricultura_products') || '[]');
      const outOfStockIds = savedProducts.filter((p: any) => p.stock === 0 && p.active).map((p: any) => p.id);
      const prevOutOfStock = JSON.parse(localStorage.getItem('prev_out_of_stock') || '[]');
      
      const newOutOfStock = outOfStockIds.filter((id: string) => !prevOutOfStock.includes(id));
      if (newOutOfStock.length > 0) {
        const prod = savedProducts.find((p: any) => p.id === newOutOfStock[0]);
        if (prod) {
          playNotificationSound();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⚠️ Produto Esgotado!', {
              body: `O produto "${prod.name}" acabou de ficar sem estoque.`,
              icon: '/favicon.svg'
            });
          }
        }
      }
      localStorage.setItem('prev_out_of_stock', JSON.stringify(outOfStockIds));

      refreshAdmin();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('new_customer_message', handleStorageChange);
    
    // Inicializar os contadores de controle
    localStorage.setItem('last_order_count', orders.length.toString());
    localStorage.setItem('last_msg_count', customerMessages.length.toString());
    const initProducts = JSON.parse(localStorage.getItem('floricultura_products') || '[]');
    localStorage.setItem('prev_out_of_stock', JSON.stringify(initProducts.filter((p: any) => p.stock === 0 && p.active).map((p: any) => p.id)));

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('new_customer_message', handleStorageChange);
    };
  }, [orders, customerMessages, refreshAdmin]);

  // --- REORDENAÇÃO DE SEÇÕES (BUILDER) ---
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const updated = [...configSectionsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    
    // Troca
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    setConfigSectionsOrder(updated);
    
    // Auto-salva para atualizar o iframe/preview
    saveConfig({
      ...config,
      sectionsOrder: updated
    });
  };

  const sectionNamePT = (key: string) => {
    switch (key) {
      case 'hero': return 'Banner Principal (Hero)';
      case 'categories': return 'Navegador de Categorias';
      case 'featured': return 'Grid de Destaques';
      case 'bestsellers': return 'Grid de Mais Vendidos';
      case 'catalog': return 'Catálogo Completo';
      default: return key;
    }
  };

  // --- ACTIONS ---
  const handleConfigSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedConfig: BusinessConfig = {
      ...config,
      name: configName,
      phone: configPhone,
      address: configAddress,
      deliveryFee: Number(configDeliveryFee),
      workingHours: configWorkingHours,
      primaryColor: configPrimaryColor,
      secondaryColor: configSecondaryColor,
      backgroundColor: configBgColor,
      textColor: configTextColor,
      themePreset: configThemePreset,
      borderRadius: configBorderRadius,
      buttonStyle: configButtonStyle,
      bannerTitle: configBannerTitle,
      bannerSubtitle: configBannerSubtitle,
      bannerImage: configBannerImage,
      bannerBtnText: configBannerBtnText,
      sectionsOrder: configSectionsOrder
    };
    saveConfig(updatedConfig);
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

  // Inline table controls
  const updateProductPriceInline = (id: string, val: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    saveProduct({ ...prod, price: val === '' ? null : Number(val) });
  };

  const updateProductStockInline = (id: string, val: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    saveProduct({ ...prod, stock: Math.max(0, val) });
  };

  // Busca filtrada de produtos para a tabela administrativa
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(prodSearchQuery.toLowerCase())
  );

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

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdPrice(p.price);
    setProdPromoPrice(p.promoPrice);
    setProdCategory(p.categoryId);
    setProdStock(p.stock);
    setProdFeatured(p.featured);
    setProdBestSeller(p.bestSeller);
    setProdImages(p.images);
    setIsProductModalOpen(true);
  };

  // --- MOCK FILES & MOCK LOADERS FOR IMAGES ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setConfigBannerImage(reader.result as string);
          // Auto-salva para atualizar o preview
          saveConfig({
            ...config,
            bannerImage: reader.result as string
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- CHARTS CALCULATIONS (SVG) ---

  // 1. Pizza/Rosca Origens
  const googleCount = stats.sources?.google || 12;
  const instaCount = stats.sources?.instagram || 45;
  const fbCount = stats.sources?.facebook || 18;
  const qrCount = stats.sources?.qrcode || 9;
  const directCount = stats.sources?.direct || 16;
  const totalSources = googleCount + instaCount + fbCount + qrCount + directCount || 1;

  const googlePct = Number(((googleCount / totalSources) * 100).toFixed(0));
  const instaPct = Number(((instaCount / totalSources) * 100).toFixed(0));
  const fbPct = Number(((fbCount / totalSources) * 100).toFixed(0));
  const qrPct = Number(((qrCount / totalSources) * 100).toFixed(0));
  const directPct = Number(((directCount / totalSources) * 100).toFixed(0));

  // Desenhar Donut Chart em SVG usando strokeDasharray
  const r = 50;
  const circ = 2 * Math.PI * r; // ~314.16

  const googleDash = (googlePct / 100) * circ;
  const instaDash = (instaPct / 100) * circ;
  const fbDash = (fbPct / 100) * circ;
  const qrDash = (qrPct / 100) * circ;
  const directDash = (directPct / 100) * circ;

  // 2. Horários de Pico (SVG Line Polyline Points)
  const maxViews = Math.max(...Object.values(stats.hourlyViews || {}), 1);
  const polylinePoints = Object.entries(stats.hourlyViews || {})
    .map(([hour, val]) => {
      const x = (Number(hour) / 23) * 320 + 40; // 40px left padding, 320px width
      const y = 140 - (Number(val) / maxViews) * 100; // 140px height, 100px max height
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{
      backgroundColor: 'var(--color-admin-bg)',
      color: 'var(--color-admin-text)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '40px'
    }}>
      {/* Top Navbar */}
      <div style={{ borderBottom: '1px solid var(--color-admin-border)', backgroundColor: 'var(--color-admin-card)', padding: '12px 0' }}>
        <div className="container flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Usuário Logado */}
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '16px', borderRight: '1px solid var(--color-admin-border)', paddingRight: '16px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: '2px solid rgba(255,255,255,0.1)'
                }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-admin-text)' }}>{currentUser.name}</span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: currentUser.role === 'owner' ? 'var(--color-primary)' : 'var(--color-secondary)',
                    backgroundColor: currentUser.role === 'owner' ? 'rgba(var(--color-primary-rgb), 0.15)' : 'rgba(var(--color-secondary-rgb), 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    width: 'fit-content',
                    marginTop: '2px'
                  }}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
            )}

            {/* Abas Permitidas */}
            {(perms.viewDashboard || perms.manageOrders || perms.manageChat) && (
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
                <LayoutDashboard size={18} /> Dashboard / Analytics
              </button>
            )}
            {perms.manageProducts && (
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
            )}
            {perms.manageCategories && (
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
            )}
            {perms.manageEditor && (
              <button
                onClick={() => setActiveTab('editor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--border-radius-theme)',
                  fontSize: '14px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'editor' ? 'var(--color-primary)' : 'transparent',
                  color: '#ffffff'
                }}
              >
                <Monitor size={18} style={{ color: 'var(--color-secondary)' }} /> Editor Visual
              </button>
            )}
            {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
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
                <Settings size={18} /> Dados Gerais
              </button>
            )}
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

      {/* Alertas de Estoque Baixo */}
      {lowStockAlerts.length > 0 && activeTab === 'dashboard' && (
        <div className="container mt-6">
          <div style={{
            backgroundColor: 'rgba(255, 183, 3, 0.1)',
            border: '1px solid rgba(255, 183, 3, 0.3)',
            borderRadius: 'var(--border-radius-theme)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }} className="animate-fade">
            <Bell size={20} style={{ color: 'var(--color-warning)' }} />
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-warning)' }}>Atenção: Itens em Alerta de Estoque</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', marginTop: '2px' }}>
                Há {lowStockAlerts.length} produtos que estão prestes a esgotar no catálogo do cliente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABS BODY */}
      <div className="container mt-6 flex-1">
        
        {/* TAB 1: DASHBOARD & ANALYTICS */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Sub-abas do Dashboard */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-admin-border)',
              gap: '12px',
              paddingBottom: '2px'
            }}>
              {['overview', 'analytics', 'heatmap', 'messages'].map((sub) => {
                const labels: Record<string, string> = {
                  overview: 'Estatísticas Gerais',
                  analytics: 'Analytics Avançado',
                  heatmap: 'Mapa de Calor de Cliques',
                  messages: `Mensagens Suporte (${customerMessages.filter(m => !m.read).length})`
                };
                return (
                  <button
                    key={sub}
                    onClick={() => setDashSubTab(sub as any)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderBottom: dashSubTab === sub ? '2px solid var(--color-primary)' : 'none',
                      color: dashSubTab === sub ? 'var(--color-admin-text)' : 'var(--color-admin-text-muted)'
                    }}
                  >
                    {labels[sub]}
                  </button>
                );
              })}
            </div>

            {/* SUBTAB 1.1: OVERVIEW COMUM */}
            {dashSubTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade">
                {/* 4 Cards Principais */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Faturamento Mensal</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>R$ {stats.monthlyRevenue.toFixed(2)}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pedidos Hoje</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>{stats.ordersTodayCount}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Conversões WhatsApp</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>{stats.whatsappClicksCount}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Taxa de Conversão</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: 'var(--color-success)' }}>{stats.conversionRate}%</div>
                  </div>
                </div>

                {/* Gráficos em Linha / SVG */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  
                  {/* Gráfico 1: Acessos por Hora (Pico) */}
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} /> Fluxo de Horário de Pico (Acessos/Hora)
                    </h4>
                    <div style={{ width: '100%', height: '160px' }}>
                      <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
                        {/* Linhas de grade horizontais */}
                        <line x1="40" y1="40" x2="360" y2="40" stroke="#272d2d" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="40" y1="90" x2="360" y2="90" stroke="#272d2d" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="40" y1="140" x2="360" y2="140" stroke="#272d2d" strokeWidth="1.5" />
                        
                        {/* Linha de dados */}
                        <polyline
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeWidth="3.5"
                          points={polylinePoints}
                          style={{ transition: 'all 0.5s ease' }}
                        />
                        
                        {/* Legendas de Horas */}
                        <text x="40" y="155" fill="var(--color-admin-text-muted)" fontSize="9" textAnchor="middle">00h</text>
                        <text x="120" y="155" fill="var(--color-admin-text-muted)" fontSize="9" textAnchor="middle">06h</text>
                        <text x="200" y="155" fill="var(--color-admin-text-muted)" fontSize="9" textAnchor="middle">12h</text>
                        <text x="280" y="155" fill="var(--color-admin-text-muted)" fontSize="9" textAnchor="middle">18h</text>
                        <text x="360" y="155" fill="var(--color-admin-text-muted)" fontSize="9" textAnchor="middle">23h</text>
                      </svg>
                    </div>
                  </div>

                  {/* Gráfico 2: Donut Origens do Tráfego */}
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        {/* Google */}
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#ffb703" strokeWidth="12"
                          strokeDasharray={`${googleDash} ${circ - googleDash}`} />
                        {/* Instagram */}
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f72585" strokeWidth="12"
                          strokeDasharray={`${instaDash} ${circ - instaDash}`} strokeDashoffset={-googleDash} />
                        {/* Facebook */}
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#3b5998" strokeWidth="12"
                          strokeDasharray={`${fbDash} ${circ - fbDash}`} strokeDashoffset={-(googleDash + instaDash)} />
                        {/* QR Code */}
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#2ec4b6" strokeWidth="12"
                          strokeDasharray={`${qrDash} ${circ - qrDash}`} strokeDashoffset={-(googleDash + instaDash + fbDash)} />
                        {/* Direct */}
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#6c757d" strokeWidth="12"
                          strokeDasharray={`${directDash} ${circ - directDash}`} strokeDashoffset={-(googleDash + instaDash + fbDash + qrDash)} />
                      </svg>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: 'var(--color-admin-text)' }}>Canais de Origem</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffb703' }} />
                        <span>Google ({googlePct}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f72585' }} />
                        <span>Instagram ({instaPct}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b5998' }} />
                        <span>Facebook ({fbPct}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2ec4b6' }} />
                        <span>QR Code ({qrPct}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6c757d' }} />
                        <span>Direto ({directPct}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pedidos Recentes */}
                <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px' }}>Lista de Pedidos Recentes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orders.map(order => (
                      <div key={order.id} style={{ padding: '12px', border: '1px solid var(--color-admin-border)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="justify-between">
                        <div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
                            <span>#{order.id}</span>
                            <span style={{ color: 'var(--color-admin-text-muted)', fontWeight: 500 }}>{order.customerName}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', marginTop: '2px' }}>
                            {order.items.length} itens • R$ {order.total.toFixed(2)}
                          </div>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          style={{
                            backgroundColor: 'var(--color-admin-input)',
                            color: 'var(--color-admin-text)',
                            border: '1px solid var(--color-admin-border)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px'
                          }}
                        >
                          <option value="pending">Pendente</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 1.2: ANALYTICS AVANÇADO */}
            {dashSubTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade">
                
                {/* Tempo Médio e Pedidos Gerais */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tempo Médio na Página</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>{stats.avgTimeOnPage} segundos</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pedidos Esta Semana</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>{stats.ordersWeekCount}</div>
                  </div>
                </div>

                {/* Mais Vistos vs Menos Vistos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  
                  {/* Mais Vistos */}
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)' }}>
                      <Sparkles size={16} /> Produtos Mais Visto (Quente)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {stats.mostViewedProducts.map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-admin-text-muted)' }}>{idx + 1}.</span>
                          <img src={p.images[0]} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h5 style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h5>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700 }}>{p.views} visualizações</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Menos Vistos */}
                  <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)' }}>
                      <Clock size={16} /> Produtos Menos Vistos (Frio)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {stats.leastViewedProducts.map((p, idx) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-admin-text-muted)' }}>{idx + 1}.</span>
                          <img src={p.images[0]} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h5 style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h5>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700 }}>{p.views} visualizações</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Categorias mais Acessadas */}
                <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Categorias Mais Acessadas</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(stats.categoryViews || {}).map(([catId, count]) => {
                      const name = categories.find(c => c.id === catId)?.name || 'Todos os Produtos';
                      return (
                        <div key={catId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }} className="justify-between">
                            <span>{name}</span>
                            <span>{count} acessos</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-admin-input)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (count / 150) * 100)}%`,
                              height: '100%',
                              backgroundColor: 'var(--color-primary)',
                              borderRadius: '4px'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 1.3: HEATMAP SIMULADO */}
            {dashSubTab === 'heatmap' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade">
                <div style={{
                  backgroundColor: 'var(--color-admin-card)',
                  border: '1px solid var(--color-admin-border)',
                  borderRadius: 'var(--border-radius-theme)',
                  padding: '20px'
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Mapa de Calor de Cliques</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', marginBottom: '20px' }}>
                    Densidade de cliques registrados por região do site na última semana.
                  </p>

                  {/* Wireframe Mockup da Página */}
                  <div style={{
                    maxWidth: '480px',
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    color: '#222222',
                    borderRadius: '16px',
                    border: '8px solid var(--color-admin-border)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {/* Header Mock */}
                    <div style={{ padding: '14px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', position: 'relative' }} className="justify-between">
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>Logo / Nome Loja</span>
                      <span style={{ fontSize: '10px', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>
                        Sacola
                        {/* Thermal dot */}
                        <span style={{
                          position: 'absolute',
                          top: '4px',
                          right: '6px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 183, 3, 0.65)',
                          color: '#000',
                          fontSize: '8px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 8px rgba(255, 183, 3, 0.9)'
                        }} title="Clique no botão do carrinho">
                          {stats.heatmap['cart-button'] || 45}
                        </span>
                      </span>
                    </div>

                    {/* Banner Hero Mock */}
                    <div style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      padding: '40px 20px',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Título do Banner</div>
                      <div style={{ width: '80%', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', margin: '10px auto 0 auto', position: 'relative' }}>
                        <span style={{ fontSize: '8px', color: '#999', display: 'block', paddingTop: '3px' }}>Buscar...</span>
                        {/* Thermal dot */}
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(46, 196, 182, 0.7)',
                          color: '#fff',
                          fontSize: '8px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 10px rgba(46, 196, 182, 0.9)'
                        }} title="Cliques no Input de Busca">
                          {stats.heatmap['search-input'] || 95}
                        </span>
                      </div>
                    </div>

                    {/* Categorias Mock */}
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid #eee', display: 'flex', gap: '6px', overflow: 'hidden', position: 'relative' }}>
                      <span style={{ fontSize: '9px', padding: '3px 8px', backgroundColor: '#eee', borderRadius: '10px' }}>Todos</span>
                      <span style={{ fontSize: '9px', padding: '3px 8px', backgroundColor: '#eee', borderRadius: '10px' }}>Buquês</span>
                      <span style={{ fontSize: '9px', padding: '3px 8px', backgroundColor: '#eee', borderRadius: '10px' }}>Orquídeas</span>
                      {/* Thermal dot */}
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '40%',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(230, 57, 70, 0.75)',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(230, 57, 70, 0.9)'
                      }} title="Cliques nas Categorias">
                        {stats.heatmap['category-nav'] || 124}
                      </span>
                    </div>

                    {/* Grade de Produtos Mock */}
                    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', position: 'relative' }}>
                      <div style={{ border: '1px solid #eee', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ width: '100%', height: '60px', backgroundColor: '#f1f3f1', borderRadius: '4px' }} />
                        <div style={{ width: '70%', height: '10px', backgroundColor: '#e2e8f0', margin: '8px 0 4px 0', borderRadius: '2px' }} />
                        <div style={{ width: '50%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                        <div style={{ width: '100%', height: '18px', backgroundColor: 'var(--color-primary)', marginTop: '8px', borderRadius: '4px', position: 'relative' }}>
                          {/* Thermal dot */}
                          <span style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 183, 3, 0.7)',
                            color: '#000',
                            fontSize: '8px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 8px rgba(255, 183, 3, 0.9)'
                          }} title="Cliques no botão de compra rápida">
                            {stats.heatmap['buy-button'] || 74}
                          </span>
                        </div>
                      </div>
                      <div style={{ border: '1px solid #eee', borderRadius: '6px', padding: '8px', position: 'relative' }}>
                        <div style={{ width: '100%', height: '60px', backgroundColor: '#f1f3f1', borderRadius: '4px' }} />
                        <div style={{ width: '70%', height: '10px', backgroundColor: '#e2e8f0', margin: '8px 0 4px 0', borderRadius: '2px' }} />
                        <div style={{ width: '100%', height: '18px', backgroundColor: 'var(--color-primary)', marginTop: '8px', borderRadius: '4px' }} />
                        
                        {/* Thermal dot for Card Detail */}
                        <span style={{
                          position: 'absolute',
                          top: '20px',
                          left: '20px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(230, 57, 70, 0.8)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 12px rgba(230, 57, 70, 0.95)'
                        }} title="Cliques para abrir Modal de Detalhes">
                          {stats.heatmap['product-detail'] || 167}
                        </span>
                      </div>
                    </div>

                    {/* WhatsApp floating bubble mock */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#25d366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                    }}>
                      <span style={{ color: '#fff', fontSize: '11px' }}>💬</span>
                      {/* Thermal dot */}
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '-8px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 183, 3, 0.75)',
                        color: '#000',
                        fontSize: '8px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 8px rgba(255, 183, 3, 0.9)'
                      }} title="Cliques no WhatsApp flutuante">
                        {stats.heatmap['whatsapp-floating'] || 32}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 1.4: MENSAGENS DO CLIENTE (SUPORTE SIMULADO) */}
            {dashSubTab === 'messages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade">
                <div style={{
                  backgroundColor: 'var(--color-admin-card)',
                  border: '1px solid var(--color-admin-border)',
                  borderRadius: 'var(--border-radius-theme)',
                  padding: '20px'
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '15px' }}>Mensagens e Dúvidas Recebidas</h3>
                  {customerMessages.length === 0 ? (
                    <p style={{ color: 'var(--color-admin-text-muted)', fontSize: '13px' }}>Nenhuma mensagem de suporte recebida ainda.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {customerMessages.map(msg => (
                        <div
                          key={msg.id}
                          style={{
                            padding: '16px',
                            backgroundColor: msg.read ? 'transparent' : 'rgba(30, 58, 30, 0.1)',
                            border: `1px solid ${msg.read ? 'var(--color-admin-border)' : 'var(--color-primary)'}`,
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="justify-between">
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>💬 {msg.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--color-admin-text)' }}>{msg.message}</p>
                          
                          {msg.reply ? (
                             <div style={{ backgroundColor: 'var(--color-admin-input)', padding: '10px', borderRadius: '6px', fontSize: '12px', borderLeft: '3px solid var(--color-primary)', marginTop: '4px' }}>
                               <strong style={{ color: 'var(--color-primary)' }}>✓ Respondido por IA:</strong>
                               <p style={{ marginTop: '4px', color: 'var(--color-admin-text-muted)' }}>{msg.reply}</p>
                             </div>
                           ) : (
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                               {/* Área de Rascunho IA se selecionado */}
                               {selectedMsgForAi === msg.id ? (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--color-admin-input)', padding: '12px', borderRadius: '6px' }}>
                                   <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Rascunho IA (Pode editar antes de enviar):</label>
                                   <textarea
                                     value={aiChatDraft}
                                     onChange={e => setAiChatDraft(e.target.value)}
                                     className="form-control"
                                     rows={3}
                                     style={{ fontSize: '12px', backgroundColor: 'var(--color-admin-card)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                                   />
                                   <div style={{ display: 'flex', gap: '8px' }}>
                                     <button type="button" onClick={() => handleSendChatReply(msg.id)} className="btn btn-sm btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                                       Enviar Resposta
                                     </button>
                                     <button type="button" onClick={() => setSelectedMsgForAi(null)} className="btn btn-sm btn-outline" style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--color-admin-text)' }}>
                                       Cancelar
                                     </button>
                                   </div>
                                 </div>
                               ) : (
                                 <div style={{ display: 'flex', gap: '10px' }}>
                                   {!msg.read && (
                                     <button
                                       onClick={() => {
                                         const list = customerMessages.map(m => m.id === msg.id ? { ...m, read: true } : m);
                                         localStorage.setItem('floricultura_customer_messages', JSON.stringify(list));
                                         setCustomerMessages(list);
                                       }}
                                       className="btn btn-sm btn-outline"
                                       style={{ fontSize: '11px', padding: '6px 12px' }}
                                     >
                                       Marcar como Lida
                                     </button>
                                   )}
                                   {perms.useAiTools && (
                                     <button
                                       type="button"
                                       onClick={() => handleSuggestChatReply(msg.message, msg.id)}
                                       className="btn btn-sm btn-primary"
                                       style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                     >
                                       <Sparkles size={12} /> Auto-responder IA
                                     </button>
                                   )}
                                 </div>
                               )}
                             </div>
                           )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PRODUTOS */}
        {activeTab === 'products' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }} className="justify-between">
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

            <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-admin-border)', color: 'var(--color-admin-text-muted)' }}>
                    <th style={{ padding: '16px' }}>Foto</th>
                    <th style={{ padding: '16px' }}>Nome</th>
                    <th style={{ padding: '16px' }}>Preço (In-line)</th>
                    <th style={{ padding: '16px' }}>Estoque (In-line)</th>
                    <th style={{ padding: '16px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-admin-border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <img src={p.images[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="number"
                          defaultValue={p.price || ''}
                          onBlur={(e) => updateProductPriceInline(p.id, e.target.value)}
                          style={{
                            width: '75px',
                            padding: '6px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--color-admin-input)',
                            color: 'var(--color-admin-text)',
                            border: '1px solid var(--color-admin-border)'
                          }}
                        />
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
                            backgroundColor: 'var(--color-admin-input)',
                            color: 'var(--color-admin-text)',
                            border: '1px solid var(--color-admin-border)'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {currentUser?.role !== 'stock' ? (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => openEditProductModal(p)} style={{ color: '#fff' }} title="Editar"><Edit2 size={16} /></button>
                            <button onClick={() => handleInstagramGenerate(p)} style={{ color: '#e1306c' }} title="Gerar Post Instagram (IA)"><Camera size={16} /></button>
                            <button onClick={() => duplicateProduct(p.id)} style={{ color: '#9f7aea' }} title="Duplicar"><Copy size={16} /></button>
                            <button onClick={() => deleteProduct(p.id)} style={{ color: 'var(--color-danger)' }} title="Excluir"><Trash2 size={16} /></button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', fontWeight: 600 }}>Somente Estoque</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIAS */}
        {activeTab === 'categories' && (
          <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Criar Nova Categoria</h3>
              <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Nome da Categoria</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="form-control"
                    placeholder="Ex: Cestas Rústicas"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Cadastrar</button>
              </form>
            </div>

            <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Categorias Cadastradas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categories.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--color-admin-border)', borderRadius: '6px' }} className="justify-between">
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <button onClick={() => deleteCategory(c.id)} style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EDITOR VISUAL TIPO SHOPIFY */}
        {activeTab === 'editor' && (
          <div className="animate-fade" style={{
            display: 'grid',
            gridTemplateColumns: '380px 1fr',
            gap: '24px',
            alignItems: 'start'
          }}>
            
            {/* Editor Painel Esquerda */}
            <div style={{
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              borderRadius: 'var(--border-radius-theme)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              
              {/* Presets de Temas de 1 Clique */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Presets de Temas (1 Clique)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {THEME_PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${configThemePreset === p.id ? 'var(--color-primary)' : 'var(--color-admin-border)'}`,
                        backgroundColor: configThemePreset === p.id ? 'rgba(30, 58, 30, 0.15)' : 'var(--color-admin-input)',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      className="justify-between"
                    >
                      <span>{p.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.primary }} />
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.secondary }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordem das Seções */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Ordem das Seções da Home</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {configSectionsOrder.map((section, idx) => (
                    <div
                      key={section}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-admin-input)',
                        border: '1px solid var(--color-admin-border)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}
                      className="justify-between"
                    >
                      <span style={{ fontWeight: 600 }}>{sectionNamePT(section)}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          style={{ padding: '4px', opacity: idx === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === configSectionsOrder.length - 1}
                          style={{ padding: '4px', opacity: idx === configSectionsOrder.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customizador de Banner */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', borderTop: '1px solid var(--color-admin-border)', paddingTop: '10px' }}>Customizar Banner</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Título do Banner</label>
                    <input
                      type="text"
                      value={configBannerTitle}
                      onChange={e => { setConfigBannerTitle(e.target.value); handleConfigSave(); }}
                      onBlur={() => handleConfigSave()}
                      className="form-control"
                      style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)', padding: '8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Subtítulo do Banner</label>
                    <textarea
                      value={configBannerSubtitle}
                      onChange={e => { setConfigBannerSubtitle(e.target.value); handleConfigSave(); }}
                      onBlur={() => handleConfigSave()}
                      className="form-control"
                      rows={2}
                      style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)', padding: '8px', fontSize: '12px' }}
                    />
                  </div>
                  
                  {perms.useAiTools && (
                    <button
                      type="button"
                      onClick={() => setShowCampaignModal(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        color: 'var(--color-secondary)',
                        backgroundColor: 'rgba(252, 223, 215, 0.15)',
                        border: '1px dashed var(--color-secondary)',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginTop: '4px'
                      }}
                    >
                      <Sparkles size={13} /> {aiLoading.banner ? 'Gerando Banner...' : 'Gerar Banner por IA'}
                    </button>
                  )}

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Imagem de Fundo (Selecione arquivo)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileChange}
                      className="form-control"
                      style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)', padding: '8px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Customizar Cores & Botões */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', borderTop: '1px solid var(--color-admin-border)', paddingTop: '10px' }}>Cores do Cliente</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '10px' }}>Fundo Site</label>
                    <input
                      type="color"
                      value={configBgColor}
                      onChange={e => { setConfigBgColor(e.target.value); setConfigThemePreset('custom'); handleConfigSave(); }}
                      style={{ width: '100%', height: '30px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '10px' }}>Cor Texto</label>
                    <input
                      type="color"
                      value={configTextColor}
                      onChange={e => { setConfigTextColor(e.target.value); setConfigThemePreset('custom'); handleConfigSave(); }}
                      style={{ width: '100%', height: '30px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Estilo dos Botões</label>
                  <select
                    value={configButtonStyle}
                    onChange={e => { setConfigButtonStyle(e.target.value as any); handleConfigSave(); }}
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)', padding: '8px' }}
                  >
                    <option value="rect">Retangulares (Clássico)</option>
                    <option value="rounded">Bordas Suaves (Padrão)</option>
                    <option value="pill">Pílula (Arredondado total)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Prévia Shopify-like Iframe (Direita) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              borderRadius: 'var(--border-radius-theme)',
              padding: '24px',
              height: '80vh',
              position: 'relative'
            }} className="justify-center">
              
              <div style={{ position: 'absolute', top: '12px', left: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-admin-text-muted)' }}>
                <Smartphone size={14} /> Prévia em Tempo Real (Simulador Mobile)
              </div>

              {/* Smartphone Frame Wrapper */}
              <div style={{
                width: '320px',
                height: '560px',
                border: '12px solid #222222',
                borderRadius: '36px',
                backgroundColor: '#ffffff',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <iframe
                  src="/"
                  title="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#ffffff'
                  }}
                  id="preview-iframe"
                  key={JSON.stringify(config)} // Força recarregamento do iframe ao salvar configs
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: CONFIGURAÇÕES GERAIS */}
        {activeTab === 'settings' && (
          <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Dados do Negócio</h3>
              <form onSubmit={handleConfigSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Nome da Floricultura</label>
                  <input type="text" value={configName} onChange={e => setConfigName(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>WhatsApp</label>
                  <input type="text" value={configPhone} onChange={e => setConfigPhone(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Endereço Completo</label>
                  <input type="text" value={configAddress} onChange={e => setConfigAddress(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Taxa de Entrega (R$)</label>
                  <input type="number" value={configDeliveryFee} onChange={e => setConfigDeliveryFee(Number(e.target.value))} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Horário de Funcionamento</label>
                  <input type="text" value={configWorkingHours} onChange={e => setConfigWorkingHours(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                </div>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Salvar Dados</button>
              </form>
            </div>

            {/* Gerenciador de Perfis e Permissões (Visível para Dono e Gerente) */}
            {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
              <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Perfis & Permissões Granulares</h3>
                <p style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', marginBottom: '16px' }}>
                  {currentUser?.role === 'owner' 
                    ? 'Configure quais módulos e ações cada perfil administrativo possui acesso no sistema.' 
                    : 'Consulte os módulos autorizados para cada perfil administrativo (Apenas Leitura).'}
                </p>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Selecionar Perfil para Editar</label>
                  <select
                    value={selectedRoleForPerms}
                    onChange={e => setSelectedRoleForPerms(e.target.value as Role)}
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  >
                    <option value="manager">Gerente</option>
                    <option value="staff">Funcionário</option>
                    <option value="stock">Estoquista</option>
                    <option value="support">Atendimento</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                  {[
                    { key: 'viewDashboard', label: 'Ver Dashboard e Analytics' },
                    { key: 'manageProducts', label: 'Gerenciar Produtos (CRUD)' },
                    { key: 'manageCategories', label: 'Gerenciar Categorias (CRUD)' },
                    { key: 'manageOrders', label: 'Atualizar Pedidos' },
                    { key: 'manageChat', label: 'Atender Mensagens de Clientes' },
                    { key: 'manageEditor', label: 'Modificar Temas e Editor Visual' },
                    { key: 'useAiTools', label: 'Usar Ferramentas de IA' }
                  ].map(perm => {
                    const rolePerms = config.rolePermissions?.[selectedRoleForPerms] || {
                      viewDashboard: true, manageProducts: true, manageCategories: true, manageOrders: true, manageChat: true, manageEditor: true, useAiTools: true
                    };
                    const isChecked = !!rolePerms[perm.key as keyof RolePermissions];
                    return (
                      <label
                        key={perm.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px',
                          cursor: currentUser?.role === 'owner' ? 'pointer' : 'not-allowed',
                          opacity: currentUser?.role === 'owner' ? 1 : 0.7
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={currentUser?.role !== 'owner'}
                          onChange={() => handlePermissionToggle(selectedRoleForPerms, perm.key as keyof RolePermissions)}
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gerenciador de Usuários (Apenas Dono) */}
            {currentUser?.role === 'owner' && (
              <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }} className="justify-between">
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Usuários do Painel</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="btn btn-sm btn-primary"
                    style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                  >
                    <UserPlus size={12} /> Novo
                  </button>
                </div>

                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {users.map(u => (
                    <div
                      key={u.username}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--color-admin-input)',
                        border: '1px solid var(--color-admin-border)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}
                      className="justify-between"
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700 }}>{u.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-admin-text-muted)' }}>
                          @{u.username} • <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{getRoleLabel(u.role)}</span>
                        </span>
                      </div>
                      {u.username !== 'dono' && u.username !== currentUser.username && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Excluir o usuário @${u.username}?`)) {
                              deleteUser(u.username);
                            }
                          }}
                          style={{ color: 'var(--color-danger)', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', borderRadius: 'var(--border-radius-theme)', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-danger)' }}>Ações do Desenvolvedor</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-admin-text-muted)', marginBottom: '16px' }}>
                Utilize as ferramentas abaixo para reinstalar as configurações de teste e redefinir o banco local.
              </p>
              <button
                className="btn btn-danger btn-full"
                onClick={() => {
                  if (confirm('Atenção: Isso redefinirá todas as informações, produtos e estatísticas do catálogo. Prosseguir?')) {
                    resetDatabase();
                    window.location.reload();
                  }
                }}
              >
                Limpar & Restaurar Banco Mock
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL CADASTRAR / EDITAR PRODUTO */}
      {isProductModalOpen && (
        <div className="modal-overlay animate-fade" onClick={() => setIsProductModalOpen(false)}>
          <div
            className="modal-content animate-scale"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              backgroundColor: 'var(--color-admin-card)',
              border: '1px solid var(--color-admin-border)',
              color: 'var(--color-admin-text)'
            }}
          >
            <div className="modal-header" style={{ borderColor: 'var(--color-admin-border)' }}>
              <h2 className="text-base font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className="modal-close" onClick={() => setIsProductModalOpen(false)} style={{ backgroundColor: 'var(--color-admin-input)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ color: 'var(--color-admin-text)', marginBottom: 0 }}>Nome*</label>
                        {perms.useAiTools && (
                          <button
                            type="button"
                            onClick={handleSEOOptimize}
                            disabled={aiLoading.seo}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <Sparkles size={12} /> {aiLoading.seo ? 'Otimizando...' : 'SEO IA'}
                          </button>
                        )}
                      </div>
                      <input type="text" required value={prodName} onChange={e => setProdName(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                    </div>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ color: 'var(--color-admin-text)', marginBottom: 0 }}>Categoria</label>
                        {perms.useAiTools && (
                          <button
                            type="button"
                            onClick={handleCategorySuggest}
                            disabled={aiLoading.category}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <Sparkles size={12} /> {aiLoading.category ? '...' : 'Sugerir'}
                          </button>
                        )}
                      </div>
                      <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Preço (R$)*</label>
                      <input type="number" step="0.01" value={prodPrice === null ? '' : prodPrice} onChange={e => setProdPrice(e.target.value === '' ? null : Number(e.target.value))} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Preço Promo</label>
                      <input type="number" step="0.01" value={prodPromoPrice === null ? '' : prodPromoPrice} onChange={e => setProdPromoPrice(e.target.value === '' ? null : Number(e.target.value))} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Estoque*</label>
                      <input type="number" required value={prodStock} onChange={e => setProdStock(Number(e.target.value))} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ color: 'var(--color-admin-text)', marginBottom: 0 }}>Descrição*</label>
                      {perms.useAiTools && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <select
                            value={aiTone}
                            onChange={e => setAiTone(e.target.value)}
                            style={{ fontSize: '11px', padding: '2px 4px', backgroundColor: 'var(--color-admin-input)', color: 'var(--color-admin-text)', border: '1px solid var(--color-admin-border)', borderRadius: '4px' }}
                          >
                            <option value="commercial">Comercial</option>
                            <option value="romantic">Romântico</option>
                            <option value="elegant">Elegante</option>
                            <option value="minimal">Minimalista</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleDescriptionGenerate}
                            disabled={aiLoading.desc}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <Sparkles size={12} /> {aiLoading.desc ? 'Gerando...' : 'Gerar Descrição IA'}
                          </button>
                        </div>
                      )}
                    </div>
                    <textarea required value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="form-control" rows={3} style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={prodFeatured} onChange={e => setProdFeatured(e.target.checked)} />
                      Destaque
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={prodBestSeller} onChange={e => setProdBestSeller(e.target.checked)} />
                      Mais Vendido
                    </label>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ color: 'var(--color-admin-text)', marginBottom: 0 }}>Adicionar Foto (Upload)</label>
                      {perms.useAiTools && prodImages.length > 0 && (
                        <button
                          type="button"
                          onClick={handleRemoveBG}
                          disabled={aiLoading.removeBg}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          <Sparkles size={12} /> {aiLoading.removeBg ? 'Removendo...' : 'Remover Fundo (IA)'}
                        </button>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)', padding: '8px' }} />
                    {prodImages.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        {prodImages.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden' }}>
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => setProdImages(prev => prev.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', padding: 0 }}>X</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderColor: 'var(--color-admin-border)' }}>
                <button type="button" className="btn btn-outline" style={{ color: 'var(--color-admin-text)' }} onClick={() => setIsProductModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CAMPANHA DE BANNER IA */}
      {showCampaignModal && (
        <div className="modal-overlay animate-fade" onClick={() => setShowCampaignModal(false)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', color: 'var(--color-admin-text)' }}>
            <div className="modal-header" style={{ borderColor: 'var(--color-admin-border)' }}>
              <h2 className="text-base font-bold">Criar Banner com IA</h2>
              <button className="modal-close" onClick={() => setShowCampaignModal(false)} style={{ backgroundColor: 'var(--color-admin-input)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Tema / Campanha Comercial</label>
                <input
                  type="text"
                  placeholder="Ex: Dia dos Namorados, Ofertas de Inverno..."
                  value={aiCampaignName}
                  onChange={e => setAiCampaignName(e.target.value)}
                  className="form-control"
                  style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ borderColor: 'var(--color-admin-border)' }}>
              <button className="btn btn-outline" onClick={() => setShowCampaignModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGenerateBanner} disabled={aiLoading.banner || !aiCampaignName.trim()}>
                <Sparkles size={14} /> {aiLoading.banner ? 'Gerando...' : 'Gerar Arte'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR NOVO USUÁRIO */}
      {showAddUserModal && (
        <div className="modal-overlay animate-fade" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', color: 'var(--color-admin-text)' }}>
            <div className="modal-header" style={{ borderColor: 'var(--color-admin-border)' }}>
              <h2 className="text-base font-bold">Novo Usuário</h2>
              <button className="modal-close" onClick={() => setShowAddUserModal(false)} style={{ backgroundColor: 'var(--color-admin-input)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Nome Completo</label>
                  <input type="text" required value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Nome de Usuário (Login)</label>
                  <input type="text" required value={newUsername} onChange={e => setNewUsername(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Senha</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-control" style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Função / Perfil</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as Role)}
                    className="form-control"
                    style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)' }}
                  >
                    <option value="manager">Gerente</option>
                    <option value="staff">Funcionário</option>
                    <option value="stock">Estoquista</option>
                    <option value="support">Atendimento</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ borderColor: 'var(--color-admin-border)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddUserModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GERADOR INSTAGRAM IA */}
      {instagramModalOpen && (
        <div className="modal-overlay animate-fade" onClick={() => setInstagramModalOpen(false)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', backgroundColor: 'var(--color-admin-card)', border: '1px solid var(--color-admin-border)', color: 'var(--color-admin-text)' }}>
            <div className="modal-header" style={{ borderColor: 'var(--color-admin-border)' }}>
              <h2 className="text-base font-bold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} style={{ color: '#e1306c' }} /> Gerador de Post do Instagram (IA)
              </h2>
              <button className="modal-close" onClick={() => setInstagramModalOpen(false)} style={{ backgroundColor: 'var(--color-admin-input)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {aiLoading.instagram ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '13px', color: 'var(--color-admin-text-muted)', marginTop: '10px' }}>
                    Criando post com IA...
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', backgroundColor: 'var(--color-admin-input)', padding: '12px', borderRadius: '6px' }}>
                    {instagramProduct?.images[0] && (
                      <img src={instagramProduct.images[0]} alt="" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700 }}>{instagramProduct?.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--color-admin-text-muted)', marginTop: '2px' }}>
                        Post gerado com IA baseado nos dados do produto.
                      </p>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Legenda Sugerida</label>
                    <textarea
                      value={instagramCaption}
                      onChange={e => setInstagramCaption(e.target.value)}
                      className="form-control"
                      rows={8}
                      style={{ backgroundColor: 'var(--color-admin-input)', borderColor: 'var(--color-admin-border)', color: 'var(--color-admin-text)', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {instagramHashtags.map(t => (
                      <span key={t} style={{ fontSize: '10px', backgroundColor: 'rgba(225,48,108,0.1)', color: '#e1306c', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ borderColor: 'var(--color-admin-border)' }}>
              <button className="btn btn-outline" onClick={() => setInstagramModalOpen(false)}>Fechar</button>
              <button className="btn btn-primary" onClick={copyToClipboard} disabled={aiLoading.instagram}>
                {isCopied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar Legenda</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
