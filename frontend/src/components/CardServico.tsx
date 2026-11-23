import React from 'react';
import { Servico } from '../types/index.ts';


interface CardServicoProps {
  servico: Servico;
  onSelect: (servico: Servico) => void;
}


export const CardServico: React.FC<CardServicoProps> = ({ servico, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(servico)}
      style={{
        background: 'white',
        border: '2px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div>
        <span style={{
          display: 'inline-block',
          background: '#dbeafe',
          color: '#1e40af',
          fontWeight: 700,
          fontSize: '0.85rem',
          padding: '4px 10px',
          borderRadius: '20px',
          marginBottom: '12px',
        }}>
          {servico.sigla}
        </span>
        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }}>
          {servico.nome}
        </h3>
      </div>


      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small style={{ color: '#64748b' }}>
          ⏱️ Tempo médio: <strong>~{servico.tempoMedio} min</strong>
        </small>
        <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.2rem' }}>
          ➔
        </span>
      </div>
    </div>
  );
};
