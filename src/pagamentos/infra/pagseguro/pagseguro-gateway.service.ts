import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import GatewayService, {
  CartaoDeCredito,
} from 'src/pagamentos/domain/gateway.service';

enum PagseguroPaymentStatus {
  AUTHORIZED = 'AUTHORIZED',
  DECLINED = 'DECLINED',
  PAID = 'PAID',
}

type PagseguroPaymentResponse = {
  id: string;
  status: PagseguroPaymentStatus;
};

@Injectable()
export default class PagseguroGatewayService implements GatewayService {
  constructor(
    @Inject('AxiosClient')
    private readonly axiosClient: AxiosInstance,
  ) {}

  async isCartaoDeCreditoValid(
    cartaoDeCredito: CartaoDeCredito,
  ): Promise<boolean> {
    const priceValidation = 100;
    const requestBody = this.createPaymentObject(
      cartaoDeCredito,
      priceValidation,
    );

    try {
      const response = await this.axiosClient.post('/charges', requestBody);
      const paymentResponse = this.processPaymentChargeResponse(response.data);
      await this.axiosClient.post(
        '/charges/' + paymentResponse.id + '/cancel',
        {
          amount: {
            value: priceValidation,
          },
        },
      );
      return true;
    } catch {
      return false;
    }
  }

  async createPayment(
    cartaoDeCredito: CartaoDeCredito,
    price: number,
  ): Promise<boolean> {
    const requestBody = this.createPaymentObject(cartaoDeCredito, price);
    try {
      const response = await this.axiosClient.post('/charges', requestBody);

      const paymentProcessed = this.processPaymentChargeResponse(response.data);
      if (paymentProcessed.status !== 'AUTHORIZED') throw new Error();

      return true;
    } catch {
      return false;
    }
  }

  createPaymentObject(cartaoDeCredito: CartaoDeCredito, price: number) {
    const exp = cartaoDeCredito.validade.split('/');
    const requestBody = {
      reference_id: 'ex-00001',
      description: 'Motivo do pagamento',
      amount: {
        value: price,
        currency: 'BRL',
      },
      payment_method: {
        type: 'CREDIT_CARD',
        installments: 1,
        capture: false,
        card: {
          number: cartaoDeCredito.numero,
          exp_month: exp[0],
          exp_year: exp[1],
          security_code: cartaoDeCredito.cvv,
          holder: {
            name: cartaoDeCredito.nomeTitular,
          },
        },
      },
    };
    return requestBody;
  }

  processPaymentChargeResponse(data: any): PagseguroPaymentResponse {
    if (!data.id || !data.status) return null;
    return {
      id: data.id,
      status: data.status,
    };
  }
}
