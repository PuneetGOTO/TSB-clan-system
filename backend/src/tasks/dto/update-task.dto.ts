import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsDate, IsUUID, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  // 继承CreateTaskDto的所有字段，所有字段都变为可选

  @ApiPropertyOptional({
    description: '任务状态',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus, { message: '任务状态必须是有效的状态枚举值' })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: '任务进度（0-100）',
    example: 75,
  })
  @IsInt({ message: '进度必须是整数' })
  @Min(0, { message: '进度不能低于0%' })
  @Max(100, { message: '进度不能超过100%' })
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({
    description: '任务负责人ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: '负责人ID必须是有效的UUID' })
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({
    description: '任务完成时间',
    example: '2025-04-30T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: '无效的日期格式' })
  @IsOptional()
  completedAt?: Date;
}
