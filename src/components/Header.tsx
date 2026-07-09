import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { Flower, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  isAdminView: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenAdmin, isAdminView }) => {
  const { config, cartCount } = useCatalog();

  // Função para verificar se a loja está aberta
  const isStoreOpen = (): boolean => {
    const now = new Date();
    const day = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const hour = now.getHours();

    if (day === 0) return false; // Domingo fechado
    if (day === 6) return hour >= 8 && hour < 14; // Sábado 08:00 às 14:00
    return hour >= 8 && hour < 19; // Segunda a Sexta 08:00 às 19:00
  };

  const open = isStoreOpen();

  return (
    <header style={{
      backgroundColor: isAdminView ? 'var(--color-admin-card)' : 'rgba(255, 255, 255, 0.88)',
      backdropFilter: isAdminView ? 'none' : 'blur(12px)',
      borderBottom: `1px solid ${isAdminView ? 'var(--color-admin-border)' : 'rgba(226, 232, 226, 0.6)'}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 0',
      boxShadow: isAdminView ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.02)',
      transition: 'var(--transition-normal)'
    }}>
      <div className="container flex items-center justify-between">
        {/* Logo / Nome */}
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          <div style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(30, 58, 30, 0.15)',
            border: isAdminView ? 'none' : '2px solid var(--color-secondary)'
          }} className="justify-center">
            {config.logo ? (
              <img src={config.logo} alt={config.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <Flower size={22} />
            )}
          </div>
          <div>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: isAdminView ? 'var(--color-admin-text)' : 'var(--color-primary)',
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {config.name}
              {isAdminView && <span className="badge badge-warning" style={{ fontSize: '9px', padding: '2px 6px' }}>Painel</span>}
            </h1>
            {!isAdminView && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: open ? 'rgba(46, 196, 182, 0.1)' : 'rgba(230, 57, 70, 0.1)',
                  color: open ? 'var(--color-success)' : 'var(--color-danger)'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'currentColor',
                    display: 'inline-block'
                  }}></span>
                  {open ? 'Loja Aberta' : 'Loja Fechada'}
                </span>
                <span className="text-xs text-muted" style={{ fontWeight: 500, marginLeft: '4px' }}>
                  • {config.workingHours}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4">
          {isAdminView ? (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => window.location.href = '/'}
              style={{
                color: 'var(--color-admin-text)',
                borderColor: 'var(--color-admin-border)',
                fontSize: '12px'
              }}
            >
              Ver Catálogo
            </button>
          ) : (
            <>
              <button
                className="btn btn-sm btn-outline"
                onClick={onOpenAdmin}
                style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Painel
              </button>

              <button
                onClick={onOpenCart}
                style={{
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-bg-input)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                className="hover-scale"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--color-accent)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--color-bg-card)'
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
