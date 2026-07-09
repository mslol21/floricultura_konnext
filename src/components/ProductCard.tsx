import React from 'react';
import type { Product } from '../types';
import { useCatalog } from '../context/CatalogContext';
import { ShoppingCart, MessageSquare } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct, config } = useCatalog();

  const isPromo = product.promoPrice !== null;
  const isOutOfStock = product.stock === 0;
  const isInquiry = product.price === null || product.price === 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Evita abrir modal se clicar em botões internos de compra
    const target = e.target as HTMLElement;
    if (target.closest('.btn-cart-action')) return;
    
    // Atualizar URL de compartilhamento hash/query de forma amigável
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?p=${product.id}`;
    window.history.pushState({ path: newurl }, '', newurl);
    
    setSelectedProduct(product);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--border-radius-theme)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'var(--transition-normal)',
        position: 'relative'
      }}
      className="product-card hover-card"
    >
      {/* Badges e Imagem */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden' }}>
        <img
          src={product.images[0] || 'https://via.placeholder.com/400x400?text=Sem+Foto'}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          className="product-img"
        />

        {/* Selos Promocionais */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 10 }}>
          {isPromo && !isOutOfStock && (
            <span className="badge badge-danger">PROMOÇÃO</span>
          )}
          {product.bestSeller && !isOutOfStock && (
            <span className="badge badge-secondary" style={{ color: 'var(--color-primary)' }}>Mais Vendido</span>
          )}
          {product.featured && !isOutOfStock && (
            <span className="badge badge-primary">Destaque</span>
          )}
          {isOutOfStock && (
            <span className="badge" style={{ backgroundColor: '#6c757d', color: '#ffffff' }}>Indisponível</span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: '8px',
          lineHeight: '1.4',
          height: '42px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.name}
        </h3>

        {/* Preço */}
        <div style={{ marginTop: 'auto', marginBottom: '16px' }}>
          {isInquiry ? (
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
              Sob Consulta
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              {isPromo ? (
                <>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)' }}>
                    R$ {product.promoPrice?.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                    R$ {product.price?.toFixed(2)}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                  R$ {product.price?.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Botão de Compra Rápida */}
        <button
          className="btn btn-sm btn-primary btn-full btn-cart-action"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (isInquiry) {
              // Redireciona direto para orçamento WhatsApp
              const text = encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para o produto: *${product.name}*.`);
              window.open(`https://api.whatsapp.com/send?phone=${config.phone}&text=${text}`, '_blank');
            } else {
              addToCart(product, 1);
            }
          }}
          style={{
            backgroundColor: isInquiry ? 'var(--color-success)' : 'var(--color-primary)',
            fontSize: '13px',
            padding: '10px'
          }}
        >
          {isInquiry ? (
            <>
              <MessageSquare size={15} /> Orçamento
            </>
          ) : (
            <>
              <ShoppingCart size={15} /> Comprar
            </>
          )}
        </button>
      </div>

      {/* CSS extra embutido em componente para efeitos de hover suaves */}
      <style>{`
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary);
        }
        .product-card:hover .product-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};
