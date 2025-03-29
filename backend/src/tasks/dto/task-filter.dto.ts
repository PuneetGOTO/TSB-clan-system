import { IsOptional, IsEnum, IsString, IsDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';
import { Type } from 'class-transformer';

export class TaskFilterDto {
  @ApiPropertyOptional({
    description: '任务状态',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus, { message: '无效的任务状态' })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: '任务优先级',
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority, { message: '无效的任务优先级' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: '所属战队ID',
    example: 'Alpha_01',
  })
  @IsString({ message: '战队ID必须是字符串' })
  @IsOptional()
  clanId?: string;

  @ApiPropertyOptional({
    description: '任务指派对象ID',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsString({ message: '用户ID必须是字符串' })
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({
    description: '任务截止日期（之前）',
    example: '2025-04-30T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: '无效的日期格式' })
  @IsOptional()
  dueDateBefore?: Date;

  @ApiPropertyOptional({
    description: '任务截止日期（之后）',
    example: '2025-03-01T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: '无效的日期格式' })
  @IsOptional()
  dueDateAfter?: Date;

  @ApiPropertyOptional({
    description: '关键词搜索（标题和描述）',
    example: '击杀',
  })
  @IsString({ message: '关键词必须是字符串' })
  @IsOptional()
  keyword?: string;
}
