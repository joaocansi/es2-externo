import Cobranca, { CobrancaStatus } from './cobranca';

export class CobrancaEntity {
  static toDomain(cobrancaEntity: CobrancaEntity) {
    const cobranca = new Cobranca();
    cobranca.id = cobrancaEntity.id;
    cobranca.status = cobrancaEntity.status;
    cobranca.horaSolicitacao = cobrancaEntity.horaSolicitacao.toISOString();
    if (cobrancaEntity.horaFinalizacao)
      cobranca.horaFinalizacao = cobrancaEntity.horaFinalizacao.toISOString();
    else cobranca.horaFinalizacao = '';
    cobranca.valor = cobrancaEntity.valor;
    cobranca.ciclista = cobrancaEntity.ciclista;
    return cobranca;
  }
  id: number;
  status: CobrancaStatus;
  horaSolicitacao: Date;
  horaFinalizacao: Date;
  valor: number;
  ciclista: number;
}
