import React, { useEffect, useState } from 'react';
import { CARTORIO_INFO } from '../constants/cartorioInfo.ts';


interface HeaderCartorioProps {
  subtitulo?: string;
}


export const HeaderCartorio: React.FC<HeaderCartorioProps> = ({
  subtitulo = 'Autoatendimento — Toque no serviço desejado para retirar sua senha',
}) => {
  const [horario, setHorario] = useState<string>(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );


  useEffect(() => {
    const timer = setInterval(() => {
      setHorario(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);


  return (
    <header
      style={{
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        padding: '20px 32px',
        borderRadius: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
          🏛️ {CARTORIO_INFO.nomeOficial}
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.9 }}>{subtitulo}</p>
        <small style={{ display: 'inline-block', marginTop: '6px', background: '#d97706', padding: '2px 10px', borderRadius: '12px', fontWeight: 600 }}>
          ⚖️ Atendimento Prioritário garantido pela {CARTORIO_INFO.leiPrioridade.numero}
        </small>
      </div>


      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 800, display: 'block' }}>
          {horario}
        </span>
        <small style={{ opacity: 0.85 }}>{CARTORIO_INFO.cidade}</small>
      </div>
    </header>
  );
};
