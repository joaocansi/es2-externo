import { Test, TestingModule } from '@nestjs/testing';
import Cobranca, { CobrancaStatus } from './domain/cobranca';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import CobrancaController from './cobranca.controller';
import CobrancaService from './cobranca.service';
import ValidaCartaoDeCreditoDto from './dto/validate-cartao-de-credito.dto';

describe('CobrancaController', () => {
  let cobrancaController: CobrancaController;
  let mockCobrancaService: CobrancaService;

  let cobranca: Cobranca;

  beforeEach(async () => {
    mockCobrancaService = {
      createCobranca: jest.fn(),
      getCobranca: jest.fn(),
      validateCartaoDeCredito: jest.fn(),
      queueCobranca: jest.fn(),
      processCobranca: jest.fn(),
    } as unknown as CobrancaService;

    cobranca = {
      id: 1,
      status: CobrancaStatus.PAGA,
      horaSolicitacao: new Date().toISOString(),
      horaFinalizacao: new Date().toISOString(),
      valor: 100,
      ciclista: 1,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CobrancaController],
      providers: [
        {
          provide: 'CobrancaService',
          useValue: mockCobrancaService,
        },
      ],
    }).compile();

    cobrancaController = module.get<CobrancaController>(CobrancaController);
  });

  describe('createCobranca', () => {
    it('should create a cobranca', async () => {
      const createCobrancaDto: CreateCobrancaDto = {
        ciclista: 1,
        valor: 20,
      };

      jest
        .spyOn(mockCobrancaService, 'createCobranca')
        .mockResolvedValue(cobranca);

      await expect(
        cobrancaController.createCobranca(createCobrancaDto),
      ).resolves.toBe(cobranca);

      expect(mockCobrancaService.createCobranca).toHaveBeenCalledWith(
        createCobrancaDto,
      );
    });
  });

  describe('getCobranca', () => {
    it('should return a cobranca by id', async () => {
      jest
        .spyOn(mockCobrancaService, 'getCobranca')
        .mockResolvedValue(cobranca);
      expect(await cobrancaController.getCobranca(1)).toBe(cobranca);
      expect(mockCobrancaService.getCobranca).toHaveBeenCalledWith(1);
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
        .spyOn(mockCobrancaService, 'validateCartaoDeCredito')
        .mockResolvedValue(undefined);

      await expect(
        cobrancaController.validateCartaoDeCredito(validaCartaoDeCreditoDto),
      ).resolves.toBeUndefined();
      expect(mockCobrancaService.validateCartaoDeCredito).toHaveBeenCalledWith(
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
        .spyOn(mockCobrancaService, 'queueCobranca')
        .mockResolvedValue(cobranca);

      await expect(
        cobrancaController.queueCobranca(filaCobrancaDto),
      ).resolves.toBe(cobranca);
      expect(mockCobrancaService.queueCobranca).toHaveBeenCalledWith(
        filaCobrancaDto,
      );
    });
  });

  describe('processaCobranca', () => {
    it('should process queued cobranca', async () => {
      cobranca.status = CobrancaStatus.PAGA;

      jest
        .spyOn(mockCobrancaService, 'processCobranca')
        .mockResolvedValue([cobranca]);

      await expect(cobrancaController.processCobranca()).resolves.toStrictEqual(
        [cobranca],
      );
      expect(mockCobrancaService.processCobranca).toHaveBeenCalled();
    });
  });
});
