import type { Product, Category, Order, BusinessConfig, DashboardStats, AnalyticsEvent } from '../types';

// Chaves do LocalStorage
const KEYS = {
  PRODUCTS: 'floricultura_products',
  CATEGORIES: 'floricultura_categories',
  ORDERS: 'floricultura_orders',
  CONFIG: 'floricultura_config',
  EVENTS: 'floricultura_events',
};

// Sementes de Categorias
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Buquês Premium', slug: 'buques-premium', active: true },
  { id: 'cat-2', name: 'Orquídeas e Plantas', slug: 'orquideas-plantas', active: true },
  { id: 'cat-3', name: 'Cestas Especiais', slug: 'cestas-especiais', active: true },
  { id: 'cat-4', name: 'Arranjos e Vasos', slug: 'arranjos-vasos', active: true },
  { id: 'cat-5', name: 'Suculentas e Cactos', slug: 'suculentas-cactos', active: true },
];

// Imagens padrão do Unsplash de Flores de alta qualidade
const IMAGE_MOCKS = {
  buque_rosas: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
  orquidea: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80',
  lirios: 'https://images.unsplash.com/photo-1508784932223-3a37c47e8ee9?auto=format&fit=crop&w=800&q=80',
  suculenta: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
  cesta: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
  girassol: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=800&q=80',
  silvestre: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
  anturio: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&w=800&q=80',
};

// Sementes de Produtos
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Buquê de Rosas Vermelhas Luxo',
    description: 'Um clássico e apaixonante buquê com 12 rosas vermelhas selecionadas, folhagens nobres de eucalipto e embalagem refinada em papel kraft e laço de cetim.',
    price: 189.90,
    promoPrice: 159.90,
    images: [IMAGE_MOCKS.buque_rosas],
    categoryId: 'cat-1',
    featured: true,
    bestSeller: true,
    active: true,
    stock: 15,
    views: 124,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Orquídea Phalaenopsis Branca Premium',
    description: 'Orquídea branca de duas hastes em um luxuoso vaso de cerâmica. Planta de excelente durabilidade, ideal para presentear ou decorar ambientes internos.',
    price: 145.00,
    promoPrice: null,
    images: [IMAGE_MOCKS.orquidea],
    categoryId: 'cat-2',
    featured: true,
    bestSeller: false,
    active: true,
    stock: 8,
    views: 89,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Cesta Café da Manhã Flores & Sabores',
    description: 'Uma cesta completa contendo: 1 vaso de flores da época, sachês de café solúvel, chá, biscoitos artesanais, geleia premium, torradas, frutas e uma caneca elegante.',
    price: 249.90,
    promoPrice: 220.00,
    images: [IMAGE_MOCKS.cesta],
    categoryId: 'cat-3',
    featured: true,
    bestSeller: true,
    active: true,
    stock: 5,
    views: 142,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Vaso de Girassóis Radiantes',
    description: 'Três girassóis vibrantes montados em vaso de vidro com acabamento de juta rústica. Transmite alegria, calor e positividade para qualquer ambiente.',
    price: 89.90,
    promoPrice: null,
    images: [IMAGE_MOCKS.girassol],
    categoryId: 'cat-4',
    featured: false,
    bestSeller: true,
    active: true,
    stock: 10,
    views: 73,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Terrário Suculentas Harmonia',
    description: 'Arranjo com diversas espécies de suculentas e cactos dispostos em um vaso geométrico de vidro. Requer pouquíssima rega e é perfeito para escritórios.',
    price: 75.00,
    promoPrice: 65.00,
    images: [IMAGE_MOCKS.suculenta],
    categoryId: 'cat-5',
    featured: false,
    bestSeller: false,
    active: true,
    stock: 20,
    views: 52,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Buquê Silvestre de Flores do Campo',
    description: 'Um buquê descontraído com flores coloridas do campo, astromélias e margaridas. Embalado com tela importada e barbante de rami.',
    price: 120.00,
    promoPrice: null,
    images: [IMAGE_MOCKS.silvestre],
    categoryId: 'cat-1',
    featured: false,
    bestSeller: false,
    active: true,
    stock: 12,
    views: 45,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Arranjo de Antúrio Vermelho Exótico',
    description: 'Clássica planta de antúrio vermelho plantada em vaso decorativo texturizado. Uma planta tropical majestosa que purifica o ar.',
    price: null, // Sob Consulta
    promoPrice: null,
    images: [IMAGE_MOCKS.anturio],
    categoryId: 'cat-2',
    featured: false,
    bestSeller: false,
    active: true,
    stock: 6,
    views: 31,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Vaso de Lírios Brancos Perfumados',
    description: 'Lindo e imponente arranjo de lírios brancos em vaso de vidro. Suas flores exalam um perfume agradável e sofisticado.',
    price: 135.00,
    promoPrice: null,
    images: [IMAGE_MOCKS.lirios],
    categoryId: 'cat-4',
    featured: true,
    bestSeller: false,
    active: true,
    stock: 0, // Indisponível
    views: 67,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Sementes de Configurações do Negócio
