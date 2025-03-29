import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between, Like, ILike } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { ClansService } from '../clans/clans.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private clansService: ClansService,
    private usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // 检查战队是否存在
    await this.clansService.findOne(createTaskDto.clanId);

    // 如果指定了任务负责人，检查该用户是否存在且属于该战队
    if (createTaskDto.assignedToId) {
      const user = await this.usersService.findOne(createTaskDto.assignedToId);
      if (user.clanId !== createTaskDto.clanId) {
        throw new ForbiddenException('任务负责人必须是该战队的成员');
      }
    }

    // 创建新任务
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async findAll(filterDto: TaskFilterDto): Promise<Task[]> {
    const queryBuilder = this.tasksRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.clan', 'clan');

    // 根据筛选条件构建查询
    if (filterDto.status) {
      queryBuilder.andWhere('task.status = :status', { status: filterDto.status });
    }

    if (filterDto.priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority: filterDto.priority });
    }

    if (filterDto.clanId) {
      queryBuilder.andWhere('task.clanId = :clanId', { clanId: filterDto.clanId });
    }

    if (filterDto.assignedToId) {
      queryBuilder.andWhere('task.assignedToId = :assignedToId', { assignedToId: filterDto.assignedToId });
    }

    if (filterDto.dueDateBefore) {
      queryBuilder.andWhere('task.dueDate <= :dueDateBefore', { dueDateBefore: filterDto.dueDateBefore });
    }

    if (filterDto.dueDateAfter) {
      queryBuilder.andWhere('task.dueDate >= :dueDateAfter', { dueDateAfter: filterDto.dueDateAfter });
    }

    if (filterDto.keyword) {
      queryBuilder.andWhere('(task.title LIKE :keyword OR task.description LIKE :keyword)', 
        { keyword: `%${filterDto.keyword}%` });
    }

    // 添加排序：优先级降序，截止日期升序，创建时间降序
    queryBuilder.orderBy('task.priority', 'DESC')
      .addOrderBy('task.dueDate', 'ASC')
      .addOrderBy('task.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findByClanId(clanId: string): Promise<Task[]> {
    // 检查战队是否存在
    await this.clansService.findOne(clanId);

    return this.tasksRepository.find({
      where: { clanId },
      order: {
        priority: 'DESC',
        dueDate: 'ASC',
        createdAt: 'DESC',
      },
      relations: ['clan'],
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['clan'],
    });

    if (!task) {
      throw new NotFoundException(`ID为${id}的任务不存在`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // 如果要更改任务分配人，检查该用户是否存在且属于该战队
    if (updateTaskDto.assignedToId && updateTaskDto.assignedToId !== task.assignedToId) {
      const user = await this.usersService.findOne(updateTaskDto.assignedToId);
      if (user.clanId !== task.clanId) {
        throw new ForbiddenException('任务负责人必须是该战队的成员');
      }
    }

    // 如果状态变更为已完成，且没有提供完成时间，自动设置完成时间为当前时间
    if (updateTaskDto.status === TaskStatus.COMPLETED && !updateTaskDto.completedAt && task.status !== TaskStatus.COMPLETED) {
      updateTaskDto.completedAt = new Date();
      updateTaskDto.progress = 100; // 设置进度为100%
    }

    // 如果提供了进度且为100%，但状态不是已完成，则自动将状态设为已完成
    if (updateTaskDto.progress === 100 && task.progress !== 100 && (!updateTaskDto.status || updateTaskDto.status !== TaskStatus.COMPLETED)) {
      updateTaskDto.status = TaskStatus.COMPLETED;
      updateTaskDto.completedAt = new Date();
    }

    // 如果状态从已完成变为其他状态，清除完成时间
    if (task.status === TaskStatus.COMPLETED && updateTaskDto.status && updateTaskDto.status !== TaskStatus.COMPLETED) {
      updateTaskDto.completedAt = null;
    }

    // 更新任务信息
    this.tasksRepository.merge(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  async findOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return this.tasksRepository.find({
      where: {
        dueDate: LessThan(now),
        status: TaskStatus.IN_PROGRESS,
      },
      relations: ['clan'],
    });
  }

  async findUpcomingTasks(days: number = 7): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.tasksRepository.find({
      where: {
        dueDate: Between(now, futureDate),
        status: TaskStatus.IN_PROGRESS,
      },
      relations: ['clan'],
    });
  }

  async updateProgress(id: string, progress: number): Promise<Task> {
    const task = await this.findOne(id);
    
    // 验证进度值
    if (progress < 0 || progress > 100) {
      throw new ForbiddenException('进度值必须在0到100之间');
    }

    // 更新进度
    task.progress = progress;

    // 如果进度为100%，自动更新状态为已完成
    if (progress === 100 && task.status !== TaskStatus.COMPLETED) {
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
    } 
    // 如果进度小于100%，但状态为已完成，将状态更改为进行中
    else if (progress < 100 && task.status === TaskStatus.COMPLETED) {
      task.status = TaskStatus.IN_PROGRESS;
      task.completedAt = null;
    }

    return this.tasksRepository.save(task);
  }
}
