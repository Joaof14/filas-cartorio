import React from 'react';


interface ResumoFilaBarProps {
  totalAguardando: number;
  prioritarias: number;
  gerais: number;
}


export const ResumoFilaBar: React.FC<ResumoFilaBarProps> = ({
  totalAguardando,
  prioritarias,
  gerais,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', borderLeft: '5px solid #1e3a8a', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <small style={{ color: '#64748b', fontWeight: 600 }}>TOTAL AGUARDANDO</small>
        <strong style={{ display: 'block', fontSize: '1.8rem', color: '#0f172a' }}>{totalAguardando}</strong>
      </div>


      <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', borderLeft: '5px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <small style={{ color: '#b45309', fontWeight: 700 }}>⚖️ FILA PRIORITÁRIA (LEI 10.048)</small>
        <strong style={{ display: 'block', fontSize: '1.8rem', color: '#d97706' }}>{prioritarias}</strong>
      </div>


      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '5px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <small style={{ color: '#0369a1', fontWeight: 600 }}>FILA GERAL</small>
        <strong style={{ display: 'block', fontSize: '1.8rem', color: '#0284c7' }}>{gerais}</strong>
      </div>
    </div>
  );
};
