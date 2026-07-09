export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null; // null or 0 means "Sob Consulta" (quote request)
  promoPrice: number | null; // null means no discount
  images: string[]; // Array of image references (base64 or placeholders)
  categoryId: string;
  featured: boolean;
  bestSeller: boolean;
  active: boolean; // Is visible in catalog
  stock: number; // Stock quantity
  views: number; // View counter
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number | null; // Price at purchase
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'delivery' | 'pickup';
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    complement?: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string; // ISO string
}

export interface BusinessConfig {
  name: string;
  phone: string; // WhatsApp number
  address: string;
  deliveryFee: number;
  workingHours: string; // e.g. "Seg a Sex: 08:00 às 18:00, Sáb: 08:00 às 13:00"
  logo: string; // Base64 or standard logo URL
  primaryColor: string;
  secondaryColor: string;
  themePreset: string; // 'forest-green' | 'elegant-rose' | 'modern-lavender' | 'tropical-orchid' | 'custom'
  borderRadius: string; // 'sm' | 'md' | 'lg' | 'none'
  catalogViews: number;
}

export interface DashboardStats {
  totalProducts: number;
  promoProducts: number;
  outOfStockProducts: number;
  mostViewedProducts: Product[];
  bestSellers: Product[];
  recentOrders: Order[];
  monthlyRevenue: number;
  catalogViews: number;
}
