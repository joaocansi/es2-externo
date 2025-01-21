import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import GatewayService, {
  CartaoDeCredito,
} from 'src/cobrancas/domain/gateway.service';

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
  constructor(private readonly pagseguroClient: AxiosInstance) {}

  async isCartaoDeCreditoValid(
    cartaoDeCredito: CartaoDeCredito,
  ): Promise<boolean> {
    const priceValidation = 100;
    const requestBody = this.createChargeObject(
      cartaoDeCredito,
      priceValidation,
    );

    try {
      const response = await this.pagseguroClient.post('/charges', requestBody);
      const paymentResponse = this.processPaymentChargeResponse(response.data);
      await this.pagseguroClient.post(
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

  async charge(
    cartaoDeCredito: CartaoDeCredito,
    price: number,
  ): Promise<boolean> {
    const requestBody = this.createChargeObject(cartaoDeCredito, price);

    try {
      const response = await this.pagseguroClient.post('/charges', requestBody);
      const paymentProcessed = this.processPaymentChargeResponse(response.data);
      if (paymentProcessed.status !== 'AUTHORIZED') return false;
      return true;
    } catch {
      return false;
    }
  }

  createChargeObject(cartaoDeCredito: CartaoDeCredito, price: number) {
    const exp = cartaoDeCredito.validade.split('-');
    const requestBody = {
      reference_id: 'ex-00001',
      description: 'Motivo do pagamento',
      amount: {
        value: price * 100,
        currency: 'BRL',
      },
      payment_method: {
        type: 'CREDIT_CARD',
        installments: 1,
        capture: false,
        card: {
          number: cartaoDeCredito.numero,
          exp_month: exp[1],
          exp_year: exp[0],
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
