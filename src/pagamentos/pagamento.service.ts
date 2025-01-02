import { Inject, Injectable } from '@nestjs/common';
import { CobrancaRepository } from './domain/cobranca.repository';
import { CobrancaEntity } from './domain/cobranca.entity';
import ValidaCartaoDeCreditoDto from './dto/valida-cartao-de-credito.dto';
import GatewayService from './domain/gateway.service';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { CobrancaStatus } from './domain/cobranca';
import { CartaoDeCreditoService } from 'src/common/utils/cartao-de-credito.service';

@Injectable()
export default class PagamentoService {
  constructor(
    @Inject('CobrancaRepository')
    private readonly cobrancaRepository: CobrancaRepository,
    @Inject('GatewayService')
    private readonly gatewayService: GatewayService,
    private readonly cartaoDeCreditoService: CartaoDeCreditoService,
  ) {}
  async processaCobranca() {
    const cobrancasPagas = [];
    const cobrancasPendentes =
      await this.cobrancaRepository.getCobrancasPendentes();

    for (const cobranca of cobrancasPendentes) {
      const cartaoDeCredito = this.cartaoDeCreditoService.getCartaoDeCredito(
        cobranca.ciclista,
      );

      const resultadoCobranca = await this.gatewayService.createPayment(
        cartaoDeCredito,
        cobranca.valor,
      );

      if (!resultadoCobranca) {
        continue;
      }

      cobranca.status = CobrancaStatus.PAGA;
      cobranca.horaFinalizacao = new Date();
      await this.cobrancaRepository.update(cobranca.id, cobranca);
      cobrancasPagas.push(CobrancaEntity.toDomain(cobranca));
    }

    return cobrancasPagas;
  }

  async filaCobranca(createCobrancaDto: CreateCobrancaDto) {
    const cobranca = await this.cobrancaRepository.save({
      ...createCobrancaDto,
      status: CobrancaStatus.PENDENTE,
    });
    return CobrancaEntity.toDomain(cobranca);
  }

  async getCobranca(idCobranca: number) {
    const cobranca = await this.cobrancaRepository.findById(idCobranca);
    if (!cobranca) {
      throw new AppError(
        'Cobranca não encontrada',
        AppErrorType.RESOURCE_NOT_FOUND,
      );
    }
    return CobrancaEntity.toDomain(cobranca);
  }

  async createCobranca(createCobrancaDto: CreateCobrancaDto) {
    const cartaoDeCredito = this.cartaoDeCreditoService.getCartaoDeCredito(
      createCobrancaDto.ciclista,
    );

    const resultadoCobranca = await this.gatewayService.createPayment(
      cartaoDeCredito,
      createCobrancaDto.valor,
    );

    if (!resultadoCobranca) {
      const cobranca = await this.cobrancaRepository.save({
        ...createCobrancaDto,
        status: CobrancaStatus.PENDENTE,
      });
      return CobrancaEntity.toDomain(cobranca);
    }

    const cobranca = await this.cobrancaRepository.save({
      ...createCobrancaDto,
      status: CobrancaStatus.PAGA,
    });
    return CobrancaEntity.toDomain(cobranca);
  }

  async validarCartaoDeCredito(
    validaCartaoDeCreditoDto: ValidaCartaoDeCreditoDto,
  ) {
    const validationResult = await this.gatewayService.isCartaoDeCreditoValid(
      validaCartaoDeCreditoDto,
    );

    if (!validationResult) {
      throw new AppError(
        'Não foi possível validar cartão de crédito',
        AppErrorType.EXTERNAL_SERVICE_ERROR,
      );
    }
  }
}
