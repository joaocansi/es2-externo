import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import PagamentoService from './pagamento.service';
import ValidaCartaoDeCreditoDto from './dto/valida-cartao-de-credito.dto';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';

@Controller()
export default class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  @Post('cobranca')
  async createCobranca(@Body() createCobrancaDto: CreateCobrancaDto) {
    return this.pagamentoService.createCobranca(createCobrancaDto);
  }
  @Get('cobranca/:idCobranca')
  async getCobranca(@Param('idCobranca', ParseIntPipe) idCobranca: number) {
    return this.pagamentoService.getCobranca(idCobranca);
  }

  @Post('/validaCartaoDeCredito')
  async validaCartaoDeCredito(
    @Body() validaCartaoDeCreditoDto: ValidaCartaoDeCreditoDto,
  ) {
    return this.pagamentoService.validarCartaoDeCredito(
      validaCartaoDeCreditoDto,
    );
  }

  @Post('/filaCobranca')
  async filaCobranca(@Body() createCobrancaDto: CreateCobrancaDto) {
    return this.pagamentoService.filaCobranca(createCobrancaDto);
  }

  @Post('/processaCobrancasEmFila')
  async processaCobranca() {
    return this.pagamentoService.processaCobranca();
  }
}
