import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsDateString()
  @IsOptional()
  joinedAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
