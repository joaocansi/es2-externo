import AluguelMicrosservice from './aluguel.microsservice';
import { AxiosError, AxiosInstance } from 'axios';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { CartaoDeCredito } from '../domain/cartao-de-credito';

describe('AluguelMicrosservice', () => {
  let service: AluguelMicrosservice;
  let axiosInstance: AxiosInstance;

  let mockCartao: CartaoDeCredito;
  let mockCiclista: number;

  beforeEach(() => {
    mockCiclista = 123;
    mockCartao = {
      nomeTitular: 'teste',
      numero: '1234 5678 9012 3456',
      validade: '12/25',
      cvv: '123',
    };

    axiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
    } as unknown as AxiosInstance;

    service = new AluguelMicrosservice(axiosInstance);
  });

  it('should retrieve CartaoDeCredito on successful API call', async () => {
    jest.spyOn(axiosInstance, 'get').mockResolvedValue({ data: mockCartao });
    const result = await service.retrieveCartaoDeCredito(mockCiclista);
    expect(result).toEqual(mockCartao);
  });

  it('should throw HttpException with response message and status on API error', async () => {
    const ciclistaId = 123;
    const mockErrorResponse = {
      mensagem: 'Cartão de crédito não encontrado',
      status: '404',
    };

    const mockAxiosError = {
      response: { data: mockErrorResponse },
    } as AxiosError;

    jest.spyOn(axiosInstance, 'get').mockRejectedValue(mockAxiosError);

    await expect(service.retrieveCartaoDeCredito(ciclistaId)).rejects.toThrow(
      new HttpException(
        mockErrorResponse.mensagem,
        Number(mockErrorResponse.status),
      ),
    );
  });

  it('should throw InternalServerErrorException on network error', async () => {
    const ciclistaId = 123;
    jest.spyOn(axiosInstance, 'get').mockRejectedValue({});

    await expect(service.retrieveCartaoDeCredito(ciclistaId)).rejects.toThrow(
      new InternalServerErrorException('Erro interno no servidor'),
    );
  });
});
