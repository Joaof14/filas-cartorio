import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socket } from '../services/socket.ts';
import { api, ChamadaRecente } from '../services/api.ts';
import { tocarGongoChamada, falarSenhaChamada } from '../utils/somChamada.ts';


export function MonitorPage() {
  const [atual, setAtual] = useState<ChamadaRecente | null>(null);
  const [historico, setHistorico] = useState<ChamadaRecente[]>([]);
  const [audioAtivo, setAudioAtivo] = useState(false);


  useEffect(() => {
    api.getUltimasChamadas().then((lista) => {
      if (lista.length > 0) {
        setAtual(lista[0]);
        setHistorico(lista.slice(1, 5));
      }
    });


    socket.emit('join:monitor');


    function onNovaChamada(nova: ChamadaRecente) {
      setAtual((anterior) => {
        if (anterior) {
          setHistorico((prev) => [anterior, ...prev.filter((i) => i.id !== anterior.id)].slice(0, 4));
        }
        return nova;
      });
      tocarGongoChamada();
      falarSenhaChamada(nova.codigo, nova.guiche.numero, nova.tipoPrioridade === 'PRIORITARIA');
    }


    socket.on('senha:chamada', onNovaChamada);
    return () => {
      socket.off('senha:chamada', onNovaChamada);
    };
  }, []);


  return (
    <div style={{ minHeight: '100vh', background: '#0b1329', color: 'white', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
      {!audioAtivo && (
        <div
          onClick={() => { tocarGongoChamada(); setAudioAtivo(true); }}
          style={{ background: '#d97706', padding: '12px', textAlign: 'center', fontWeight: 700, cursor: 'pointer' }}
        >
          🔊 Clique aqui uma vez para ativar o som e a voz da TV no navegador
        </div>
      )}


      <header style={{ padding: '20px 40px', background: '#070d1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>🏛️ PAINEL DE CHAMADAS — CARTÓRIO</h1>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>⚙️ Sair</Link>
      </header>


      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '68% 30%', gap: '2%', padding: '32px 40px' }}>
        {/* Destaque Principal da Senha Chamada */}
        <div style={{ background: '#111c38', borderRadius: '24px', border: '3px solid #38bdf8', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          {atual ? (
            <>
              <span style={{ alignSelf: 'center', background: atual.tipoPrioridade === 'PRIORITARIA' ? '#d97706' : '#2563eb', padding: '8px 24px', borderRadius: '99px', fontWeight: 800, fontSize: '1.2rem' }}>
                {atual.tipoPrioridade === 'PRIORITARIA' ? '⭐ ATENDIMENTO PRIORITÁRIO (LEI 10.048)' : '👥 ATENDIMENTO GERAL'}
              </span>
              <div style={{ fontSize: '7.5rem', fontWeight: 900, fontFamily: 'monospace', margin: '16px 0' }}>
                {atual.codigo}
              </div>
              <p style={{ fontSize: '1.8rem', color: '#cbd5e1', marginBottom: '24px' }}>{atual.servico?.nome}</p>
              <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#38bdf8', background: '#1e293b', padding: '16px 36px', borderRadius: '16px', alignSelf: 'center' }}>
                👉 GUICHÊ {String(atual.guiche?.numero || 1).padStart(2, '0')}
              </div>
            </>
          ) : (
            <h2 style={{ color: '#64748b', fontSize: '2rem' }}>🕒 Aguardando próxima chamada...</h2>
          )}
        </div>


        {/* Coluna Lateral: Últimas Chamadas */}
        <div style={{ background: '#070d1e', borderRadius: '24px', padding: '24px', border: '1px solid #1e293b' }}>
          <h3 style={{ color: '#94a3b8', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
            📋 ÚLTIMAS CHAMADAS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historico.map((item) => (
              <div key={item.id} style={{ background: '#111c38', padding: '14px 18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '1.6rem', fontFamily: 'monospace', color: item.tipoPrioridade === 'PRIORITARIA' ? '#f59e0b' : 'white' }}>
                    {item.codigo}
                  </strong>
                  <small style={{ display: 'block', color: '#64748b' }}>{item.servico?.nome}</small>
                </div>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>Guichê {item.guiche?.numero}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}