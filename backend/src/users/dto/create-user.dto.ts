import { IsEmail, IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: '用户电子邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '请提供有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({
    description: '用户密码',
    example: 'Password123!',
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码长度不能少于8个字符' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({
    description: '用户名称',
    example: '战神无双',
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiPropertyOptional({
    description: '用户角色',
    enum: UserRole,
    default: UserRole.CLAN_MEMBER,
  })
  @IsEnum(UserRole, { message: '无效的用户角色' })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: '所属战队ID',
    example: 'Alpha_01',
  })
  @IsString({ message: '战队ID必须是字符串' })
  @IsOptional()
  clanId?: string;

  @ApiPropertyOptional({
    description: '游戏内ID',
    example: 'Player_12345',
  })
  @IsString({ message: '游戏ID必须是字符串' })
  @IsOptional()
  gameId?: string;
}
