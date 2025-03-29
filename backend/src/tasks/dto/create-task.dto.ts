import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, IsDate, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({
    description: '任务标题',
    example: '每周击杀目标',
  })
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiPropertyOptional({
    description: '任务描述',
    example: '本周击杀目标为200，每个队员至少需要贡献20个击杀。',
  })
  @IsString({ message: '描述必须是字符串' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: '任务状态',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus, { message: '无效的任务状态' })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: '任务优先级',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority, { message: '无效的任务优先级' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    description: '所属战队ID',
    example: 'Alpha_01',
  })
  @IsString({ message: '战队ID必须是字符串' })
  @IsNotEmpty({ message: '战队ID不能为空' })
  clanId: string;

  @ApiPropertyOptional({
    description: '任务指派对象ID',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @IsUUID(4, { message: '无效的用户ID格式' })
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({
    description: '任务进度（0-100）',
    example: 0,
    default: 0,
  })
  @IsInt({ message: '进度必须是整数' })
  @Min(0, { message: '进度不能小于0' })
  @Max(100, { message: '进度不能大于100' })
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({
    description: '任务截止日期',
    example: '2025-04-30T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: '无效的日期格式' })
  @IsOptional()
  dueDate?: Date;
}
