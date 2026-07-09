import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Category, BusinessConfig, OrderItem, Order } from '../types';
import { dbService } from '../services/db';

interface CatalogContextType {
  products: Product[];
  categories: Category[];
  config: BusinessConfig;
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cart: OrderItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  checkoutStep: number;
  setCheckoutStep: (step: number) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  sendOrderToWhatsApp: (customerName: string, customerPhone: string, deliveryType: 'delivery' | 'pickup', addressData?: any) => void;
  refreshCatalog: () => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

// Função auxiliar para aplicar as cores do tema às variáveis CSS globais
export const applyTheme = (config: BusinessConfig) => {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', config.primaryColor);
  root.style.setProperty('--color-secondary', config.secondaryColor);
  
  // Bordas arredondadas
  let radius = '8px';
  if (config.borderRadius === 'none') radius = '0px';
  if (config.borderRadius === 'sm') radius = '4px';
  if (config.borderRadius === 'md') radius = '8px';
  if (config.borderRadius === 'lg') radius = '16px';
  root.style.setProperty('--border-radius-theme', radius);
};

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializa o banco de dados
  useEffect(() => {
    dbService.init();
    dbService.incrementCatalogViews();
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<BusinessConfig>(dbService.getConfig());
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Carrinho
  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('floricultura_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sincronizar carrinho com LocalStorage
  useEffect(() => {
    localStorage.setItem('floricultura_cart', JSON.stringify(cart));
  }, [cart]);

  // Carregar dados e aplicar tema ao inicializar ou atualizar
  const refreshCatalog = () => {
    const activeProducts = dbService.getProducts(false);
    const activeCategories = dbService.getCategories(false);
    const businessConfig = dbService.getConfig();

    setProducts(activeProducts);
    setCategories(activeCategories);
    setConfig(businessConfig);
    applyTheme(businessConfig);
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  // Verificar se há produto no link (compartilhamento hash/query) ao montar
  useEffect(() => {
    const handleHashChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const productId = searchParams.get('p');
      if (productId) {
        const prod = dbService.getProductById(productId);
        if (prod && prod.active) {
          setSelectedProduct(prod);
          // Incrementa visualização
          dbService.incrementProductViews(prod.id);
        }
      }
    };

    handleHashChange(); // Executa ao montar
    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, []);

  // Adicionar ao Carrinho
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock === 0) return; // Fora de estoque

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      const price = product.promoPrice !== null ? product.promoPrice : product.price;

      if (existing) {
        // Limita a quantidade ao estoque disponível se especificado
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prev, {
          productId: product.id,
          name: product.name,
          quantity: Math.min(product.stock, quantity),
          price: price,
          image: product.images[0] || ''
        }];
      }
    });
  };

  // Remover do Carrinho
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Atualizar Quantidade no Carrinho
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = dbService.getProductById(productId);
    const maxStock = product ? product.stock : 99;

    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity: Math.min(maxStock, quantity) } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCheckoutStep(1);
  };

  // Contadores
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  // Finalizar Pedido via WhatsApp
  const sendOrderToWhatsApp = (
    customerName: string,
    customerPhone: string,
    deliveryType: 'delivery' | 'pickup',
    addressData?: any
  ) => {
    const isDelivery = deliveryType === 'delivery';
    const totalOrder = cartTotal + (isDelivery ? config.deliveryFee : 0);
    const orderId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;

    // Criar objeto do pedido
    const newOrder: Order = {
      id: orderId,
      customerName,
      customerPhone,
      deliveryType,
      items: cart,
      total: totalOrder,
      status: 'pending',
      date: new Date().toISOString()
    };

    if (isDelivery && addressData) {
      newOrder.address = addressData;
    }

    // Salvar no "banco"
    dbService.createOrder(newOrder);

    // Formatar mensagem do WhatsApp
    let text = `🌸 *NOVO PEDIDO - ${config.name}* 🌸\n`;
    text += `*Pedido:* #${orderId}\n`;
    text += `------------------------------------\n\n`;
    text += `*Cliente:* ${customerName}\n`;
    text += `*Telefone:* ${customerPhone}\n`;
    text += `*Tipo:* ${isDelivery ? '🚗 Entrega (Delivery)' : '🏪 Retirada na Loja'}\n\n`;

    if (isDelivery && addressData) {
      text += `*Endereço de Entrega:*\n`;
      text += `${addressData.street}, ${addressData.number}\n`;
      text += `${addressData.neighborhood} - ${addressData.city}\n`;
      if (addressData.complement) text += `Complemento: ${addressData.complement}\n`;
      text += `\n`;
    }

    text += `------------------------------------\n`;
    text += `*ITENS DO PEDIDO:*\n`;
    
    cart.forEach(item => {
      const priceText = item.price ? `R$ ${item.price.toFixed(2)}` : 'Sob Consulta';
      text += `• ${item.quantity}x ${item.name} - ${priceText}\n`;
    });

    text += `------------------------------------\n`;
    if (isDelivery) {
      text += `*Produtos:* R$ ${cartTotal.toFixed(2)}\n`;
      text += `*Taxa de Entrega:* R$ ${config.deliveryFee.toFixed(2)}\n`;
    }
    text += `*TOTAL:* R$ ${totalOrder.toFixed(2)}\n\n`;
    
    text += `Fiquei muito feliz com a escolha! Aguardo sua confirmação. 😊`;

    // Codificar URL para o WhatsApp
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.phone}&text=${encodedText}`;

    // Limpar carrinho e redirecionar
    clearCart();
    window.open(whatsappUrl, '_blank');
  };

  return (
    <CatalogContext.Provider value={{
      products,
      categories,
      config,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartCount,
      cartTotal,
      checkoutStep,
      setCheckoutStep,
      selectedProduct,
      setSelectedProduct,
      sendOrderToWhatsApp,
      refreshCatalog
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
