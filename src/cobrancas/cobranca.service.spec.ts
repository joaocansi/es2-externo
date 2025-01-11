import { Test, TestingModule } from '@nestjs/testing';
import { CobrancaRepository } from './domain/cobranca.repository';
import { CobrancaEntity } from './domain/cobranca.entity';
import PagamentoService from './cobranca.service';
import Cobranca, { CobrancaStatus } from './domain/cobranca';
import GatewayService, { CartaoDeCredito } from './domain/gateway.service';
import AluguelMicrosservice from 'src/common/integrations/aluguel.microsservice';
import CobrancaService from './cobranca.service';
import ValidateCartaoDeCreditoDto from './dto/validate-cartao-de-credito.dto';

describe('CobrancaService', () => {
  let service: PagamentoService;
  let cobrancaRepositoryMock: CobrancaRepository;
  let gatewayServiceMock: GatewayService;
  let aluguelMicrosservice: AluguelMicrosservice;

  let cobrancaEntity: CobrancaEntity;
  let cobranca: Cobranca;

  let cartaoDeCredito: CartaoDeCredito;

  beforeEach(async () => {
    aluguelMicrosservice = {
      retrieveCartaoDeCredito: jest.fn(),
    } as unknown as AluguelMicrosservice;

    cobrancaRepositoryMock = {
      findById: jest.fn(),
      save: jest.fn(),
      getCobrancasToBePaid: jest.fn(),
      update: jest.fn(),
    };

    gatewayServiceMock = {
      isCartaoDeCreditoValid: jest.fn(),
      charge: jest.fn(),
    };

    cartaoDeCredito = {
      numero: '1234567890123456',
      cvv: '123',
      nomeTitular: 'Joao',
      validade: '11/26',
    };

    cobrancaEntity = {
      ciclista: 1,
      horaFinalizacao: new Date(),
      horaSolicitacao: new Date(),
      id: 1,
      status: CobrancaStatus.PAGA,
      valor: 20,
    };

    cobranca = CobrancaEntity.toDomain(cobrancaEntity);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CobrancaService,
        { provide: 'AluguelMicrosservice', useValue: aluguelMicrosservice },
        { provide: 'CobrancaRepository', useValue: cobrancaRepositoryMock },
        { provide: 'GatewayService', useValue: gatewayServiceMock },
      ],
    }).compile();

    service = module.get<PagamentoService>(PagamentoService);
  });

  describe('getCobranca', () => {
    it('deve retornar uma cobrança quando encontrada', async () => {
      jest
        .spyOn(cobrancaRepositoryMock, 'findById')
        .mockResolvedValue(cobrancaEntity);

      const result = await service.getCobranca(cobrancaEntity.id);
      expect(result).toEqual(cobranca);
    });

    it('deve lançar erro quando cobrança não for encontrada', async () => {
      jest.spyOn(cobrancaRepositoryMock, 'findById').mockResolvedValue(null);

      await expect(service.getCobranca(1)).rejects.toThrow(
        'Cobranca não encontrada',
      );
    });
  });

  describe('createCobranca', () => {
    it('should create a new cobrança', async () => {
      const createCobrancaDto = { valor: 100, ciclista: 1 };
      cobrancaEntity.status = CobrancaStatus.PENDENTE;

      jest
        .spyOn(cobrancaRepositoryMock, 'save')
        .mockResolvedValue(cobrancaEntity);

      const result = await service.createCobranca(createCobrancaDto);
      expect(result).toEqual(CobrancaEntity.toDomain(cobrancaEntity));
    });
  });

  describe('validaCartaoDeCredito', () => {
    it('should validate cartao de credito', async () => {
      const validateCartaoDeCreditoDto: ValidateCartaoDeCreditoDto = {
        nomeTitular: 'John Doe',
        numero: '1234567890123456',
        validade: '12/24',
        cvv: '123',
      };

      const spyIsCartaoDeCreditoValido = jest
        .spyOn(gatewayServiceMock, 'isCartaoDeCreditoValid')
        .mockResolvedValue(true);

      await service.validateCartaoDeCredito(validateCartaoDeCreditoDto);

      expect(spyIsCartaoDeCreditoValido).toHaveBeenCalledWith(
        validateCartaoDeCreditoDto,
      );
    });

    it('should throw an error if validation failed', async () => {
      const validateCartaoDeCreditoDto: ValidateCartaoDeCreditoDto = {
        nomeTitular: 'John Doe',
        numero: '1234567890123456',
        validade: '12/24',
        cvv: '123',
      };

      jest
        .spyOn(gatewayServiceMock, 'isCartaoDeCreditoValid')
        .mockResolvedValue(false);

      await expect(
        service.validateCartaoDeCredito(validateCartaoDeCreditoDto),
      ).rejects.toThrow(
        new Error('Não foi possível validar cartão de crédito'),
      );
    });
  });

  describe('processaCobranca', () => {
    it('should process queued cobrancas', async () => {
      jest
        .spyOn(cobrancaRepositoryMock, 'getCobrancasToBePaid')
        .mockResolvedValue([cobrancaEntity]);

      jest
        .spyOn(aluguelMicrosservice, 'retrieveCartaoDeCredito')
        .mockResolvedValue(cartaoDeCredito);

      jest.spyOn(gatewayServiceMock, 'charge').mockResolvedValue(true);
      jest.spyOn(cobrancaRepositoryMock, 'update').mockResolvedValue();

      const result = await service.processCobranca();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(CobrancaStatus.PAGA);
    });

    it('should ignore cobrancas not paid', async () => {
      jest
        .spyOn(cobrancaRepositoryMock, 'getCobrancasToBePaid')
        .mockResolvedValue([cobrancaEntity]);

      jest
        .spyOn(aluguelMicrosservice, 'retrieveCartaoDeCredito')
        .mockResolvedValue(cartaoDeCredito);

      jest.spyOn(gatewayServiceMock, 'charge').mockResolvedValue(false);

      const result = await service.processCobranca();

      expect(result).toHaveLength(0);
      expect(cobrancaRepositoryMock.update).not.toHaveBeenCalled();
    });
  });
});
