import { Test, TestingModule } from '@nestjs/testing';
import PagamentoService from './pagamento.service';
import { CobrancaRepository } from './domain/cobranca.repository';
import { CobrancaEntity } from './domain/cobranca.entity';
import Cobranca, { CobrancaStatus } from './domain/cobranca';
import ValidaCartaoDeCreditoDto from './dto/valida-cartao-de-credito.dto';
import GatewayService, { CartaoDeCredito } from './domain/gateway.service';
import { AxiosInstance } from 'axios';
import { CartaoDeCreditoService } from 'src/common/utils/cartao-de-credito.service';

describe('PagamentoService', () => {
  let service: PagamentoService;
  let cobrancaRepositoryMock: CobrancaRepository;
  let cartaoDeCreditoServiceMock: CartaoDeCreditoService;
  let gatewayServiceMock: GatewayService;
  let axiosClient: Partial<AxiosInstance>;

  let cobrancaEntity: CobrancaEntity;
  let cobranca: Cobranca;

  let cartaoDeCredito: CartaoDeCredito;

  beforeEach(async () => {
    cobrancaRepositoryMock = {
      findById: jest.fn(),
      save: jest.fn(),
      getCobrancasPendentes: jest.fn(),
      update: jest.fn(),
    };

    gatewayServiceMock = {
      isCartaoDeCreditoValid: jest.fn(),
      createPayment: jest.fn(),
    };

    axiosClient = {
      post: jest.fn(),
    };

    cartaoDeCreditoServiceMock = {
      getCartaoDeCredito: jest.fn(),
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
        PagamentoService,
        {
          provide: CartaoDeCreditoService,
          useValue: cartaoDeCreditoServiceMock,
        },
        { provide: 'CobrancaRepository', useValue: cobrancaRepositoryMock },
        { provide: 'GatewayService', useValue: gatewayServiceMock },
        {
          provide: 'AxiosClient',
          useValue: axiosClient,
        },
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

  describe('validarCartaoDeCredito', () => {
    it('should validate cartao de credito', async () => {
      const validaCartaoDeCreditoDto: ValidaCartaoDeCreditoDto = {
        nomeTitular: 'John Doe',
        numero: '1234567890123456',
        validade: '12/24',
        cvv: '123',
      };

      const spyIsCartaoDeCreditoValido = jest
        .spyOn(gatewayServiceMock, 'isCartaoDeCreditoValid')
        .mockResolvedValue(true);

      await service.validarCartaoDeCredito(validaCartaoDeCreditoDto);

      expect(spyIsCartaoDeCreditoValido).toHaveBeenCalledWith(
        validaCartaoDeCreditoDto,
      );
    });

    it('should throw an error if validation failed', async () => {
      const validaCartaoDeCreditoDto: ValidaCartaoDeCreditoDto = {
        nomeTitular: 'John Doe',
        numero: '1234567890123456',
        validade: '12/24',
        cvv: '123',
      };

      jest
        .spyOn(gatewayServiceMock, 'isCartaoDeCreditoValid')
        .mockResolvedValue(false);

      await expect(
        service.validarCartaoDeCredito(validaCartaoDeCreditoDto),
      ).rejects.toThrow(
        new Error('Não foi possível validar cartão de crédito'),
      );
    });
  });

  describe('processaCobranca', () => {
    it('should process queued cobrancas', async () => {
      jest
        .spyOn(cobrancaRepositoryMock, 'getCobrancasPendentes')
        .mockResolvedValue([cobrancaEntity]);

      jest
        .spyOn(cartaoDeCreditoServiceMock, 'getCartaoDeCredito')
        .mockReturnValue(cartaoDeCredito);

      jest.spyOn(gatewayServiceMock, 'createPayment').mockResolvedValue(true);
      jest.spyOn(cobrancaRepositoryMock, 'update').mockResolvedValue();

      const result = await service.processaCobranca();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(CobrancaStatus.PAGA);
    });

    it('should ignore cobrancas not paid', async () => {
      jest
        .spyOn(cobrancaRepositoryMock, 'getCobrancasPendentes')
        .mockResolvedValue([cobrancaEntity]);

      jest
        .spyOn(cartaoDeCreditoServiceMock, 'getCartaoDeCredito')
        .mockReturnValue(cartaoDeCredito);

      jest.spyOn(gatewayServiceMock, 'createPayment').mockResolvedValue(false);

      const result = await service.processaCobranca();

      expect(result).toHaveLength(0);
      expect(cobrancaRepositoryMock.update).not.toHaveBeenCalled();
    });
  });
});
