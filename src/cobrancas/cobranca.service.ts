import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CobrancaRepository } from './domain/cobranca.repository';
import { CobrancaEntity } from './domain/cobranca.entity';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import Cobranca, { CobrancaStatus } from './domain/cobranca';
import GatewayService from './domain/gateway.service';
import AluguelMicrosservice from 'src/common/integrations/aluguel.microsservice';
import ValidateCartaoDeCreditoDto from './dto/validate-cartao-de-credito.dto';

@Injectable()
export default class CobrancaService {
  constructor(
    @Inject('GatewayService')
    private readonly gatewayService: GatewayService,
    @Inject('CobrancaRepository')
    private readonly cobrancaRepository: CobrancaRepository,
    @Inject('AluguelMicrosservice')
    private readonly aluguelMicrosservice: AluguelMicrosservice,
  ) {}

  async processCobranca(): Promise<Cobranca[]> {
    const cobrancasPagas: Cobranca[] = [];
    const cobrancasToBePaid =
      await this.cobrancaRepository.getCobrancasToBePaid();

    for (const cobranca of cobrancasToBePaid) {
      const cartaoDeCredito =
        await this.aluguelMicrosservice.retrieveCartaoDeCredito(
          cobranca.ciclista,
        );

      const resultCobranca = await this.gatewayService.charge(
        cartaoDeCredito,
        cobranca.valor,
      );

      if (!resultCobranca) {
        continue;
      }

      cobranca.status = CobrancaStatus.PAGA;
      cobranca.horaFinalizacao = new Date();
      await this.cobrancaRepository.update(cobranca.id, cobranca);
      cobrancasPagas.push(CobrancaEntity.toDomain(cobranca));
    }

    return cobrancasPagas;
  }

  async queueCobranca(createCobrancaDto: CreateCobrancaDto): Promise<Cobranca> {
    const cobranca = await this.cobrancaRepository.save({
      ...createCobrancaDto,
      status: CobrancaStatus.PENDENTE,
    });
    return CobrancaEntity.toDomain(cobranca);
  }

  async getCobranca(idCobranca: number) {
    const cobranca = await this.cobrancaRepository.findById(idCobranca);
    if (!cobranca) throw new NotFoundException('Cobranca não encontrada');
    return CobrancaEntity.toDomain(cobranca);
  }

  async createCobranca(createCobrancaDto: CreateCobrancaDto) {
    const cartaoDeCredito =
      await this.aluguelMicrosservice.retrieveCartaoDeCredito(
        createCobrancaDto.ciclista,
      );

    const resultadoCobranca = await this.gatewayService.charge(
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

  async validateCartaoDeCredito(
    validateCartaoDeCreditoDto: ValidateCartaoDeCreditoDto,
  ) {
    const validationResult = await this.gatewayService.isCartaoDeCreditoValid(
      validateCartaoDeCreditoDto,
    );

    if (!validationResult) {
      throw new BadRequestException(
        'Não foi possível validar cartão de crédito',
      );
    }
  }
}
