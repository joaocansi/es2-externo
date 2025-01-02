import { CobrancaStatus } from './cobranca';
import { CobrancaEntity } from './cobranca.entity';

describe('CobrancaEntity', () => {
  it('should correctly map CobrancaEntity to Cobranca domain object', () => {
    // Dados de entrada simulados
    const cobrancaEntity = new CobrancaEntity();
    cobrancaEntity.id = 1;
    cobrancaEntity.status = CobrancaStatus.PENDENTE; // Supondo que PENDENTE seja um valor válido do enum CobrancaStatus
    cobrancaEntity.horaSolicitacao = new Date('2024-12-01T10:00:00Z');
    cobrancaEntity.horaFinalizacao = new Date('2024-12-01T12:00:00Z');
    cobrancaEntity.valor = 100.5;
    cobrancaEntity.ciclista = 123;

    // Chamando o método toDomain
    const cobranca = CobrancaEntity.toDomain(cobrancaEntity);

    // Verificando se o mapeamento é feito corretamente
    expect(cobranca.id).toBe(cobrancaEntity.id);
    expect(cobranca.status).toBe(cobrancaEntity.status);
    expect(cobranca.valor).toBe(cobrancaEntity.valor);
    expect(cobranca.ciclista).toBe(cobrancaEntity.ciclista);
    expect(cobranca.horaSolicitacao).toBe(
      cobrancaEntity.horaSolicitacao.toISOString(),
    );
    expect(cobranca.horaFinalizacao).toBe(
      cobrancaEntity.horaFinalizacao.toISOString(),
    );
  });
});
