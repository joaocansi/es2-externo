import { Test, TestingModule } from '@nestjs/testing';
import { AxiosInstance } from 'axios';
import PagseguroGatewayService from './pagseguro-gateway.service';
import { CartaoDeCredito } from 'src/common/domain/cartao-de-credito';

describe('PagseguroGatewayService', () => {
  let service: PagseguroGatewayService;
  let pagseguroClient: AxiosInstance;

  let cartaoDeCredito: CartaoDeCredito;

  beforeEach(async () => {
    cartaoDeCredito = {
      numero: '1234567812345678',
      validade: '12/25',
      cvv: '123',
      nomeTitular: 'John Doe',
    };

    pagseguroClient = {
      post: jest.fn(),
    } as unknown as AxiosInstance;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PagseguroGatewayService,
          useFactory: () => new PagseguroGatewayService(pagseguroClient),
        },
      ],
    }).compile();

    service = module.get<PagseguroGatewayService>(PagseguroGatewayService);
  });

  describe('isCartaoDeCreditoValid', () => {
    it('should return true if payment is successfully validated', async () => {
      jest.spyOn(pagseguroClient, 'post').mockResolvedValueOnce({
        data: { id: 'charge-id', status: 'AUTHORIZED' },
      });

      jest.spyOn(pagseguroClient, 'post').mockResolvedValueOnce({ data: {} });

      const result = await service.isCartaoDeCreditoValid(cartaoDeCredito);
      expect(result).toBe(true);
    });

    it('should return false if there is an error in payment validation', async () => {
      jest
        .spyOn(pagseguroClient, 'post')
        .mockRejectedValueOnce(new Error('Request failed'));

      const result = await service.isCartaoDeCreditoValid(cartaoDeCredito);
      expect(result).toBe(false);
    });
  });

  describe('charge', () => {
    it('should return true if payment creation is successful', async () => {
      jest.spyOn(pagseguroClient, 'post').mockResolvedValueOnce({
        data: { id: 'charge-id', status: 'AUTHORIZED' },
      });

      const result = await service.charge(cartaoDeCredito, 100);
      expect(result).toBe(true);
    });

    it('should return false if payment creation fails', async () => {
      jest.spyOn(pagseguroClient, 'post').mockResolvedValueOnce({
        data: { id: 'charge-id', status: 'UNAUTHORIZED' },
      });

      const result = await service.charge(cartaoDeCredito, 100);
      expect(result).toBe(false);
    });

    it('should return false if payment creation fails', async () => {
      jest
        .spyOn(pagseguroClient, 'post')
        .mockRejectedValueOnce(new Error('Request failed'));

      const result = await service.charge(cartaoDeCredito, 100);
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
