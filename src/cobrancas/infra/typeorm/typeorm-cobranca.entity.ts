import { CobrancaStatus } from 'src/cobrancas/domain/cobranca';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cobrancas')
export class TypeormCobrancaEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar' })
  status: CobrancaStatus;
  @Column()
  horaSolicitacao: Date;
  @Column({ nullable: true })
  horaFinalizacao: Date;
  @Column({ type: 'float' })
  valor: number;
  @Column()
  ciclista: number;
}
