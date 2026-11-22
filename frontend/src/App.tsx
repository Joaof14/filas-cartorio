import { Routes, Route, Link } from 'react-router-dom';


function HomeHub() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '8px', fontSize: '2rem' }}>
        🏛️ Sistema de Filas para Cartório
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        Selecione a interface que deseja acessar neste terminal da rede local (LAN):
      </p>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <Link to="/totem" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px', background: '#eff6ff', borderRadius: '12px', border: '2px solid #bfdbfe', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>🎫</span>
            <strong style={{ fontSize: '1.25rem', color: '#1e3a8a', display: 'block' }}>Totem de Senhas</strong>
            <small style={{ color: '#64748b' }}>Autoatendimento ao Cidadão</small>
          </div>
        </Link>


        <Link to="/monitor" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #bbf7d0', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>📺</span>
            <strong style={{ fontSize: '1.25rem', color: '#15803d', display: 'block' }}>Monitor TV</strong>
            <small style={{ color: '#64748b' }}>Painel Público de Chamadas</small>
          </div>
        </Link>


        <Link to="/atendente" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px', background: '#fefce8', borderRadius: '12px', border: '2px solid #fef08a', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>👨‍💼</span>
            <strong style={{ fontSize: '1.25rem', color: '#a16207', display: 'block' }}>Painel do Atendente</strong>
            <small style={{ color: '#64748b' }}>Operação de Guichê</small>
          </div>
        </Link>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeHub />} />
      <Route path="/totem" element={<div style={{ padding: 40, textAlign: 'center' }}><h2>🎫 Totem (Sprint 2)</h2><Link to="/">← Voltar</Link></div>} />
      <Route path="/monitor" element={<div style={{ padding: 40, textAlign: 'center' }}><h2>📺 Monitor TV (Sprint 3)</h2><Link to="/">← Voltar</Link></div>} />
      <Route path="/atendente" element={<div style={{ padding: 40, textAlign: 'center' }}><h2>👨‍💼 Painel do Atendente (Sprint 4)</h2><Link to="/">← Voltar</Link></div>} />
    </Routes>
  );
}
