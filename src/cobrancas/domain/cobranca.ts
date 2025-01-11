export enum CobrancaStatus {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  FALHA = 'FALHA',
}

export default class Cobranca {
  id: number;
  status: CobrancaStatus;
  horaSolicitacao: string;
  horaFinalizacao: string;
  valor: number;
  ciclista: number;
}
