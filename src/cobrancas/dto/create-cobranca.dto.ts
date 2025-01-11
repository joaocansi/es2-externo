import { IsNumber, Min } from 'class-validator';

export class CreateCobrancaDto {
  @IsNumber()
  @Min(0.01)
  valor: number;
  @IsNumber()
  ciclista: number;
}
