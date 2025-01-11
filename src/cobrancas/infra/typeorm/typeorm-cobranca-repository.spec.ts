import { Repository } from 'typeorm';
import { TypeormCobrancaEntity } from './typeorm-cobranca.entity';
import { CobrancaStatus } from 'src/cobrancas/domain/cobranca';
import { TypeormCobrancaRepository } from './typeorm-cobranca-repository';

describe('TypeormCobrancaRepository', () => {
  let repository: TypeormCobrancaRepository;
  let ormRepository: Repository<TypeormCobrancaEntity>;

  beforeEach(async () => {
    ormRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
    } as unknown as Repository<TypeormCobrancaEntity>;
    repository = new TypeormCobrancaRepository(ormRepository);
  });

  describe('save', () => {
    it('should save a cobranca entity and return it', async () => {
      const createCobranca = {
        status: CobrancaStatus.PAGA,
        valor: 100,
        ciclista: 1,
      };
      const cobrancaEntity = new TypeormCobrancaEntity();
      cobrancaEntity.id = 1;
      cobrancaEntity.status = CobrancaStatus.PAGA;
      cobrancaEntity.horaSolicitacao = new Date();
      cobrancaEntity.horaFinalizacao = new Date();
      cobrancaEntity.valor = createCobranca.valor;
      cobrancaEntity.ciclista = createCobranca.ciclista;
      jest.spyOn(ormRepository, 'save').mockResolvedValue(cobrancaEntity);

      const result = await repository.save(createCobranca);
      expect(ormRepository.save).toHaveBeenCalledWith({
        status: CobrancaStatus.PAGA,
        horaSolicitacao: expect.any(Date),
        horaFinalizacao: expect.any(Date),
        valor: createCobranca.valor,
        ciclista: createCobranca.ciclista,
      });

      expect(result).toEqual(cobrancaEntity);
    });

    it('should save a cobranca entity as PENDENTE and return it', async () => {
      const createCobranca = {
        status: CobrancaStatus.PENDENTE,
        valor: 100,
        ciclista: 1,
      };
      const cobrancaEntity = new TypeormCobrancaEntity();
      cobrancaEntity.id = 1;
      cobrancaEntity.status = CobrancaStatus.PENDENTE;
      cobrancaEntity.horaSolicitacao = new Date();
      cobrancaEntity.horaFinalizacao = new Date();
      cobrancaEntity.valor = createCobranca.valor;
      cobrancaEntity.ciclista = createCobranca.ciclista;
      jest.spyOn(ormRepository, 'save').mockResolvedValue(cobrancaEntity);

      const result = await repository.save(createCobranca);

      expect(result).toEqual(cobrancaEntity);
    });
  });

  describe('findById', () => {
    it('should find a cobranca entity by ID', async () => {
      const id = 1;
      const cobrancaEntity = new TypeormCobrancaEntity();
      cobrancaEntity.id = id;
      cobrancaEntity.status = CobrancaStatus.PAGA;
      cobrancaEntity.horaSolicitacao = new Date();
      cobrancaEntity.horaFinalizacao = new Date();
      cobrancaEntity.valor = 100;
      cobrancaEntity.ciclista = 1;

      jest.spyOn(ormRepository, 'findOne').mockResolvedValue(cobrancaEntity);
      const result = await repository.findById(id);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(cobrancaEntity);
    });

    it('should return null if no cobranca entity is found', async () => {
      const id = 1;
      jest.spyOn(ormRepository, 'findOne').mockResolvedValue(null);
      const result = await repository.findById(id);
      expect(result).toBeNull();
    });
  });
});
