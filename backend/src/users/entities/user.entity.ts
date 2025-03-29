import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clan } from '../../clans/entities/clan.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',     // 超级管理员（总部管理员）
  CLAN_LEADER = 'clan_leader',     // 战队队长
  CLAN_MEMBER = 'clan_member',     // 战队成员
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ length: 50 })
  username: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLAN_MEMBER })
  role: UserRole;

  @Column({ nullable: true })
  clanId: string;

  @ManyToOne(() => Clan, clan => clan.members)
  @JoinColumn({ name: 'clanId' })
  clan: Clan;

  @Column({ length: 100, nullable: true })
  gameId: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isTwoFactorAuthEnabled: boolean;

  @Column({ nullable: true, select: false })
  twoFactorAuthSecret: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  power: number;

  @Column({ default: 0 })
  weeklyKills: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
