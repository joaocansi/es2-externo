export enum CobrancaStatus {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  CANCELADA = 'CANCELADA',
}

export default class Cobranca {
  id: number;
  status: CobrancaStatus;
  horaSolicitacao: string;
  horaFinalizacao: string;
  valor: number;
  ciclista: number;
}
