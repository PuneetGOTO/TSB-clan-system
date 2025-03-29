import { PartialType } from '@nestjs/swagger';
import { CreateAnnouncementDto } from './create-announcement.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {
  @ApiPropertyOptional({
    description: '浏览次数',
    example: 100,
  })
  @IsNumber({}, { message: '浏览次数必须是数字' })
  @Min(0, { message: '浏览次数不能为负数' })
  @IsOptional()
  viewCount?: number;
}
