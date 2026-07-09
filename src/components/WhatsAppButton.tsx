import React, { useState, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { config } = useCatalog();
  const [showTooltip, setShowTooltip] = useState(true);

  // Oculta o tooltip após 8 segundos automaticamente para não poluir
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Olá! Visitei o catálogo virtual da ${config.name} e gostaria de tirar algumas dúvidas.`);
    window.open(`https://api.whatsapp.com/send?phone=${config.phone}&text=${message}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 99
    }}>
      {showTooltip && (
        <div style={{
          backgroundColor: '#ffffff',
          color: '#2c3e2c',
          padding: '10px 16px',
          borderRadius: '16px 16px 2px 16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid var(--color-border)',
          whiteSpace: 'nowrap',
          animation: 'slideUp 0.3s ease-out forwards',
          pointerEvents: 'none'
        }}>
          💬 Dúvidas? Fale conosco!
        </div>
      )}
      <button
        onClick={handleWhatsAppClick}
        style={{
          backgroundColor: '#25d366',
          color: '#ffffff',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
          transition: 'var(--transition-normal)',
          animation: 'pulseGlow 2s infinite'
        }}
        aria-label="Falar no WhatsApp"
        className="hover-scale"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
};
