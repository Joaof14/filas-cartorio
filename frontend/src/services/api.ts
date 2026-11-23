import type { Servico, Guiche } from '../types/index.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const api = {
  // Buscar lista de servicos ativos do cartorio
  async getServicos(): Promise<Servico[]> {
    const res = await fetch(`${API_BASE_URL}/servicos`);
    if (!res.ok) throw new Error('Falha ao carregar serviços do cartório');
    return res.json();
  },

  // Buscar lista de guiches
  async getGuiches(): Promise<Guiche[]> {
    const res = await fetch(`${API_BASE_URL}/guiches`);
    if (!res.ok) throw new Error('Falha ao carregar guichês');
    return res.json();
  },

  // Checar conexao com a API
  async checkHealth(): Promise<boolean> {
    try {
      const healthUrl = import.meta.env.VITE_API_URL ? '/health' : 'http://localhost:3333/health';
      const res = await fetch(healthUrl);
      return res.ok;
    } catch {
      return false;
    }
  },
};
