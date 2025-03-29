import { PartialType } from '@nestjs/swagger';
import { CreateClanDto } from './create-clan.dto';
import { IsOptional, IsInt, Min, IsBoolean, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClanDto extends PartialType(CreateClanDto) {
  // 不允许更新 id 和 isMainClan 字段
  id?: never;
  isMainClan?: never;

  @ApiPropertyOptional({
    description: '战队队长ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: '队长ID必须是有效的UUID' })
  @IsOptional()
  leaderId?: string;

  @ApiPropertyOptional({
    description: '战队总战力',
    example: 50000,
  })
  @IsInt({ message: '总战力必须是整数' })
  @Min(0, { message: '总战力不能为负数' })
  @IsOptional()
  totalPower?: number;

  @ApiPropertyOptional({
    description: '本周总击杀数',
    example: 1000,
  })
  @IsInt({ message: '击杀数必须是整数' })
  @Min(0, { message: '击杀数不能为负数' })
  @IsOptional()
  weeklyKills?: number;

  @ApiPropertyOptional({
    description: '战队是否激活',
    example: true,
  })
  @IsBoolean({ message: '激活状态必须是布尔值' })
  @IsOptional()
  isActive?: boolean;
}
