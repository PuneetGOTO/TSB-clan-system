import { IsEmail, IsNotEmpty, IsString, Matches, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterLeaderDto {
  @ApiProperty({
    description: '战队ID',
    example: 'Alpha_01',
  })
  @IsString({ message: '战队ID必须是字符串' })
  @IsNotEmpty({ message: '战队ID不能为空' })
  @Matches(/^[A-Za-z0-9_-]+$/, { message: '战队ID只能包含字母、数字、下划线和连字符' })
  clanId: string;

  @ApiProperty({
    description: '队长邮箱',
    example: 'leader@example.com',
  })
  @IsEmail({}, { message: '请提供有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({
    description: '初始成员数量',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsInt({ message: '初始成员数量必须是整数' })
  @Min(1, { message: '初始成员数量最少为1人' })
  @Max(50, { message: '初始成员数量最多为50人' })
  initialMemberCount: number;
}