const DEFAULT_CONFIG: BusinessConfig = {
  name: 'Konnexy Flores',
  phone: '5511999999999', // Substituir por número válido se desejado
  address: 'Av. das Flores, 123 - Bairro Jardim, São Paulo - SP',
  deliveryFee: 15.00,
  workingHours: 'Seg a Sex: 08h às 19h | Sáb: 08h às 14h',
  logo: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=200&q=80',
  primaryColor: '#1e3a1e', // Verde Floresta
  secondaryColor: '#f7a8b8', // Rosa claro complementar
  themePreset: 'garden-modern',
  borderRadius: 'md',
  catalogViews: 352,
  
  // Customização Visual (Shopify-like Builder)
  bannerTitle: 'Sua Floricultura Digital de Confiança',
  bannerSubtitle: 'Escolha o presente perfeito, monte seu carrinho e finalize o pedido diretamente pelo WhatsApp. Sem cadastros burocráticos.',
  bannerImage: '/florist_banner.png',
  bannerBtnText: 'Ver Todos os Produtos',
  buttonStyle: 'rounded',
  backgroundColor: '#f7f9f7',
  textColor: '#2c3e2c',
  sectionsOrder: ['hero', 'categories', 'featured', 'bestsellers', 'catalog']
};

// Sementes de Pedidos para alimentar o Dashboard
const DEFAULT_ORDERS: Order[] = [
  {
    id: 'PED-4821',
    customerName: 'Mariana Silva',
    customerPhone: '11988887777',
    deliveryType: 'delivery',
    address: {
      street: 'Rua das Oliveiras',
      number: '45',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      complement: 'Apto 12'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'Buquê de Rosas Vermelhas Luxo',
        quantity: 1,
        price: 159.90,
        image: IMAGE_MOCKS.buque_rosas
      }
    ],
    total: 174.90, // Item + Taxa
    status: 'completed',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // Ontem
  },
  {
    id: 'PED-4822',
    customerName: 'Carlos Eduardo',
    customerPhone: '11977776666',
    deliveryType: 'pickup',
    items: [
      {
        productId: 'prod-4',
        name: 'Vaso de Girassóis Radiantes',
        quantity: 2,
        price: 89.90,
        image: IMAGE_MOCKS.girassol
      }
    ],
    total: 179.80,
    status: 'pending',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
  }
];

