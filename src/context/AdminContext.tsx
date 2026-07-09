import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Category, BusinessConfig, Order, DashboardStats } from '../types';
import { dbService } from '../services/db';

interface AdminContextType {
  isLoggedIn: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  products: Product[];
  categories: Category[];
  orders: Order[];
  config: BusinessConfig;
  stats: DashboardStats;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  saveConfig: (config: BusinessConfig) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  resetDatabase: () => void;
  lowStockAlerts: Product[];
  refreshAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode; onRefreshCatalog: () => void }> = ({ children, onRefreshCatalog }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('floricultura_admin_session') === 'true';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<BusinessConfig>(dbService.getConfig());
  const [stats, setStats] = useState<DashboardStats>(dbService.getDashboardStats());
  const [lowStockAlerts, setLowStockAlerts] = useState<Product[]>([]);

  const refreshAdmin = () => {
    const allProducts = dbService.getProducts(true);
    const allCategories = dbService.getCategories(true);
    const allOrders = dbService.getOrders();
    const currentConfig = dbService.getConfig();
    const currentStats = dbService.getDashboardStats();

    setProducts(allProducts);
    setCategories(allCategories);
    setOrders(allOrders);
    setConfig(currentConfig);
    setStats(currentStats);

    // Alerta de estoque baixo (< 3)
    const lowStock = allProducts.filter(p => p.active && p.stock <= 3);
    setLowStockAlerts(lowStock);

    // Notifica o catálogo público sobre as mudanças
    onRefreshCatalog();
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshAdmin();
    }
  }, [isLoggedIn]);

  const login = (password: string): boolean => {
    // Senha padrão simples: admin
    if (password === 'admin') {
      localStorage.setItem('floricultura_admin_session', 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('floricultura_admin_session');
    setIsLoggedIn(false);
  };

  const handleSaveProduct = (product: Product) => {
    dbService.saveProduct(product);
    refreshAdmin();
  };

  const handleDeleteProduct = (id: string) => {
    dbService.deleteProduct(id);
    refreshAdmin();
  };

  const handleDuplicateProduct = (id: string) => {
    const original = dbService.getProductById(id);
    if (!original) return;

    const clone: Product = {
      ...original,
      id: `prod-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      views: 0,
    };

    dbService.saveProduct(clone);
    refreshAdmin();
  };

  const handleSaveCategory = (category: Category) => {
    dbService.saveCategory(category);
    refreshAdmin();
  };

  const handleDeleteCategory = (id: string) => {
    dbService.deleteCategory(id);
    refreshAdmin();
  };

  const handleSaveConfig = (newConfig: BusinessConfig) => {
    dbService.saveConfig(newConfig);
    refreshAdmin();
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    dbService.updateOrderStatus(orderId, status);
    refreshAdmin();
  };

  const resetDatabase = () => {
    dbService.reset();
    refreshAdmin();
  };

  return (
    <AdminContext.Provider value={{
      isLoggedIn,
      login,
      logout,
      products,
      categories,
      orders,
      config,
      stats,
      saveProduct: handleSaveProduct,
      deleteProduct: handleDeleteProduct,
      duplicateProduct: handleDuplicateProduct,
      saveCategory: handleSaveCategory,
      deleteCategory: handleDeleteCategory,
      saveConfig: handleSaveConfig,
      updateOrderStatus: handleUpdateOrderStatus,
      resetDatabase,
      lowStockAlerts,
      refreshAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
