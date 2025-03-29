import { IsNotEmpty, IsString, IsOptional, MaxLength, Matches, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClanDto {
  @ApiProperty({
    description: '战队ID',
    example: 'Alpha_01',
  })
  @IsString({ message: '战队ID必须是字符串' })
  @IsNotEmpty({ message: '战队ID不能为空' })
  @Matches(/^[A-Za-z0-9_-]+$/, { message: '战队ID只能包含字母、数字、下划线和连字符' })
  @MaxLength(20, { message: '战队ID长度不能超过20个字符' })
  id: string;

  @ApiProperty({
    description: '战队名称',
    example: '王者之师',
  })
  @IsString({ message: '战队名称必须是字符串' })
  @IsNotEmpty({ message: '战队名称不能为空' })
  @MaxLength(100, { message: '战队名称长度不能超过100个字符' })
  name: string;

  @ApiPropertyOptional({
    description: '战队描述',
    example: '我们是最强大的战队，专注于团队配合和战术执行。',
  })
  @IsString({ message: '战队描述必须是字符串' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: '战队Logo URL',
    example: 'https://example.com/logos/alpha01.png',
  })
  @IsString({ message: 'Logo URL必须是字符串' })
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: '队长用户ID',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsString({ message: '队长ID必须是字符串' })
  @IsNotEmpty({ message: '队长ID不能为空' })
  leaderId: string;

  @ApiPropertyOptional({
    description: '成员数量上限',
    example: 30,
    default: 30,
    minimum: 5,
    maximum: 100,
  })
  @IsInt({ message: '成员数量上限必须是整数' })
  @Min(5, { message: '成员数量上限最少为5人' })
  @Max(100, { message: '成员数量上限最多为100人' })
  @IsOptional()
  memberLimit?: number;

  @ApiPropertyOptional({
    description: '是否为主战队',
    example: false,
    default: false,
  })
  @IsBoolean({ message: '主战队标志必须是布尔值' })
  @IsOptional()
  isMainClan?: boolean;
}
