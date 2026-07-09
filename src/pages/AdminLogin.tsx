import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Flower, Lock, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      setError(true);
    } else {
      setError(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px',
      backgroundColor: 'var(--color-admin-bg)',
      color: 'var(--color-admin-text)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-admin-card)',
        border: '1px solid var(--color-admin-border)',
        borderRadius: 'var(--border-radius-theme)',
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)'
      }} className="animate-scale">
        
        {/* Logo / Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Flower size={24} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
            Painel Administrativo
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-admin-text-muted)', marginTop: '4px' }}>
            Insira a senha de acesso para gerenciar o catálogo
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'var(--color-admin-text)' }}>Senha de Acesso</label>
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
                  paddingLeft: '40px'
                }}
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
                <AlertCircle size={14} /> Senha incorreta! Tente "admin"
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '8px' }}
          >
            Entrar no Painel
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--color-admin-text-muted)',
          borderTop: '1px solid var(--color-admin-border)',
          paddingTop: '16px'
        }}>
          Dica: A senha padrão é <strong>admin</strong>.
        </div>
      </div>
    </div>
  );
};
