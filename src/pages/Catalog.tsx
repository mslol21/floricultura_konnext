import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from '../components/ProductCard';
import { Search, Sparkles, Flame, X, RefreshCw } from 'lucide-react';

export const Catalog: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useCatalog();

  // Filtragem de produtos
  const getFilteredProducts = () => {
    let list = products;

    // Filtra por Categoria
    if (selectedCategory) {
      list = list.filter(p => p.categoryId === selectedCategory);
    }

    // Filtra por Busca (Nome ou Descrição)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    return list;
  };

  const filteredProducts = getFilteredProducts();

  // Agrupamentos se nenhuma busca e nenhuma categoria estiver ativa
  const showSpecialSections = !selectedCategory && !searchQuery;
  
  const featuredProducts = products.filter(p => p.featured && p.active);
  const bestSellers = products.filter(p => p.bestSeller && p.active);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Banner / Hero Section */}
      <section style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.75) 100%), url('/florist_banner.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: '90px 0 100px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Detalhe de fundo */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-20%',
          width: '80%',
          height: '200%',
          background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 60%)',
          opacity: 0.15,
          pointerEvents: 'none'
        }} />

        <div className="container animate-slide" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <span className="badge badge-secondary" style={{ marginBottom: '12px', fontSize: '11px', color: 'var(--color-primary)' }}>
            Flores Frescas & Práticas
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px', lineHeight: 1.2 }}>
            Sua Floricultura Digital de Confiança
          </h2>
          <p style={{ opacity: 0.85, fontSize: '15px', marginBottom: '32px', fontWeight: 400, maxWidth: '550px', margin: '0 auto 30px auto' }}>
            Escolha o presente perfeito, monte seu carrinho e finalize o pedido diretamente pelo WhatsApp. Sem cadastros burocráticos.
          </p>

          {/* Barra de Busca Instantânea */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--border-radius-theme)',
            padding: '4px 8px 4px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            maxWidth: '550px',
            margin: '0 auto',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Search size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Pesquise por flores, buquês, cestas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 10px',
                fontSize: '14px',
                color: 'var(--color-text-dark)',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ padding: '8px', color: 'var(--color-text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sugestões de Busca */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.8)',
            flexWrap: 'wrap'
          }}>
            <span>Sugestões:</span>
            {['Rosas', 'Orquídeas', 'Cestas', 'Suculentas'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                style={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                className="hover-scale"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Navegador de Categorias (Chips Horizontais) */}
      <section style={{ padding: '24px 0', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none' // IE/Edge
          }} className="hide-scrollbar">
            {/* Chip Todos */}
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--border-radius-pill)',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0,
                backgroundColor: selectedCategory === null ? 'var(--color-primary)' : '#ffffff',
                color: selectedCategory === null ? '#ffffff' : 'var(--color-text-muted)',
                border: selectedCategory === null ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: selectedCategory === null ? '0 4px 12px rgba(30, 58, 30, 0.15)' : 'var(--shadow-sm)',
                transition: 'var(--transition-fast)'
              }}
            >
              Todos os Produtos
            </button>

            {/* Chips de Categorias do BD */}
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--border-radius-pill)',
                  fontSize: '13px',
                  fontWeight: 600,
                  flexShrink: 0,
                  backgroundColor: selectedCategory === cat.id ? 'var(--color-primary)' : '#ffffff',
                  color: selectedCategory === cat.id ? '#ffffff' : 'var(--color-text-muted)',
                  border: selectedCategory === cat.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(30, 58, 30, 0.15)' : 'var(--shadow-sm)',
                  transition: 'var(--transition-fast)'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Conteúdo do Catálogo */}
      <section style={{ marginTop: '40px' }}>
        <div className="container">
          {/* Caso especial: Seções em Destaque e Mais Vendidos (Home Principal) */}
          {showSpecialSections && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
              {/* Seção Destaques */}
              {featuredProducts.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Sparkles size={20} style={{ color: 'var(--color-secondary)' }} />
                    Destaques Especiais
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '24px'
                  }}>
                    {featuredProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Seção Mais Vendidos */}
              {bestSellers.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Flame size={20} style={{ color: 'var(--color-accent)' }} />
                    Mais Vendidos da Semana
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '24px'
                  }}>
                    {bestSellers.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Catálogo Completo */}
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  marginBottom: '20px'
                }}>
                  Nosso Catálogo Completo
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '24px'
                }}>
                  {products.filter(p => p.active).map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Listagem Única (Quando busca ou categoria ativas) */}
          {!showSpecialSections && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {selectedCategory
                    ? `${categories.find(c => c.id === selectedCategory)?.name}`
                    : 'Resultado da Busca'}
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                    ({filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'})
                  </span>
                </h3>
                
                <button
                  onClick={clearFilters}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={12} /> Limpar Filtros
                </button>
              </div>

              {filteredProducts.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '50px 20px',
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--border-radius-theme)',
                  border: '1px dashed var(--color-border)'
                }}>
                  <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                    Nenhum produto encontrado para estes filtros.
                  </p>
                  <button className="btn btn-sm btn-outline" onClick={clearFilters}>
                    Ver Todos os Produtos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Hide Scrollbar style */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
