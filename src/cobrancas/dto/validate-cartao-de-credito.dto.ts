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
  @Matches(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/)
  validade: string;

  @IsString()
  @Matches(/^\d{3}$/)
  cvv: string;
}
