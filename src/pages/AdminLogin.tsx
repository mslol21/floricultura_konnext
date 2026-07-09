import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Flower, Lock, User, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError(true);
    } else {
      setError(false);
    }
  };

  // Atalhos para auto-preenchimento rápido (Facilidade de Teste/Uso)
  const quickLogins = [
    { label: 'Proprietário', user: 'dono', pass: 'dono', desc: 'Acesso total' },
    { label: 'Gerente', user: 'gerente', pass: 'gerente', desc: 'Catálogo & Vendas' },
    { label: 'Funcionário', user: 'funcionario', pass: 'funcionario', desc: 'Pedidos & Produtos' },
    { label: 'Estoquista', user: 'estoquista', pass: 'estoquista', desc: 'Apenas Estoque' },
    { label: 'Atendimento', user: 'atendimento', pass: 'atendimento', desc: 'Pedidos & Chat' },
    { label: 'Marketing', user: 'marketing', pass: 'marketing', desc: 'Banners, Temas & IA' },
  ];

  const handleQuickSelect = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '90vh',
      padding: '20px',
      backgroundColor: 'var(--color-admin-bg)',
      color: 'var(--color-admin-text)',
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-admin-card)',
        border: '1px solid var(--color-admin-border)',
        borderRadius: 'var(--border-radius-theme)',
        width: '100%',
        maxWidth: '460px',
        padding: '36px',
        boxShadow: 'var(--shadow-lg)'
      }} className="animate-scale">
        
        {/* Logo / Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Flower size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
            Painel Administrativo
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-admin-text-muted)', marginTop: '4px', textAlign: 'center' }}>
            Escolha um perfil de teste abaixo ou insira suas credenciais.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Usuário</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{
                position: 'absolute',
                left: '14px',
                color: 'var(--color-admin-text-muted)'
              }} />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(false); }}
                className="form-control"
                placeholder="Ex: dono, gerente..."
                style={{
                  backgroundColor: 'var(--color-admin-input)',
                  borderColor: 'var(--color-admin-border)',
                  color: 'var(--color-admin-text)',
                  paddingLeft: '40px',
                  width: '100%'
                }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Senha</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '14px',
                color: 'var(--color-admin-text-muted)'
              }} />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                className="form-control"
                placeholder="Digite sua senha"
                style={{
                  backgroundColor: 'var(--color-admin-input)',
                  borderColor: 'var(--color-admin-border)',
                  color: 'var(--color-admin-text)',
                  paddingLeft: '40px',
                  width: '100%'
                }}
                required
              />
            </div>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-danger)',
                fontSize: '12px',
                marginTop: '8px',
                fontWeight: 500
              }}>
                <AlertCircle size={14} /> Usuário ou senha incorretos!
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '8px', padding: '12px' }}
          >
            Entrar no Painel
          </button>
        </form>

        {/* Perfis de teste rápidos */}
        <div style={{
          marginTop: '28px',
          borderTop: '1px solid var(--color-admin-border)',
          paddingTop: '20px'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-admin-text)', marginBottom: '12px' }}>
            Acesso Rápido para Testes:
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            {quickLogins.map(login => (
              <button
                key={login.user}
                type="button"
                onClick={() => handleQuickSelect(login.user, login.pass)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '8px 12px',
                  backgroundColor: username === login.user ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-admin-input)',
                  border: `1px solid ${username === login.user ? 'var(--color-primary)' : 'var(--color-admin-border)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                className="hover-scale"
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-admin-text)' }}>{login.label}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-admin-text-muted)', marginTop: '2px' }}>{login.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
