import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { config } = useCatalog();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Olá! Visitei o catálogo virtual da ${config.name} e gostaria de tirar algumas dúvidas.`);
    window.open(`https://api.whatsapp.com/send?phone=${config.phone}&text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#25d366',
        color: '#ffffff',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        zIndex: 99,
        transition: 'var(--transition-normal)',
        animation: 'pulseGlow 2s infinite'
      }}
      aria-label="Falar no WhatsApp"
      className="hover-scale"
    >
      <MessageCircle size={28} />
    </button>
  );
};
