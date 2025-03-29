import { IsNotEmpty, IsString, Length, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorAuthDto {
  @ApiProperty({
    description: '用户ID',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsUUID(4, { message: '无效的用户ID格式' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: string;

  @ApiProperty({
    description: '两因素认证验证码',
    example: '123456',
  })
  @IsString({ message: '验证码必须是字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(6, 6, { message: '验证码必须是6位数字' })
  code: string;
}
