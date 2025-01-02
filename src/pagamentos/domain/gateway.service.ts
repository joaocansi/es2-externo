export type CartaoDeCredito = {
  numero: string;
  validade: string;
  nomeTitular: string;
  cvv: string;
};

export default interface GatewayService {
  isCartaoDeCreditoValid(cartaoDeCredito: CartaoDeCredito): Promise<boolean>;
  createPayment(
    cartaoDeCredito: CartaoDeCredito,
    price: number,
  ): Promise<boolean>;
}
