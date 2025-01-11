import {
  CobrancaRepository,
  CreateCobranca,
  UpdateCobranca,
} from 'src/cobrancas/domain/cobranca.repository';
import { TypeormCobrancaEntity } from './typeorm-cobranca.entity';
import { Equal, Or, Repository } from 'typeorm';
import { CobrancaEntity } from 'src/cobrancas/domain/cobranca.entity';
import { CobrancaStatus } from 'src/cobrancas/domain/cobranca';

export class TypeormCobrancaRepository implements CobrancaRepository {
  constructor(
    private readonly ormRepository: Repository<TypeormCobrancaEntity>,
  ) {}

  async update(id: number, cobranca: UpdateCobranca): Promise<void> {
    await this.ormRepository.update(id, cobranca);
  }

  async getCobrancasToBePaid(): Promise<CobrancaEntity[]> {
    return this.ormRepository.find({
      where: {
        status: Or(Equal(CobrancaStatus.PENDENTE), Equal(CobrancaStatus.FALHA)),
      },
    });
  }

  async save(cobranca: CreateCobranca): Promise<CobrancaEntity> {
    const cobrancaEntity = await this.ormRepository.save({
      status: cobranca.status,
      horaSolicitacao: new Date(),
      horaFinalizacao:
        cobranca.status == CobrancaStatus.PAGA ? new Date() : null,
      valor: cobranca.valor,
      ciclista: cobranca.ciclista,
    });
    return cobrancaEntity;
  }

  async findById(id: number): Promise<CobrancaEntity> {
    return this.ormRepository.findOne({ where: { id } });
  }
}
