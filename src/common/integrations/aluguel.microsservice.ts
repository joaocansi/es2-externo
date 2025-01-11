import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { CartaoDeCredito } from 'src/common/domain/cartao-de-credito';

export type MicrosserviceError = {
  mensagem: string;
  status: string;
};

@Injectable()
export default class AluguelMicrosservice {
  constructor(private client: AxiosInstance) {}

  async retrieveCartaoDeCredito(ciclistaId: number): Promise<CartaoDeCredito> {
    try {
      const response = await this.client.get('/cartaoDeCredito/' + ciclistaId);
      return response.data as CartaoDeCredito;
    } catch (error) {
      if (error.response)
        throw new HttpException(
          error.response.data.mensagem,
          Number(error.response.data.codigo),
        );
      throw new InternalServerErrorException('Erro interno no servidor');
    }
  }
}
