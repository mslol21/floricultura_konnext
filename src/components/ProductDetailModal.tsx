import React, { useState, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { X, ShoppingCart, MessageSquare, Share2, Plus, Minus, Check } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, products, config } = useCatalog();
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setQuantity(1);
    setActiveImageIndex(0);
    setCopied(false);
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const isPromo = product.promoPrice !== null;
  const isOutOfStock = product.stock === 0;
  const isInquiry = product.price === null || product.price === 0;


  // Filtrar produtos relacionados (mesma categoria, excluindo o atual)
  const relatedProducts = products
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  const handleShare = () => {
    // URL de compartilhamento direta
    const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?p=${product.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: shareUrl,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    // Limpa a query string ao fechar o modal
    const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    setSelectedProduct(null);
  };

  return (
    <div className="modal-overlay animate-fade" onClick={handleClose}>
      <div
        className="modal-content animate-scale"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', width: '90%' }}
      >
        {/* Header com botão fechar integrado */}
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          zIndex: 20
        }}>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}>
            {/* Galeria de Fotos */}
            <div style={{
              backgroundColor: '#f1f3f1',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}>
              <div style={{ width: '100%', paddingTop: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'var(--border-radius-theme)' }}>
                <img
                  src={product.images[activeImageIndex] || 'https://via.placeholder.com/600x600?text=Sem+Foto'}
                  alt={product.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Thumbnails se houver mais de uma imagem */}
              {product.images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', width: '100%' }}>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '4px',
                        border: idx === activeImageIndex ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ficha Técnica */}
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                <span className="badge badge-primary">Ficha do Produto</span>
                <button
                  onClick={handleShare}
                  className="btn btn-sm btn-outline"
                  style={{
                    borderRadius: '50%',
                    padding: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Compartilhar"
                >
                  {copied ? <Check size={16} className="text-success" /> : <Share2 size={16} />}
                </button>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '12px', lineHeight: 1.2 }}>
                {product.name}
              </h2>

              {/* Preços */}
              <div style={{ marginBottom: '20px' }}>
                {isInquiry ? (
                  <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary)' }}>Sob Consulta</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    {isPromo ? (
                      <>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-accent)' }}>
                          R$ {product.promoPrice?.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '15px', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                          R$ {product.price?.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>
                        R$ {product.price?.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status do Estoque */}
              <div style={{ marginBottom: '20px' }}>
                {isOutOfStock ? (
                  <div style={{ color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600 }}>
                    ⚠️ Produto Indisponível no Estoque
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-success)', fontSize: '13px', fontWeight: 600 }}>
                    ✓ Em Estoque ({product.stock} unidades disponíveis)
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div style={{ flex: 1, marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: '8px' }}>
                  Descrição
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                  {product.description}
                </p>
              </div>

              {/* Ações de Compra */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: 'auto' }}>
                  {!isInquiry && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-theme)',
                      padding: '4px'
                    }}>
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        style={{ padding: '8px', color: 'var(--color-text-muted)' }}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{ width: '32px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        style={{ padding: '8px', color: 'var(--color-text-muted)' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => {
                      if (isInquiry) {
                        const text = encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para o produto: *${product.name}*.`);
                        window.open(`https://api.whatsapp.com/send?phone=${config.phone}&text=${text}`, '_blank');
                      } else {
                        addToCart(product, quantity);
                        handleClose();
                      }
                    }}
                    style={{
                      backgroundColor: isInquiry ? 'var(--color-success)' : 'var(--color-primary)'
                    }}
                  >
                    {isInquiry ? (
                      <>
                        <MessageSquare size={18} /> Solicitar Orçamento
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} /> Adicionar ao Carrinho
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Produtos Relacionados */}
          {relatedProducts.length > 0 && (
            <div style={{
              padding: '30px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: '#fbfcfb'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px', color: 'var(--color-primary)' }}>
                Quem comprou este produto também se interessou por:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}>
                {relatedProducts.map(p => {
                  const price = p.promoPrice !== null ? p.promoPrice : p.price;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        transition: 'var(--transition-fast)'
                      }}
                      className="related-item"
                    >
                      <img src={p.images[0]} alt={p.name} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </h4>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {price === null ? 'Sob Consulta' : `R$ ${price.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .related-item:hover {
          border-color: var(--color-primary);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
