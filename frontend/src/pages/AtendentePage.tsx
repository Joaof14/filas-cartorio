import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EstatisticasFila } from '../services/api.ts';
import { Guiche, Servico } from '../types/index.ts';
import { socket } from '../services/socket.ts';
import { ResumoFilaBar } from '../components/ResumoFilaBar.tsx';


export function AtendentePage() {
  const [guiches, setGuiches] = useState<Guiche[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [guicheAtual, setGuicheAtual] = useState<Guiche | null>(null);
  const [stats, setStats] = useState<EstatisticasFila>({ totalAguardando: 0, prioritarias: 0, gerais: 0 });
  const [senhaAtual, setSenhaAtual] = useState<any | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [aviso, setAviso] = useState('');


  const atualizarFila = () => api.getEstatisticasFila().then(setStats);


  useEffect(() => {
    Promise.all([api.getGuiches(), api.getServicos(), api.getEstatisticasFila()]).then(([g, s, st]) => {
      setGuiches(g);
      setServicos(s);
      setStats(st);
      if (g.length > 0) setGuicheAtual(g[0]);
    });


    socket.on('senha:emitida', atualizarFila);
    socket.on('senha:chamada', atualizarFila);
    return () => {
      socket.off('senha:emitida', atualizarFila);
      socket.off('senha:chamada', atualizarFila);
    };
  }, []);


  useEffect(() => {
    if (senhaAtual?.status !== 'EM_ATENDIMENTO') {
      setSegundos(0);
      return;
    }
    const timer = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [senhaAtual?.status]);


  async function handleChamar() {
    if (!guicheAtual) return;
    setAviso('');
    try {
      const chamada = await api.chamarProximo(guicheAtual.id);
      setSenhaAtual(chamada);
    } catch (err: any) {
      setAviso(err.message || 'Fila vazia (FE-1).');
    }
  }


  async function handleIniciar() {
    const res = await api.iniciarAtendimento(senhaAtual.id);
    setSenhaAtual((prev: any) => ({ ...prev, status: res.status }));
  }


  async function handleFinalizar() {
    await api.finalizarAtendimento(senhaAtual.id);
    setSenhaAtual(null);
    atualizarFila();
  }


  async function handleAusente() {
    await api.marcarAusente(senhaAtual.id);
    setSenhaAtual(null);
    atualizarFila();
  }


  async function handleTransferir(novoServicoId: string) {
    await api.transferirSenha(senhaAtual.id, novoServicoId);
    setSenhaAtual(null);
    atualizarFila();
  }


  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <header style={{ background: 'white', padding: '16px 24px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.3rem', color: '#1e3a8a' }}>👨‍💼 Painel do Guichê — Atendente</h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select
              value={guicheAtual?.id || ''}
              onChange={(e) => setGuicheAtual(guiches.find((g) => g.id === e.target.value) || null)}
              style={{ padding: '8px 12px', borderRadius: '8px', fontWeight: 700 }}
            >
              {guiches.map((g) => (
                <option key={g.id} value={g.id}>{g.nome}</option>
              ))}
            </select>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>← Início</Link>
          </div>
        </header>


        <ResumoFilaBar totalAguardando={stats.totalAguardando} prioritarias={stats.prioritarias} gerais={stats.gerais} />


        {aviso && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
            ⚠️ {aviso}
          </div>
        )}


        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          {!senhaAtual ? (
            <>
              <h2 style={{ marginBottom: '16px' }}>Guichê Livre</h2>
              <button onClick={handleChamar} className="btn-touch btn-primary" style={{ background: '#15803d', fontSize: '1.3rem' }}>
                📢 CHAMAR PRÓXIMO DA FILA
              </button>
            </>
          ) : (
            <>
              <small style={{ fontWeight: 700, color: '#64748b' }}>Status: {senhaAtual.status}</small>
              <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace' }}>
                {senhaAtual.codigo}
              </div>
              <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                {senhaAtual.servico?.nome} ({senhaAtual.tipoPrioridade})
              </p>


              {senhaAtual.status === 'EM_ATENDIMENTO' && (
                <div style={{ fontSize: '1.6rem', fontFamily: 'monospace', fontWeight: 800, color: '#15803d', marginBottom: '20px' }}>
                  ⏱️ Tempo: {Math.floor(segundos / 60)}m {segundos % 60}s
                </div>
              )}


              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {senhaAtual.status === 'CHAMANDO' ? (
                  <>
                    <button onClick={handleIniciar} className="btn-touch" style={{ background: '#15803d', color: 'white' }}>▶ Iniciar Atendimento</button>
                    <button onClick={() => guicheAtual && api.rechamar(senhaAtual.id, guicheAtual.numero)} className="btn-touch" style={{ background: '#2563eb', color: 'white' }}>🔁 Rechamar na TV</button>
                    <button onClick={handleAusente} className="btn-touch" style={{ background: '#b91c1c', color: 'white' }}>🚫 Marcar Ausente</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleFinalizar} className="btn-touch" style={{ background: '#15803d', color: 'white' }}>✅ Concluir Atendimento</button>
                    <select
                      defaultValue=""
                      onChange={(e) => e.target.value && handleTransferir(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', fontWeight: 600 }}
                    >
                      <option value="" disabled>🔀 Transferir para outro Serviço...</option>
                      {servicos.map((s) => (
                        <option key={s.id} value={s.id}>{s.nome} ({s.sigla})</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
