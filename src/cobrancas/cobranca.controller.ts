import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import ValidateCartaoDeCreditoDto from './dto/validate-cartao-de-credito.dto';
import Cobranca from './domain/cobranca';
import CobrancaService from './cobranca.service';

@Controller()
export default class CobrancaController {
  constructor(
    @Inject('CobrancaService')
    private readonly cobrancaService: CobrancaService,
  ) {}

  @Post('cobranca')
  async createCobranca(@Body() createCobrancaDto: CreateCobrancaDto) {
    return this.cobrancaService.createCobranca(createCobrancaDto);
  }
  @Get('cobranca/:idCobranca')
  async getCobranca(@Param('idCobranca', ParseIntPipe) idCobranca: number) {
    return this.cobrancaService.getCobranca(idCobranca);
  }

  @Post('/validaCartaoDeCredito')
  async validateCartaoDeCredito(
    @Body() validateCartaoDeCreditoDto: ValidateCartaoDeCreditoDto,
  ) {
    return this.cobrancaService.validateCartaoDeCredito(
      validateCartaoDeCreditoDto,
    );
  }

  @Post('/filaCobranca')
  async queueCobranca(
    @Body() createCobrancaDto: CreateCobrancaDto,
  ): Promise<Cobranca> {
    return this.cobrancaService.queueCobranca(createCobrancaDto);
  }

  @Post('/processaCobrancasEmFila')
  @HttpCode(200)
  async processCobranca(): Promise<Cobranca[]> {
    return this.cobrancaService.processCobranca();
  }
}
