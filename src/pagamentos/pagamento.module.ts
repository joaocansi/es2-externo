import { Module } from '@nestjs/common';
import PagamentoService from './pagamento.service';
import PagamentoController from './pagamento.controller';
import { DataSource } from 'typeorm';
import { TypeormCobrancaRepository } from './infra/typeorm/typeorm-cobranca-repository';
import { TypeormCobrancaEntity } from './infra/typeorm/typeorm-cobranca.entity';
import PagseguroGatewayService from './infra/pagseguro/pagseguro-gateway.service';
import axios, { AxiosInstance } from 'axios';
import { CartaoDeCreditoService } from 'src/common/utils/cartao-de-credito.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    PagamentoService,
    CartaoDeCreditoService,
    {
      provide: 'CobrancaRepository',
      useFactory: (dataSource: DataSource) => {
        return new TypeormCobrancaRepository(
          dataSource.getRepository(TypeormCobrancaEntity),
        );
      },
      inject: [DataSource],
    },
    {
      provide: 'AxiosClient',
      useFactory: (configService: ConfigService) => {
        return axios.create({
          baseURL: configService.get('pagseguroUrl'),
          headers: {
            'Content-Type': 'application/json',
            Authorization: configService.get('pagseguroAuthorization'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'GatewayService',
      useFactory: (axiosClient: AxiosInstance) => {
        return new PagseguroGatewayService(axiosClient);
      },
      inject: ['AxiosClient'],
    },
  ],
  controllers: [PagamentoController],
})
export default class PagamentoModule {}
