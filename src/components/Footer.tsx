import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { MapPin, Clock, Phone, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  isAdminView: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, isAdminView }) => {
  const { config } = useCatalog();

  return (
    <footer style={{
      backgroundColor: isAdminView ? 'var(--color-admin-bg)' : 'var(--color-primary)',
      color: isAdminView ? 'var(--color-admin-text-muted)' : '#ffffff',
      padding: '40px 0 20px 0',
      marginTop: 'auto',
      borderTop: isAdminView ? '1px solid var(--color-admin-border)' : 'none',
      transition: 'var(--transition-normal)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Coluna Sobre */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '15px',
              color: isAdminView ? 'var(--color-admin-text)' : '#ffffff'
            }}>
              {config.name}
            </h3>
            <p style={{
              fontSize: '14px',
              opacity: 0.8,
              lineHeight: 1.5,
              maxWidth: '300px'
            }}>
              Flores frescas e selecionadas com amor para alegrar seus melhores momentos. Peça pelo site e receba via WhatsApp de forma simples e rápida!
            </p>
          </div>

          {/* Coluna Contatos */}
          <div>
            <h4 style={{
              fontSize: '15px',
              fontWeight: 600,
              marginBottom: '15px',
              color: isAdminView ? 'var(--color-admin-text)' : '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Informações
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', opacity: 0.8 }} />
                <span style={{ opacity: 0.8 }}>{config.address}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} style={{ opacity: 0.8 }} />
                <span style={{ opacity: 0.8 }}>WhatsApp: +{config.phone}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} style={{ opacity: 0.8 }} />
                <span style={{ opacity: 0.8 }}>{config.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Coluna Atalhos */}
          <div>
            <h4 style={{
              fontSize: '15px',
              fontWeight: 600,
              marginBottom: '15px',
              color: isAdminView ? 'var(--color-admin-text)' : '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li>
                <a href="#" style={{ opacity: 0.8 }} className="hover-underline">Voltar ao topo</a>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  style={{
                    opacity: 0.8,
                    fontSize: '14px',
                    color: 'inherit',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                  className="hover-underline"
                >
                  {isAdminView ? 'Painel Administrativo' : 'Acesso Administrador'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <hr style={{
          border: 'none',
          borderTop: `1px solid ${isAdminView ? 'var(--color-admin-border)' : 'rgba(255, 255, 255, 0.15)'}`,
          margin: '20px 0'
        }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          fontSize: '13px',
          opacity: 0.7
        }}>
          <p>© {new Date().getFullYear()} {config.name}. Todos os direitos reservados.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Feito com <Heart size={12} fill="currentColor" style={{ color: 'var(--color-accent)' }} /> para floriculturas de alto nível.
          </p>
        </div>
      </div>
    </footer>
  );
};
