export class CartaoDeCreditoService {
  getCartaoDeCredito(idCiclista: number) {
    console.log(idCiclista);
    return {
      nomeTitular: 'Fulano de Tal',
      numero: '4539620659922097',
      cvv: '123',
      validade: '12/2026',
    };
  }
}
