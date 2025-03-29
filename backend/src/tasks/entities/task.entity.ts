import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clan } from '../../clans/entities/clan.entity';

export enum TaskStatus {
  PENDING = 'pending',     // 待开始
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed', // 已完成
  CANCELED = 'canceled',   // 已取消
}

export enum TaskPriority {
  LOW = 'low',         // 低优先级
  MEDIUM = 'medium',   // 中优先级
  HIGH = 'high',       // 高优先级
  URGENT = 'urgent',   // 紧急优先级
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column()
  clanId: string;

  @ManyToOne(() => Clan)
  @JoinColumn({ name: 'clanId' })
  clan: Clan;

  @Column({ nullable: true })
  assignedToId: string;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100 的进度百分比

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
