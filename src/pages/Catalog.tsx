import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from '../components/ProductCard';
import { dbService } from '../services/db';
import { aiSimulator } from '../utils/aiSimulator';
import { Search, Sparkles, Flame, X, MessageSquare, Send, Check, Bot } from 'lucide-react';

export const Catalog: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    config
  } = useCatalog();

  // Estado do Chat de Ajuda
  const [chatOpen, setChatOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [chatSent, setChatSent] = useState(false);

  // --- CHATBOT IA FAQ ---
  const [chatMode, setChatMode] = useState<'ai' | 'human'>('ai');
  const [chatbotInput, setChatbotInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>(() => [
    { sender: 'bot', text: 'Olá! Sou a assistente inteligente da loja. Como posso ajudar você hoje? Pergunte-me sobre frete, endereço, horários de atendimento ou preços!' }
  ]);

  const handleSendChatbotMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatbotInput.trim()) return;

    const userText = chatbotInput.trim();
    setAiMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatbotInput('');
    setBotTyping(true);

    setTimeout(() => {
      const response = aiSimulator.getFAQResponse(userText, config, products);
      setAiMessages(prev => [...prev, { sender: 'bot', text: response }]);
      setBotTyping(false);
    }, 1000);
  };

  // Filtragem de produtos
  const getFilteredProducts = () => {
    let list = products;

    if (selectedCategory) {
      list = list.filter(p => p.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    return list;
  };

  const filteredProducts = getFilteredProducts();
  const showSpecialSections = !selectedCategory && !searchQuery;
  
  const featuredProducts = products.filter(p => p.featured && p.active);
  const bestSellers = products.filter(p => p.bestSeller && p.active);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Enviar mensagem simulada do cliente ao admin
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatName.trim() || !chatMsg.trim()) return;

    const messages = JSON.parse(localStorage.getItem('floricultura_customer_messages') || '[]');
    const newMsg = {
      id: `msg-${Math.floor(1000 + Math.random() * 9000)}`,
      name: chatName,
      message: chatMsg,
      timestamp: new Date().toISOString(),
      read: false
    };

    messages.unshift(newMsg);
    localStorage.setItem('floricultura_customer_messages', JSON.stringify(messages));
    
    // Dispara eventos para o Admin perceber a mensagem em tempo real
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('new_customer_message', { detail: newMsg }));

    setChatSent(true);
    setChatMsg('');
    setTimeout(() => {
      setChatSent(false);
      setChatOpen(false);
    }, 2500);
  };

  // --- SEÇÕES DE RENDERIZAÇÃO INDEPENDENTE ---

  // 1. Seção Hero/Banner
  const renderHero = () => (
    <section key="hero" style={{
      backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.75) 100%), url('${config.bannerImage || '/florist_banner.png'}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#ffffff',
      padding: '90px 0 100px 0',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
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
          {config.name}
        </span>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px', lineHeight: 1.2 }}>
          {config.bannerTitle || 'Sua Floricultura Digital de Confiança'}
        </h2>
        <p style={{ opacity: 0.85, fontSize: '15px', marginBottom: '32px', fontWeight: 400, maxWidth: '550px', margin: '0 auto 30px auto' }}>
          {config.bannerSubtitle || 'Escolha o presente perfeito, monte seu carrinho e finalize o pedido diretamente pelo WhatsApp.'}
        </p>

        {/* Barra de Busca Instantânea */}
        <div 
          onClick={() => dbService.logHeatmapClick('search-input')}
          style={{
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
          }}
        >
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
              onClick={() => {
                setSearchQuery(term);
                dbService.logHeatmapClick('search-input');
              }}
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
  );

  // 2. Seção Categorias
  const renderCategories = () => (
    <section key="categories" style={{ padding: '24px 0', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }} className="hide-scrollbar">
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
  );

  // 3. Seção Destaques
  const renderFeatured = () => {
    if (!showSpecialSections || featuredProducts.length === 0) return null;
    return (
      <section key="featured" style={{ marginTop: '40px' }}>
        <div className="container">
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
      </section>
    );
  };

  // 4. Seção Mais Vendidos
  const renderBestSellers = () => {
    if (!showSpecialSections || bestSellers.length === 0) return null;
    return (
      <section key="bestsellers" style={{ marginTop: '40px' }}>
        <div className="container">
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
      </section>
    );
  };

  // 5. Seção Grade Geral (Catálogo)
  const renderFullCatalog = () => {
    if (showSpecialSections) {
      return (
        <section key="catalog" style={{ marginTop: '40px' }}>
          <div className="container">
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
        </section>
      );
    }

    // Se estiver filtrado por busca ou categoria
    return (
      <section key="catalog" style={{ marginTop: '40px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="justify-between">
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
              Limpar Filtros
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
      </section>
    );
  };

  // Mapeia strings para os métodos de renderização correspondentes
  const renderSection = (sectionName: string) => {
    switch (sectionName) {
      case 'hero': return renderHero();
      case 'categories': return renderCategories();
      case 'featured': return renderFeatured();
      case 'bestsellers': return renderBestSellers();
      case 'catalog': return renderFullCatalog();
      default: return null;
    }
  };

  // Garante uma ordem padrão se as seções não estiverem configuradas
  const sectionsOrder = config.sectionsOrder || ['hero', 'categories', 'featured', 'bestsellers', 'catalog'];

  return (
    <div style={{ paddingBottom: '80px', minHeight: '80vh' }}>
      {/* Renderiza as seções com base na ordenação Shopify-like do Builder */}
      {sectionsOrder.map(section => renderSection(section))}

      {/* CHAT FLUTUANTE SIMULADO (Mensagens do Cliente -> Admin PWA) */}
      <div style={{ position: 'fixed', bottom: '90px', right: '24px', zIndex: 98 }}>
        {chatOpen ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            width: '300px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }} className="animate-scale">
            
            {/* Header */}
            <div style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="justify-between">
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={16} /> Suporte Konnexy
                </span>
                <button onClick={() => setChatOpen(false)} style={{ color: '#ffffff' }}>
                  <X size={16} />
                </button>
              </div>
              
              {/* Tab Switcher */}
              <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '4px', padding: '2px' }}>
                <button
                  type="button"
                  onClick={() => setChatMode('ai')}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '3px',
                    backgroundColor: chatMode === 'ai' ? 'rgba(255,255,255,0.9)' : 'transparent',
                    color: chatMode === 'ai' ? 'var(--color-primary)' : '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Assistente IA
                </button>
                <button
                  type="button"
                  onClick={() => setChatMode('human')}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '3px',
                    backgroundColor: chatMode === 'human' ? 'rgba(255,255,255,0.9)' : 'transparent',
                    color: chatMode === 'human' ? 'var(--color-primary)' : '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Deixar Recado
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '320px', overflow: 'hidden' }}>
              {chatMode === 'ai' ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px' }}>
                  {/* Messages list */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '8px' }} className="hide-scrollbar">
                    {aiMessages.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-start',
                          gap: '6px'
                        }}
                      >
                        {m.sender === 'bot' && (
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                            IA
                          </div>
                        )}
                        <div style={{
                          maxWidth: '80%',
                          padding: '8px 12px',
                          borderRadius: m.sender === 'user' ? '12px 12px 0 12px' : '0 12px 12px 12px',
                          backgroundColor: m.sender === 'user' ? 'var(--color-primary)' : 'var(--color-secondary)',
                          color: m.sender === 'user' ? '#ffffff' : 'var(--color-text-dark)',
                          fontSize: '12px',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {botTyping && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                          IA
                        </div>
                        <div style={{ padding: '8px 12px', borderRadius: '0 12px 12px 12px', backgroundColor: 'var(--color-secondary)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          Digitando...
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <form onSubmit={handleSendChatbotMsg} style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                    <input
                      type="text"
                      placeholder="Pergunte sobre frete, horários..."
                      value={chatbotInput}
                      onChange={e => setChatbotInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        border: '1px solid var(--color-border)',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        color: 'var(--color-text-dark)'
                      }}
                    />
                    <button type="submit" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                  {chatSent ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }} className="animate-fade">
                      <div style={{
                        backgroundColor: 'rgba(46, 196, 182, 0.1)',
                        color: 'var(--color-success)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto'
                      }}>
                        <Check size={20} />
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Mensagem Enviada!</h4>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        O lojista foi notificado e responderá no seu WhatsApp em instantes.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendChat} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0, gap: '4px' }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Seu Nome</label>
                        <input
                          type="text"
                          required
                          value={chatName}
                          onChange={e => setChatName(e.target.value)}
                          className="form-control"
                          placeholder="Ex: João Silva"
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, gap: '4px' }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Mensagem ou Dúvida</label>
                        <textarea
                          required
                          rows={3}
                          value={chatMsg}
                          onChange={e => setChatMsg(e.target.value)}
                          className="form-control"
                          placeholder="Qual sua dúvida sobre as flores?"
                          style={{ padding: '8px 12px', fontSize: '13px', resize: 'none' }}
                        />
                      </div>
                      <button type="submit" className="btn btn-sm btn-primary btn-full" style={{ padding: '8px' }}>
                        <Send size={12} /> Enviar Mensagem
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setChatOpen(true);
              dbService.logHeatmapClick('whatsapp-floating');
            }}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'var(--transition-fast)'
            }}
            className="hover-scale"
            title="Dúvidas? Fale conosco!"
          >
            <MessageSquare size={18} />
          </button>
        )}
      </div>

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
