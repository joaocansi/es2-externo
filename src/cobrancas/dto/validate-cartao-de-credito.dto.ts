import { IsNotEmpty, IsString } from 'class-validator';

export default class ValidateCartaoDeCreditoDto {
  @IsString()
  @IsNotEmpty()
  nomeTitular: string;

  @IsString()
  numero: string;

  @IsString()
  @IsNotEmpty()
  validade: string;

  @IsString()
  cvv: string;
}
