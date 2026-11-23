export type TipoPrioridade = 'GERAL' | 'PRIORITARIA';

export type StatusSenha = 
  | 'AGUARDANDO' 
  | 'CHAMANDO' 
  | 'EM_ATENDIMENTO' 
  | 'FINALIZADA' 
  | 'AUSENTE';

export interface Servico {
  id: string;
  nome: string;
  sigla: string;
  tempoMedio: number;
  ativo: boolean;
  createdAt: string;
}

export interface Guiche {
  id: string;
  numero: number;
  nome: string;
  ativo: boolean;
}

export interface Senha {
  id: string;
  codigo: string;
  numeroSequencial: number;
  tipoPrioridade: TipoPrioridade;
  status: StatusSenha;
  servicoId: string;
  servico?: Servico;
  createdAt: string;
  chamadaEm?: string;
}
