import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { Task } from './entities/task.entity';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '创建任务' })
  @ApiResponse({ status: 201, description: '任务创建成功', type: Task })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    // 如果是战队队长，只能为自己的战队创建任务
    if (req.user.role === UserRole.CLAN_LEADER) {
      // 未指定战队ID时，自动设置为队长所属战队
      if (!createTaskDto.clanId) {
        createTaskDto.clanId = req.user.clanId;
      } 
      // 指定了战队ID但不是自己的战队时，禁止操作
      else if (createTaskDto.clanId !== req.user.clanId) {
        throw new ForbiddenException('您只能为自己的战队创建任务');
      }
    }
    
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER, UserRole.CLAN_MEMBER)
  @ApiOperation({ summary: '获取任务列表（带筛选）' })
  @ApiResponse({ status: 200, description: '任务列表获取成功', type: [Task] })
  async findAll(@Query() filterDto: TaskFilterDto, @Request() req) {
    // 如果是战队队长或成员，只能查看自己战队的任务
    if (req.user.role === UserRole.CLAN_LEADER || req.user.role === UserRole.CLAN_MEMBER) {
      // 强制将查询限制为自己的战队
      filterDto.clanId = req.user.clanId;
    }
    
    return this.tasksService.findAll(filterDto);
  }

  @Get('clan/:clanId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER, UserRole.CLAN_MEMBER)
  @ApiOperation({ summary: '获取指定战队的任务列表' })
  @ApiResponse({ status: 200, description: '任务列表获取成功', type: [Task] })
  async findByClanId(@Param('clanId') clanId: string, @Request() req) {
    // 如果是战队队长或成员，只能查看自己战队的任务
    if ((req.user.role === UserRole.CLAN_LEADER || req.user.role === UserRole.CLAN_MEMBER) 
        && req.user.clanId !== clanId) {
      throw new ForbiddenException('您只能查看自己战队的任务');
    }
    
    return this.tasksService.findByClanId(clanId);
  }

  @Get('overdue')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '获取已逾期任务列表' })
  @ApiResponse({ status: 200, description: '逾期任务列表获取成功', type: [Task] })
  async findOverdueTasks(@Request() req) {
    const overdueTasks = await this.tasksService.findOverdueTasks();
    
    // 如果是战队队长，只返回自己战队的逾期任务
    if (req.user.role === UserRole.CLAN_LEADER) {
      return overdueTasks.filter(task => task.clanId === req.user.clanId);
    }
    
    return overdueTasks;
  }

  @Get('upcoming')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '获取即将到期任务列表' })
  @ApiResponse({ status: 200, description: '即将到期任务列表获取成功', type: [Task] })
  async findUpcomingTasks(@Query('days') days: number = 7, @Request() req) {
    const upcomingTasks = await this.tasksService.findUpcomingTasks(days);
    
    // 如果是战队队长，只返回自己战队的即将到期任务
    if (req.user.role === UserRole.CLAN_LEADER) {
      return upcomingTasks.filter(task => task.clanId === req.user.clanId);
    }
    
    return upcomingTasks;
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER, UserRole.CLAN_MEMBER)
  @ApiOperation({ summary: '获取任务详情' })
  @ApiResponse({ status: 200, description: '任务详情获取成功', type: Task })
  async findOne(@Param('id') id: string, @Request() req) {
    const task = await this.tasksService.findOne(id);
    
    // 如果是战队队长或成员，只能查看自己战队的任务
    if ((req.user.role === UserRole.CLAN_LEADER || req.user.role === UserRole.CLAN_MEMBER) 
        && task.clanId !== req.user.clanId) {
      throw new ForbiddenException('您只能查看自己战队的任务');
    }
    
    return task;
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER, UserRole.CLAN_MEMBER)
  @ApiOperation({ summary: '更新任务' })
  @ApiResponse({ status: 200, description: '任务更新成功', type: Task })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
    const task = await this.tasksService.findOne(id);
    
    // 检查权限
    if (req.user.role === UserRole.CLAN_LEADER && task.clanId !== req.user.clanId) {
      throw new ForbiddenException('您只能更新自己战队的任务');
    }
    
    if (req.user.role === UserRole.CLAN_MEMBER) {
      // 成员只能更新分配给自己的任务，且只能更新进度
      if (task.assignedToId !== req.user.id) {
        throw new ForbiddenException('您只能更新分配给自己的任务');
      }
      
      // 成员只能更新进度，不能更改其他属性
      const allowedProperties = ['progress'];
      const updateKeys = Object.keys(updateTaskDto);
      
      const hasDisallowedProperty = updateKeys.some(key => !allowedProperties.includes(key));
      if (hasDisallowedProperty) {
        throw new ForbiddenException('您只能更新任务进度');
      }
    }
    
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/progress')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER, UserRole.CLAN_MEMBER)
  @ApiOperation({ summary: '更新任务进度' })
  @ApiResponse({ status: 200, description: '任务进度更新成功', type: Task })
  async updateProgress(
    @Param('id') id: string, 
    @Body('progress') progress: number,
    @Request() req
  ) {
    const task = await this.tasksService.findOne(id);
    
    // 检查权限
    if (req.user.role === UserRole.CLAN_LEADER && task.clanId !== req.user.clanId) {
      throw new ForbiddenException('您只能更新自己战队的任务进度');
    }
    
    if (req.user.role === UserRole.CLAN_MEMBER && task.assignedToId !== req.user.id) {
      throw new ForbiddenException('您只能更新分配给自己的任务进度');
    }
    
    return this.tasksService.updateProgress(id, progress);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '删除任务' })
  @ApiResponse({ status: 200, description: '任务删除成功' })
  async remove(@Param('id') id: string, @Request() req) {
    const task = await this.tasksService.findOne(id);
    
    // 如果是战队队长，只能删除自己战队的任务
    if (req.user.role === UserRole.CLAN_LEADER && task.clanId !== req.user.clanId) {
      throw new ForbiddenException('您只能删除自己战队的任务');
    }
    
    await this.tasksService.remove(id);
    return { message: '任务删除成功' };
  }
}
