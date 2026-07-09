import { useState, useEffect } from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Catalog } from './pages/Catalog';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { CartModal } from './components/CartModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhatsAppButton } from './components/WhatsAppButton';

function MainAppContent() {
  const { selectedProduct } = useCatalog();
  const { isLoggedIn } = useAdmin();
  
  const [cartOpen, setCartOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Router simples para SPA
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    // Também ouve eventos de navegação customizados se disparados
    window.addEventListener('pushstate_event', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate_event', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Rola para o topo ao navegar
    window.scrollTo(0, 0);
  };

  const isAdminPath = currentPath === '/admin';

  // Gerencia o fechamento de modais ao apertar Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isAdminPath) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-admin-bg)' }}>
        <Header
          onOpenCart={() => {}}
          onOpenAdmin={() => navigateTo('/')}
          isAdminView={true}
        />
        
        <main style={{ flex: 1 }}>
          {isLoggedIn ? <AdminDashboard /> : <AdminLogin />}
        </main>

        <Footer
          onOpenAdmin={() => navigateTo('/')}
          isAdminView={true}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onOpenCart={() => setCartOpen(true)}
        onOpenAdmin={() => navigateTo('/admin')}
        isAdminView={false}
      />

      <main style={{ flex: 1 }}>
        <Catalog />
      </main>

      <Footer
        onOpenAdmin={() => navigateTo('/admin')}
        isAdminView={false}
      />

      {/* WhatsApp Flutuante */}
      <WhatsAppButton />

      {/* Modais do Cliente */}
      {cartOpen && (
        <CartModal onClose={() => setCartOpen(false)} />
      )}
      
      {selectedProduct && (
        <ProductDetailModal />
      )}
    </div>
  );
}

function App() {
  return (
    <CatalogProvider>
      <InnerAppWrapper />
    </CatalogProvider>
  );
}

// Wrapper interno para conseguir injetar a função de refresh do Catálogo no provedor do Administrador
function InnerAppWrapper() {
  const { refreshCatalog } = useCatalog();
  
  return (
    <AdminProvider onRefreshCatalog={refreshCatalog}>
      <MainAppContent />
    </AdminProvider>
  );
}

export default App;
