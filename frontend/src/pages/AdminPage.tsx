import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ResumoKPI {
  periodoDias: number;
  totalEmitidas: number;
  totalFinalizadas: number;
  totalAusentes: number;
  tempoMedioEsperaMin: number;
  tempoMedioAtendimentoMin: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export function AdminPage() {
  const [metricas, setMetricas] = useState<ResumoKPI | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/relatorios/resumo`)
      .then((r) => {
        if (!r.ok) throw new Error('Falha ao carregar métricas');
        return r.json();
      })
      .then(setMetricas)
      .catch((e) => {
        console.error(e);
        setErro('Não foi possível carregar as métricas. O backend está rodando?');
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.7rem', color: '#1e3a8a' }}>
              📊 Relatórios e Gestão do Cartório
            </h1>
            <p style={{ color: '#64748b' }}>
              Métricas de Produtividade e Cumprimento da Lei nº 10.048/2000 (Proporção 2:1)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              onClick={() =>
                window.open(`${API_BASE_URL}/relatorios/exportar-csv`, '_blank')
              }
              className="btn-touch"
              style={{
                background: '#15803d',
                color: 'white',
                minHeight: '48px',
                fontSize: '1rem',
              }}
            >
              📥 Exportar Planilha CSV
            </button>
            <Link
              to="/"
              style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}
            >
              ← Início
            </Link>
          </div>
        </header>

        {erro && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            ⚠️ {erro}
          </div>
        )}

        {metricas ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: 'white',
                padding: '22px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
              }}
            >
              <small style={{ color: '#64748b', fontWeight: 700 }}>
                TEMPO MÉDIO DE ESPERA (TME)
              </small>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#1e3a8a',
                  marginTop: '6px',
                }}
              >
                {metricas.tempoMedioEsperaMin} min
              </div>
            </div>

            <div
              style={{
                background: 'white',
                padding: '22px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
              }}
            >
              <small style={{ color: '#64748b', fontWeight: 700 }}>
                TEMPO DE ATENDIMENTO (TMA)
              </small>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#d97706',
                  marginTop: '6px',
                }}
              >
                {metricas.tempoMedioAtendimentoMin} min
              </div>
            </div>

            <div
              style={{
                background: 'white',
                padding: '22px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
              }}
            >
              <small style={{ color: '#64748b', fontWeight: 700 }}>
                CONCLUÍDOS / EMITIDAS
              </small>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#15803d',
                  marginTop: '6px',
                }}
              >
                {metricas.totalFinalizadas} / {metricas.totalEmitidas}
              </div>
            </div>

            <div
              style={{
                background: 'white',
                padding: '22px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
              }}
            >
              <small style={{ color: '#64748b', fontWeight: 700 }}>AUSÊNCIAS</small>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: '#b91c1c',
                  marginTop: '6px',
                }}
              >
                {metricas.totalAusentes}
              </div>
            </div>
          </div>
        ) : (
          !erro && <p>Carregando métricas...</p>
        )}
      </div>
    </div>
  );
}