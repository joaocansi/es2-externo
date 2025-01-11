import { Module } from '@nestjs/common';
import CobrancaService from './cobranca.service';
import CobrancaController from './cobranca.controller';
import { DataSource } from 'typeorm';
import { TypeormCobrancaRepository } from './infra/typeorm/typeorm-cobranca-repository';
import { TypeormCobrancaEntity } from './infra/typeorm/typeorm-cobranca.entity';
import PagseguroGatewayService from './infra/pagseguro/pagseguro-gateway.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import AluguelMicrosservice from 'src/common/integrations/aluguel.microsservice';

const cobrancaService = {
  provide: 'CobrancaService',
  useClass: CobrancaService,
};

const aluguelMicrosservice = {
  provide: 'AluguelMicrosservice',
  useFactory: (configService: ConfigService) => {
    const client = axios.create({
      baseURL: configService.get('ALUGUEL_MICROSSERVICE_URL'),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return new AluguelMicrosservice(client);
  },
  inject: [ConfigService],
};

const cobrancaRepository = {
  provide: 'CobrancaRepository',
  useFactory: (dataSource: DataSource) => {
    return new TypeormCobrancaRepository(
      dataSource.getRepository(TypeormCobrancaEntity),
    );
  },
  inject: ['DataSource'],
};

const gatewayService = {
  provide: 'GatewayService',
  useFactory: (configService: ConfigService) => {
    const client = axios.create({
      baseURL: configService.get('PAGSEGURO_URL'),
      headers: {
        'Content-Type': 'application/json',
        Authorization: configService.get('PAGSEGURO_AUTHORIZATION'),
      },
    });
    return new PagseguroGatewayService(client);
  },
  inject: [ConfigService],
};

@Module({
  providers: [
    cobrancaService,
    aluguelMicrosservice,
    cobrancaRepository,
    gatewayService,
  ],
  controllers: [CobrancaController],
  exports: [
    gatewayService.provide,
    cobrancaRepository.provide,
    aluguelMicrosservice.provide,
  ],
})
export default class CobrancaModule {}
