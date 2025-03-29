import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsNumber, IsOptional, IsUUID, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: '用户是否激活',
    example: true,
  })
  @IsBoolean({ message: '激活状态必须是布尔值' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '用户战力',
    example: 1000,
  })
  @IsNumber({}, { message: '战力必须是数字' })
  @IsOptional()
  power?: number;

  @ApiPropertyOptional({
    description: '本周击杀数',
    example: 50,
  })
  @IsNumber({}, { message: '击杀数必须是数字' })
  @IsOptional()
  weeklyKills?: number;
  
  @ApiPropertyOptional({
    description: '所属战队ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: '战队ID必须是有效的UUID' })
  @IsOptional()
  clanId?: string;
  
  @ApiPropertyOptional({
    description: '用户角色',
    enum: UserRole,
    example: UserRole.CLAN_MEMBER,
  })
  @IsEnum(UserRole, { message: '用户角色必须是有效的角色枚举值' })
  @IsOptional()
  role?: UserRole;
  
  @ApiPropertyOptional({
    description: '用户密码（加密存储）',
    example: 'newpassword123',
  })
  @IsString({ message: '密码必须是字符串' })
  @IsOptional()
  password?: string;
}
