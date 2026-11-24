import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Servico, Senha, TipoPrioridade } from '../types';
import { CardServico } from '../components/CardServico';
import { ButtonTouch } from '../components/ButtonTouch';

// HeaderCartorio pode não existir ainda na sua branch.
// Este fallback simples evita erro de import e mantém o visual coerente.
function HeaderCartorioFallback() {
  return (
    <header
      style={{
        textAlign: 'center',
        marginBottom: '24px',
        padding: '16px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h1 style={{ color: 'var(--color-primary)', fontSize: '1.6rem' }}>
        🏛️ Cartório — Totem de Senhas
      </h1>
      <small style={{ color: 'var(--color-text-muted)' }}>
        Toque na tela para iniciar
      </small>
    </header>
  );
}

export function TotemPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [senhaEmitida, setSenhaEmitida] = useState<Senha | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [segundos, setSegundos] = useState(5);

  useEffect(() => {
    api.getServicos().then(setServicos).catch(console.error);
  }, []);

  useEffect(() => {
    if (!senhaEmitida) return;
    setSegundos(5);
    const timer = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          setSenhaEmitida(null);
          setServicoSelecionado(null);
          return 5;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [senhaEmitida]);

  async function handleEmitir(tipo: TipoPrioridade) {
    if (!servicoSelecionado || enviando) return;
    setEnviando(true);
    try {
      const nova = await api.emitirSenha(servicoSelecionado.id, tipo);
      setSenhaEmitida(nova);
    } catch {
      alert('Erro ao emitir senha. Verifique a conexão com o servidor.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px', userSelect: 'none' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <HeaderCartorioFallback />

        <h2 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
          1º Toque: Selecione o serviço desejado
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {servicos.map((s) => (
            <CardServico key={s.id} servico={s} onSelect={setServicoSelecionado} />
          ))}
        </div>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Voltar ao Menu Inicial
          </Link>
        </div>
      </div>

      {/* MODAL 1: Geral vs Prioritário */}
      {servicoSelecionado && !senhaEmitida && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '580px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <small style={{ color: '#1e3a8a', fontWeight: 700 }}>SERVIÇO SELECIONADO</small>
            <h2 style={{ fontSize: '1.8rem', margin: '6px 0 24px' }}>{servicoSelecionado.nome}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ButtonTouch variant="primary" disabled={enviando} onClick={() => handleEmitir('GERAL')} style={{ width: '100%', height: '76px' }}>
                👥 ATENDIMENTO GERAL
              </ButtonTouch>

              <ButtonTouch variant="priority" disabled={enviando} onClick={() => handleEmitir('PRIORITARIA')} style={{ width: '100%', height: '88px', flexDirection: 'column', gap: '2px' }}>
                <span>⭐ ATENDIMENTO PRIORITÁRIO (LEI 10.048/00)</span>
                <small style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                  Idosos 60+, Gestantes, Lactantes, PCD e Criança de Colo
                </small>
              </ButtonTouch>

              <button onClick={() => setServicoSelecionado(null)} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}>
                ✕ Cancelar (FA-1)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Ficha emitida */}
      {senhaEmitida && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ color: '#15803d', fontWeight: 800 }}>✅ FICHA EMITIDA COM SUCESSO!</h2>
            <p style={{ color: '#64748b', marginTop: '4px' }}>
              {senhaEmitida.servico?.nome} • <strong>{senhaEmitida.tipoPrioridade}</strong>
            </p>

            <div style={{ margin: '20px 0', padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '2px dashed #1e3a8a' }}>
              <small style={{ color: '#64748b', fontWeight: 700 }}>SUA SENHA:</small>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace' }}>
                {senhaEmitida.codigo}
              </div>
              <small style={{ color: '#475569', display: 'block', marginTop: '6px' }}>
                🕒 Horário de Emissão: {new Date(senhaEmitida.createdAt).toLocaleTimeString('pt-BR')}
              </small>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '16px' }}>
              Retire sua ficha impressa e aguarde a chamada na TV. (Fechando em <strong>{segundos}s</strong>)
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <ButtonTouch variant="outline" onClick={() => window.print()} style={{ flex: 1, minHeight: '48px', fontSize: '1rem' }}>
                🖨️ Imprimir Ficha
              </ButtonTouch>
              <ButtonTouch variant="primary" onClick={() => { setSenhaEmitida(null); setServicoSelecionado(null); }} style={{ flex: 1, minHeight: '48px', fontSize: '1rem' }}>
                Concluir
              </ButtonTouch>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}