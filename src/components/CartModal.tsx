import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { X, ShoppingBag, ArrowRight, ArrowLeft, Trash2, MessageSquare, Plus, Minus } from 'lucide-react';

interface CartModalProps {
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    checkoutStep,
    setCheckoutStep,
    config,
    sendOrderToWhatsApp
  } = useCatalog();

  // Estados dos formulários do cliente
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  
  // Endereço
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const city = 'São Paulo';
  const [complement, setComplement] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (cart.length === 0 && checkoutStep === 1) {
    return (
      <div className="modal-overlay animate-fade" onClick={onClose}>
        <div className="modal-content animate-scale" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag size={20} /> Seu Carrinho
            </h2>
            <button className="modal-close" onClick={onClose}><X size={20}/></button>
          </div>
          <div className="modal-body text-center py-8">
            <div style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              🌸
            </div>
            <p className="text-base text-muted font-medium mb-6">Nenhum produto adicionado ainda.</p>
            <button className="btn btn-primary" onClick={onClose} style={{ margin: '0 auto' }}>
              Voltar ao catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Validação do Passo 2
  const handleNextStep = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = 'Nome é obrigatório';
    if (!customerPhone.trim()) newErrors.customerPhone = 'Celular é obrigatório';
    
    if (deliveryType === 'delivery') {
      if (!street.trim()) newErrors.street = 'Rua é obrigatória';
      if (!number.trim()) newErrors.number = 'Número é obrigatório';
      if (!neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCheckoutStep(3);
  };

  const handleFinish = () => {
    const addressData = deliveryType === 'delivery' ? {
      street,
      number,
      neighborhood,
      city,
      complement
    } : undefined;

    sendOrderToWhatsApp(customerName, customerPhone, deliveryType, addressData);
    onClose();
  };

  const deliveryFee = deliveryType === 'delivery' ? config.deliveryFee : 0;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <div className="modal-overlay animate-fade" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag size={20} />
            {checkoutStep === 1 && 'Revisar Carrinho (Passo 1/3)'}
            {checkoutStep === 2 && 'Dados de Entrega (Passo 2/3)'}
            {checkoutStep === 3 && 'Confirmar Pedido (Passo 3/3)'}
          </h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* PASSO 1: REVISÃO DE ITENS */}
          {checkoutStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map(item => (
                <div key={item.productId} style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h4>
                    <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700 }}>
                      {item.price ? `R$ ${item.price.toFixed(2)}` : 'Sob Consulta'}
                    </span>
                  </div>

                  {/* Quantidade */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '2px'
                  }}>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      style={{ padding: '4px', color: 'var(--color-text-muted)' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ width: '24px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      style={{ padding: '4px', color: 'var(--color-text-muted)' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Excluir */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    style={{ color: 'var(--color-danger)', padding: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Resumo Financeiro Passo 1 */}
              <div style={{
                marginTop: '10px',
                padding: '16px',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--border-radius-theme)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div className="flex justify-between text-sm">
                  <span>Subtotal dos Produtos</span>
                  <span className="font-semibold">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>* Frete e retirada serão calculados na próxima etapa.</span>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 2: CONTATO E ENDEREÇO */}
          {checkoutStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Seu Nome*</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="form-control"
                    placeholder="Como te chamamos?"
                  />
                  {errors.customerName && <span className="text-xs text-danger">{errors.customerName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp / Celular*</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="form-control"
                    placeholder="(00) 99999-9999"
                  />
                  {errors.customerPhone && <span className="text-xs text-danger">{errors.customerPhone}</span>}
                </div>
              </div>

              {/* Seletor Tipo de Entrega */}
              <div className="form-group">
                <label className="form-label">Método de Entrega</label>
                <div style={{
                  display: 'flex',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-theme)',
                  padding: '4px',
                  backgroundColor: 'var(--color-bg-input)'
                }}>
                  <button
                    onClick={() => { setDeliveryType('delivery'); setErrors({}); }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'calc(var(--border-radius-theme) - 4px)',
                      fontWeight: 600,
                      fontSize: '13px',
                      backgroundColor: deliveryType === 'delivery' ? 'var(--color-primary)' : 'transparent',
                      color: deliveryType === 'delivery' ? '#ffffff' : 'var(--color-text)'
                    }}
                  >
                    🚗 Entrega (Delivery)
                  </button>
                  <button
                    onClick={() => { setDeliveryType('pickup'); setErrors({}); }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'calc(var(--border-radius-theme) - 4px)',
                      fontWeight: 600,
                      fontSize: '13px',
                      backgroundColor: deliveryType === 'pickup' ? 'var(--color-primary)' : 'transparent',
                      color: deliveryType === 'pickup' ? '#ffffff' : 'var(--color-text)'
                    }}
                  >
                    🏪 Retirar na Loja
                  </button>
                </div>
              </div>

              {/* Endereço se Delivery */}
              {deliveryType === 'delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade">
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
                    <div className="form-group m-0">
                      <label className="form-label">Rua/Logradouro*</label>
                      <input
                        type="text"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        className="form-control"
                        placeholder="Rua das Rosas"
                      />
                      {errors.street && <span className="text-xs text-danger">{errors.street}</span>}
                    </div>
                    <div className="form-group m-0">
                      <label className="form-label">Número*</label>
                      <input
                        type="text"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        className="form-control"
                        placeholder="123"
                      />
                      {errors.number && <span className="text-xs text-danger">{errors.number}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group m-0">
                      <label className="form-label">Bairro*</label>
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={e => setNeighborhood(e.target.value)}
                        className="form-control"
                        placeholder="Jardim das Flores"
                      />
                      {errors.neighborhood && <span className="text-xs text-danger">{errors.neighborhood}</span>}
                    </div>
                    <div className="form-group m-0">
                      <label className="form-label">Complemento</label>
                      <input
                        type="text"
                        value={complement}
                        onChange={e => setComplement(e.target.value)}
                        className="form-control"
                        placeholder="Apto, Casa 2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Info de Retirada */}
              {deliveryType === 'pickup' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(46, 196, 182, 0.08)',
                  border: '1px dashed var(--color-success)',
                  borderRadius: 'var(--border-radius-theme)',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }} className="animate-fade">
                  📍 <strong>Retirada no Endereço:</strong><br />
                  {config.address}<br />
                  <span className="text-muted">Horário de retirada acordado via WhatsApp.</span>
                </div>
              )}
            </div>
          )}

          {/* PASSO 3: CONFIRMAÇÃO DO PEDIDO */}
          {checkoutStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-theme)',
                padding: '12px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Itens</h4>
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm mb-1">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">{item.price ? `R$ ${(item.price * item.quantity).toFixed(2)}` : 'Sob Consulta'}</span>
                  </div>
                ))}
              </div>

              {/* Info Cliente */}
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-theme)',
                padding: '12px',
                fontSize: '13px'
              }}>
                <h4 style={{ fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Destinatário</h4>
                <div><strong>Nome:</strong> {customerName}</div>
                <div><strong>WhatsApp:</strong> {customerPhone}</div>
                <div style={{ marginTop: '6px' }}>
                  <strong>Tipo de Entrega:</strong> {deliveryType === 'delivery' ? '🚗 Entrega (Delivery)' : '🏪 Retirar na Loja'}
                </div>
                {deliveryType === 'delivery' && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Endereço:</strong> {street}, {number} - {neighborhood}, {city}
                    {complement && ` (${complement})`}
                  </div>
                )}
              </div>

              {/* Detalhes Financeiros */}
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--color-bg-input)',
                borderRadius: 'var(--border-radius-theme)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Entrega</span>
                    <span>R$ {config.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
                <div className="flex justify-between text-base font-bold text-primary">
                  <span>Total Geral</span>
                  <span>R$ {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com controle de passos */}
        <div className="modal-footer">
          {checkoutStep > 1 && (
            <button
              className="btn btn-outline"
              onClick={() => setCheckoutStep(checkoutStep - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          )}

          {checkoutStep < 3 ? (
            <button
              className="btn btn-primary"
              onClick={checkoutStep === 1 ? () => setCheckoutStep(2) : handleNextStep}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Continuar <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-whatsapp"
              onClick={handleFinish}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px' }}
            >
              <MessageSquare size={18} /> Confirmar & Enviar WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
