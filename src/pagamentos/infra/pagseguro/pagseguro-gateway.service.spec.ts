import { Test, TestingModule } from '@nestjs/testing';
import { AxiosInstance } from 'axios';
import { CartaoDeCredito } from 'src/pagamentos/domain/gateway.service';
import PagseguroGatewayService from './pagseguro-gateway.service';

describe('PagseguroGatewayService', () => {
  let service: PagseguroGatewayService;
  let axiosClient: AxiosInstance;

  beforeEach(async () => {
    // Mock do AxiosInstance
    axiosClient = {
      post: jest.fn(),
    } as unknown as AxiosInstance;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagseguroGatewayService,
        {
          provide: 'AxiosClient',
          useValue: axiosClient,
        },
      ],
    }).compile();

    service = module.get<PagseguroGatewayService>(PagseguroGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isCartaoDeCreditoValid', () => {
    it('should return true if payment is successfully validated', async () => {
      const cartaoDeCredito: CartaoDeCredito = {
        numero: '1234567812345678',
        validade: '12/25',
        cvv: '123',
        nomeTitular: 'John Doe',
      };

      // Simula a resposta bem-sucedida da requisição POST
      jest.spyOn(axiosClient, 'post').mockResolvedValueOnce({
        data: { id: 'charge-id', status: 'AUTHORIZED' },
      });
      jest.spyOn(axiosClient, 'post').mockResolvedValueOnce({ data: {} }); // Simula o cancelamento

      const result = await service.isCartaoDeCreditoValid(cartaoDeCredito);
      expect(result).toBe(true);
    });

    it('should return false if there is an error in payment validation', async () => {
      const cartaoDeCredito: CartaoDeCredito = {
        numero: '1234567812345678',
        validade: '12/25',
        cvv: '123',
        nomeTitular: 'John Doe',
      };

      jest
        .spyOn(axiosClient, 'post')
        .mockRejectedValueOnce(new Error('Request failed'));

      const result = await service.isCartaoDeCreditoValid(cartaoDeCredito);
      expect(result).toBe(false);
    });
  });

  describe('createPayment', () => {
    it('should return true if payment creation is successful', async () => {
      const cartaoDeCredito: CartaoDeCredito = {
        numero: '1234567812345678',
        validade: '12/25',
        cvv: '123',
        nomeTitular: 'John Doe',
      };

      // Simula a resposta bem-sucedida da requisição POST
      jest.spyOn(axiosClient, 'post').mockResolvedValueOnce({
        data: { id: 'charge-id', status: 'AUTHORIZED' },
      });

      const result = await service.createPayment(cartaoDeCredito, 100);
      expect(result).toBe(true);
    });

    it('should return false if payment creation fails', async () => {
      const cartaoDeCredito: CartaoDeCredito = {
        numero: '1234567812345678',
        validade: '12/25',
        cvv: '123',
        nomeTitular: 'John Doe',
      };

      // Simula a falha na requisição
      jest
        .spyOn(axiosClient, 'post')
        .mockRejectedValueOnce(new Error('Request failed'));

      const result = await service.createPayment(cartaoDeCredito, 100);
      expect(result).toBe(false);
    });
  });

  describe('processPaymentChargeResponse', () => {
    it('should return a valid payment response', () => {
      const responseData = { id: 'charge-id', status: 'AUTHORIZED' };

      const result = service.processPaymentChargeResponse(responseData);
      expect(result).toEqual({ id: 'charge-id', status: 'AUTHORIZED' });
    });

    it('should return null if response data is incomplete', () => {
      const result = service.processPaymentChargeResponse({});

      expect(result).toBeNull();
    });
  });
});
