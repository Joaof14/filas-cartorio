import type { Servico, Guiche, Senha, TipoPrioridade } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

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
};