// Sementes de Eventos de Analytics (Últimos 7 dias)
const generateMockEvents = (): AnalyticsEvent[] => {
  const events: AnalyticsEvent[] = [];
  const sources: ('google' | 'instagram' | 'facebook' | 'qrcode' | 'direct')[] = [
    'instagram', 'instagram', 'google', 'google', 'google', 'facebook', 'qrcode', 'direct'
  ];
  
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Gerar acessos e cliques
  for (let i = 0; i < 280; i++) {
    const ageDays = Math.random() * 7;
    const timestamp = new Date(now - ageDays * dayMs);
    const hour = timestamp.getHours();
    
    // Simula tráfego maior nos horários de pico (9-12h e 14-19h)
    const isPeakHour = (hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 19);
    if (!isPeakHour && Math.random() > 0.4) continue;

    const source = sources[Math.floor(Math.random() * sources.length)];
    const eventId = `evt-${Math.floor(10000 + Math.random() * 90000)}`;

    // 1. Acesso
    events.push({
      id: eventId,
      type: 'access',
      timestamp: timestamp.toISOString(),
      source
    });

    // 2. Visualizações de produto aleatórias
    if (Math.random() > 0.4) {
      const prodIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6'];
      const targetId = prodIds[Math.floor(Math.random() * prodIds.length)];
      events.push({
        id: `evt-p-${Math.floor(Math.random() * 10000)}`,
        type: 'product_view',
        timestamp: timestamp.toISOString(),
        source,
        targetId
      });
    }

    // 3. Cliques de conversão WhatsApp
    if (Math.random() > 0.8) {
      const prodIds = ['prod-1', 'prod-3', 'prod-4'];
      const targetId = prodIds[Math.floor(Math.random() * prodIds.length)];
      events.push({
        id: `evt-w-${Math.floor(Math.random() * 10000)}`,
        type: 'click_whatsapp',
        timestamp: timestamp.toISOString(),
        source,
        targetId
      });
    }

    // 4. Categorias acessadas
    if (Math.random() > 0.5) {
      const catIds = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5'];
      const targetId = catIds[Math.floor(Math.random() * catIds.length)];
      events.push({
        id: `evt-c-${Math.floor(Math.random() * 10000)}`,
        type: 'category_view',
        timestamp: timestamp.toISOString(),
        source,
        targetId
      });
    }
  }

  return events;
};

