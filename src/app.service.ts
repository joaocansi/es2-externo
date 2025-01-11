import { Inject } from '@nestjs/common';
import { MailerService } from './email/domain/mailer-service';
import { DataSource } from 'typeorm';
import { TypeormCobrancaEntity } from './cobrancas/infra/typeorm/typeorm-cobranca.entity';
import { CobrancaStatus } from './cobrancas/domain/cobranca';

export default class AppService {
  constructor(
    @Inject('MailerService')
    private readonly mailerService: MailerService,
    @Inject('DataSource')
    private readonly dataSource: DataSource,
  ) {}

  async restoreDatabase() {
    await this.dataSource.query('DELETE FROM cobrancas');
    await this.dataSource.query(
      'UPDATE sqlite_sequence SET seq = 0 WHERE name = "cobrancas"',
    );
    await this.mailerService.deleteAll();

    const cobrancasRepository = this.dataSource.getRepository(
      TypeormCobrancaEntity,
    );

    const horaSolicitacao = new Date();
    await cobrancasRepository.save({
      status: CobrancaStatus.PENDENTE,
      horaSolicitacao,
      valor: 10,
      ciclista: 3,
    });
    await cobrancasRepository.save({
      status: CobrancaStatus.FALHA,
      horaSolicitacao,
      valor: 25.5,
      ciclista: 4,
    });
  }
}
