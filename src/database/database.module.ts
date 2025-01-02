import { Global, Module } from '@nestjs/common';
import { TypeormCobrancaEntity } from 'src/pagamentos/infra/typeorm/typeorm-cobranca.entity';
import { DataSource } from 'typeorm';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        const dataSource = new DataSource({
          entities: [TypeormCobrancaEntity],
          type: 'sqlite',
          database: __dirname + '/../../db.sqlite',
          synchronize: true,
        });
        await dataSource.initialize();
        return dataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