// Helper para ler dados ou inicializar
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const dbService = {
  // Inicialização geral
  init(): void {
    getStorageItem(KEYS.CONFIG, DEFAULT_CONFIG);
    getStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    getStorageItem(KEYS.ORDERS, DEFAULT_ORDERS);
    getStorageItem(KEYS.EVENTS, generateMockEvents());
  },

  // Reset do Banco
  reset(): void {
    localStorage.removeItem(KEYS.CONFIG);
    localStorage.removeItem(KEYS.CATEGORIES);
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.ORDERS);
    localStorage.removeItem(KEYS.EVENTS);
    this.init();
  },

  // --- PRODUTOS ---
  getProducts(includeInactive = false): Product[] {
    const products: Product[] = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    return includeInactive ? products : products.filter(p => p.active);
  },

  getProductById(id: string): Product | undefined {
    const products = this.getProducts(true);
    return products.find(p => p.id === id);
  },

  saveProduct(product: Product): void {
    const products = this.getProducts(true);
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    setStorageItem(KEYS.PRODUCTS, products);
  },

  deleteProduct(id: string): void {
    const products = this.getProducts(true);
    const updated = products.filter(p => p.id !== id);
    setStorageItem(KEYS.PRODUCTS, updated);
  },

  incrementProductViews(id: string): void {
    const products = this.getProducts(true);
    const index = products.findIndex(p => p.id === id);
    if (index >= 0) {
      products[index].views += 1;
      setStorageItem(KEYS.PRODUCTS, products);
    }
  },

  // --- CATEGORIAS ---
  getCategories(includeInactive = false): Category[] {
    const categories: Category[] = getStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return includeInactive ? categories : categories.filter(c => c.active);
  },

  saveCategory(category: Category): void {
    const categories = this.getCategories(true);
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    setStorageItem(KEYS.CATEGORIES, categories);
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories(true);
    const updated = categories.filter(c => c.id !== id);
    // IMPORTANTE: Idealmente deveríamos atualizar os produtos associados a esta categoria.
    setStorageItem(KEYS.CATEGORIES, updated);
  },

  // --- CONFIGURAÇÃO ---
  getConfig(): BusinessConfig {
    return getStorageItem(KEYS.CONFIG, DEFAULT_CONFIG);
  },

  saveConfig(config: BusinessConfig): void {
    setStorageItem(KEYS.CONFIG, config);
  },

  incrementCatalogViews(): void {
    const config = this.getConfig();
    config.catalogViews += 1;
    this.saveConfig(config);
  },

  // --- PEDIDOS ---
  getOrders(): Order[] {
    return getStorageItem(KEYS.ORDERS, DEFAULT_ORDERS);
  },

  createOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order); // Adiciona no início da lista
    setStorageItem(KEYS.ORDERS, orders);

    // Ajusta o estoque dos produtos
    const products = this.getProducts(true);
    order.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.bestSeller = prod.bestSeller || item.quantity >= 3; // Simula lógica bestseller
      }
    });
    setStorageItem(KEYS.PRODUCTS, products);
  },

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      setStorageItem(KEYS.ORDERS, orders);
    }
  },

  // --- ANALYTICS EVENTS ---
  getEvents(): AnalyticsEvent[] {
    return getStorageItem(KEYS.EVENTS, []);
  },

  saveEvents(events: AnalyticsEvent[]): void {
    setStorageItem(KEYS.EVENTS, events);
  },

  logEvent(type: AnalyticsEvent['type'], referrer?: string, targetId?: string): void {
    const events = this.getEvents();
    
    // Identificar origem do acesso
    let source: AnalyticsEvent['source'] = 'direct';
    
    // 1. Checa parâmetro de URL
    const searchParams = new URLSearchParams(window.location.search);
    const refParam = searchParams.get('ref') || searchParams.get('utm_source');
    if (refParam) {
      const ref = refParam.toLowerCase();
      if (ref.includes('qrcode')) source = 'qrcode';
      else if (ref.includes('instagram')) source = 'instagram';
      else if (ref.includes('facebook')) source = 'facebook';
      else if (ref.includes('google')) source = 'google';
    } else if (referrer) {
      // 2. Checa Referrer HTTP
      const ref = referrer.toLowerCase();
      if (ref.includes('google.com')) source = 'google';
      else if (ref.includes('instagram.com') || ref.includes('l.instagram')) source = 'instagram';
      else if (ref.includes('facebook.com') || ref.includes('l.facebook')) source = 'facebook';
    }

    events.push({
      id: `evt-${Math.floor(10000 + Math.random() * 90000)}`,
      type,
      timestamp: new Date().toISOString(),
      source,
      targetId
    });
    
    this.saveEvents(events);
  },

  logHeatmapClick(elementId: string): void {
    const events = this.getEvents();
    events.push({
      id: `evt-click-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'category_view',
      timestamp: new Date().toISOString(),
      source: 'direct',
      targetId: `heatmap:${elementId}`
    });
    this.saveEvents(events);
  },

  // --- DASHBOARD & METRICS ---
  getDashboardStats(): DashboardStats {
    const products = this.getProducts(true);
    const orders = this.getOrders();
    const config = this.getConfig();
    const events = this.getEvents();

    const promoProducts = products.filter(p => p.promoPrice !== null && p.active).length;
    const outOfStockProducts = products.filter(p => p.stock === 0 && p.active).length;

    // Produtos mais visualizados
    const mostViewedProducts = [...products]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Produtos menos visualizados (ativos)
    const leastViewedProducts = [...products]
      .filter(p => p.active)
      .sort((a, b) => a.views - b.views)
      .slice(0, 5);

    // Mais vendidos
    const bestSellers = [...products]
      .filter(p => p.bestSeller)
      .slice(0, 5);

    // Calcular faturamento do mês atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyRevenue = orders
      .filter(o => {
        const orderDate = new Date(o.date);
        return (
          o.status === 'completed' &&
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, o) => sum + o.total, 0);

    // 1. Pedidos hoje & semana
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const ordersTodayCount = orders.filter(o => new Date(o.date) >= startOfToday && o.status !== 'cancelled').length;
    const ordersWeekCount = orders.filter(o => new Date(o.date) >= startOfWeek && o.status !== 'cancelled').length;

    // 2. Cliques WhatsApp & Conversão
    const accessEvents = events.filter(e => e.type === 'access');
    const whatsappClicksEvents = events.filter(e => e.type === 'click_whatsapp');
    
    const whatsappClicksCount = whatsappClicksEvents.length;
    const totalAccesses = accessEvents.length || 1;
    const conversionRate = Number(((whatsappClicksCount / totalAccesses) * 100).toFixed(1));

    // 3. Origens dos Acessos
    const sources = {
      google: 0,
      instagram: 0,
      facebook: 0,
      qrcode: 0,
      direct: 0
    };
    
    accessEvents.forEach(e => {
      if (e.source in sources) {
        sources[e.source] += 1;
      } else {
        sources.direct += 1;
      }
    });

    // 4. Categorias mais acessadas
    const categoryViews: Record<string, number> = {};
    events
      .filter(e => e.type === 'category_view' && e.targetId && !e.targetId.startsWith('heatmap:'))
      .forEach(e => {
        const catId = e.targetId!;
        categoryViews[catId] = (categoryViews[catId] || 0) + 1;
      });

    // 5. Horários de pico
    const hourlyViews: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyViews[h] = 0; // Inicializa
    
    events
      .filter(e => e.type === 'access')
      .forEach(e => {
        const hr = new Date(e.timestamp).getHours();
        hourlyViews[hr] = (hourlyViews[hr] || 0) + 1;
      });

    // 6. Tempo médio na página (simulado)
    const avgTimeOnPage = Math.floor(75 + (Math.sin(totalAccesses) * 35));

    // 7. Mapa de calor de cliques
    const heatmap: Record<string, number> = {
      'whatsapp-floating': 0,
      'cart-button': 0,
      'buy-button': 0,
      'search-input': 0,
      'category-nav': 0,
      'product-detail': 0,
      'checkout-finish': 0
    };

    events
      .filter(e => e.type === 'category_view' && e.targetId && e.targetId.startsWith('heatmap:'))
      .forEach(e => {
        const elem = e.targetId!.replace('heatmap:', '');
        if (elem in heatmap) {
          heatmap[elem] += 1;
        }
      });

    // Adiciona cliques normais correspondentes do log para engajar heatmap real
    heatmap['whatsapp-floating'] += whatsappClicksEvents.filter(e => e.targetId === 'whatsapp-floating').length;
    heatmap['buy-button'] += whatsappClicksEvents.filter(e => e.targetId !== 'whatsapp-floating').length;
    heatmap['product-detail'] += events.filter(e => e.type === 'product_view').length;

    // Seed padrão para heatmap se cliques forem muito baixos
    Object.keys(heatmap).forEach(key => {
      if (heatmap[key] === 0) {
        const defaultSeeds: Record<string, number> = {
          'whatsapp-floating': 32,
          'cart-button': 48,
          'buy-button': 74,
          'search-input': 95,
          'category-nav': 124,
          'product-detail': 167,
          'checkout-finish': 22
        };
        heatmap[key] = defaultSeeds[key] || 10;
      }
    });

    return {
      totalProducts: products.length,
      promoProducts,
      outOfStockProducts,
      mostViewedProducts,
      leastViewedProducts,
      bestSellers,
      recentOrders: orders.slice(0, 5),
      monthlyRevenue,
      catalogViews: config.catalogViews,
      
      ordersTodayCount,
      ordersWeekCount,
      whatsappClicksCount,
      conversionRate,
      sources,
      categoryViews,
      hourlyViews,
      avgTimeOnPage,
      heatmap
    };
  }
};
