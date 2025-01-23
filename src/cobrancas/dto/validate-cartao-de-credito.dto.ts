import { IsNotEmpty, IsString, Matches } from 'class-validator';

export default class ValidateCartaoDeCreditoDto {
  @IsString()
  @IsNotEmpty()
  nomeTitular: string;

  @IsString()
  @Matches(/^\d{16}$/)
  numero: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\d{4})-(\d{2})$/)
  validade: string;

  @IsString()
  @Matches(/^\d{3}$/)
  cvv: string;
}
