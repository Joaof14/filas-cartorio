import type { Servico, Guiche, Senha, TipoPrioridade } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export interface ChamadaRecente {
  id: string;
  codigo: string;
  tipoPrioridade: TipoPrioridade;
  chamadaEm: string;
  servico: { nome: string };
  guiche: { numero: number; nome: string };
}

export interface EstatisticasFila {
  totalAguardando: number;
  prioritarias: number;
  gerais: number;
}

export const api = {
  async getServicos(): Promise<Servico[]> {
    const res = await fetch(`${API_BASE_URL}/servicos`);
    if (!res.ok) throw new Error('Falha ao carregar serviços');
    return res.json();
  },

  async getGuiches(): Promise<Guiche[]> {
    const res = await fetch(`${API_BASE_URL}/guiches`);
    if (!res.ok) throw new Error('Falha ao carregar guichês');
    return res.json();
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('http://localhost:3333/health');
      return res.ok;
    } catch {
      return false;
    }
  },

  // Sprint 2: Emissão de senha pelo Totem
  async emitirSenha(servicoId: string, tipoPrioridade: TipoPrioridade): Promise<Senha> {
    const res = await fetch(`${API_BASE_URL}/senhas/emitir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicoId, tipoPrioridade }),
    });
    if (!res.ok) throw new Error('Erro ao emitir senha.');
    return res.json();
  },

  // Sprint 3: Últimas chamadas para o Monitor TV
  async getUltimasChamadas(): Promise<ChamadaRecente[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/senhas/ultimas-chamadas`);
      return res.ok ? res.json() : [];
    } catch {
      return [];
    }
  }, 
  async getEstatisticasFila(): Promise<EstatisticasFila> {
    try {
      const res = await fetch(`${API_BASE_URL}/atendimento/estatisticas-fila`);
      return res.ok ? res.json() : { totalAguardando: 0, prioritarias: 0, gerais: 0 };
    } catch {
      return { totalAguardando: 0, prioritarias: 0, gerais: 0 };
    }
  },

  async chamarProximo(guicheId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/atendimento/chamar-proximo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guicheId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fila vazia.');
    }
    return res.json();
  },

  async rechamar(senhaId: string, guicheNumero: number): Promise<void> {
    await fetch(`${API_BASE_URL}/atendimento/rechamar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId, guicheNumero }),
    });
  },

  async iniciarAtendimento(senhaId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/atendimento/iniciar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId }),
    });
    return res.json();
  },

  async finalizarAtendimento(senhaId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/atendimento/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId }),
    });
    return res.json();
  },

  async marcarAusente(senhaId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/atendimento/ausente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId }),
    });
    return res.json();
  },

  async transferirSenha(senhaId: string, novoServicoId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/atendimento/transferir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaId, novoServicoId }),
    });
    return res.json();
  },
};