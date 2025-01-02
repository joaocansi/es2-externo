import { Test, TestingModule } from '@nestjs/testing';
import Cobranca, { CobrancaStatus } from './domain/cobranca';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import PagamentoController from './pagamento.controller';
import PagamentoService from './pagamento.service';
import ValidaCartaoDeCreditoDto from './dto/valida-cartao-de-credito.dto';

describe('PagamentoController', () => {
  let pagamentoController: PagamentoController;
  let mockPagamentoService: PagamentoService;

  let cobranca: Cobranca;

  beforeEach(async () => {
    mockPagamentoService = {
      createCobranca: jest.fn(),
      getCobranca: jest.fn(),
      validarCartaoDeCredito: jest.fn(),
      filaCobranca: jest.fn(),
      processaCobranca: jest.fn(),
    } as unknown as PagamentoService;

    cobranca = {
      id: 1,
      status: CobrancaStatus.PAGA,
      horaSolicitacao: new Date().toISOString(),
      horaFinalizacao: new Date().toISOString(),
      valor: 100,
      ciclista: 1,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagamentoController],
      providers: [
        {
          provide: PagamentoService,
          useValue: mockPagamentoService,
        },
      ],
    }).compile();

    pagamentoController = module.get<PagamentoController>(PagamentoController);
  });

  describe('createCobranca', () => {
    it('should create a cobranca', async () => {
      const createCobrancaDto: CreateCobrancaDto = {
        ciclista: 1,
        valor: 20,
      };

      jest
        .spyOn(mockPagamentoService, 'createCobranca')
        .mockResolvedValue(cobranca);

      await expect(
        pagamentoController.createCobranca(createCobrancaDto),
      ).resolves.toBe(cobranca);

      expect(mockPagamentoService.createCobranca).toHaveBeenCalledWith(
        createCobrancaDto,
      );
    });
  });

  describe('getCobranca', () => {
    it('should return a cobranca by id', async () => {
      jest
        .spyOn(mockPagamentoService, 'getCobranca')
        .mockResolvedValue(cobranca);
      expect(await pagamentoController.getCobranca(1)).toBe(cobranca);
      expect(mockPagamentoService.getCobranca).toHaveBeenCalledWith(1);
    });
  });

  describe('validaCartaoDeCredito', () => {
    it('should validate the credit card', async () => {
      const validaCartaoDeCreditoDto: ValidaCartaoDeCreditoDto = {
        cvv: '123',
        nomeTitular: 'João',
        numero: '1234123412341234',
        validade: '11/26',
      };

      jest
        .spyOn(mockPagamentoService, 'validarCartaoDeCredito')
        .mockResolvedValue(undefined);

      await expect(
        pagamentoController.validaCartaoDeCredito(validaCartaoDeCreditoDto),
      ).resolves.toBeUndefined();
      expect(mockPagamentoService.validarCartaoDeCredito).toHaveBeenCalledWith(
        validaCartaoDeCreditoDto,
      );
    });
  });

  describe('filaCobranca', () => {
    it('should add a cobranca to queue', async () => {
      cobranca.status = CobrancaStatus.PENDENTE;
      const filaCobrancaDto: CreateCobrancaDto = {
        ciclista: 1,
        valor: 10,
      };

      jest
        .spyOn(mockPagamentoService, 'filaCobranca')
        .mockResolvedValue(cobranca);

      await expect(
        pagamentoController.filaCobranca(filaCobrancaDto),
      ).resolves.toBe(cobranca);
      expect(mockPagamentoService.filaCobranca).toHaveBeenCalledWith(
        filaCobrancaDto,
      );
    });
  });

  describe('processaCobranca', () => {
    it('should process queued cobranca', async () => {
      cobranca.status = CobrancaStatus.PAGA;

      jest
        .spyOn(mockPagamentoService, 'processaCobranca')
        .mockResolvedValue([cobranca]);

      await expect(
        pagamentoController.processaCobranca(),
      ).resolves.toStrictEqual([cobranca]);
      expect(mockPagamentoService.processaCobranca).toHaveBeenCalled();
    });
  });
});
