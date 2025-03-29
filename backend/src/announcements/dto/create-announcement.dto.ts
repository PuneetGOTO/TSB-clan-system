import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({
    description: '公告标题',
    example: '战队招募新成员公告',
  })
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiProperty({
    description: '公告内容',
    example: '<p>我们正在招募新的战队成员，要求战力不低于5000。</p>',
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '是否置顶',
    example: false,
    default: false,
  })
  @IsBoolean({ message: '置顶状态必须是布尔值' })
  @IsOptional()
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: '所属战队ID（如不指定则为全局公告）',
    example: 'Alpha_01',
  })
  @IsString({ message: '战队ID必须是字符串' })
  @IsOptional()
  clanId?: string;
}
