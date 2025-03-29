import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('clans')
export class Clan {
  @PrimaryColumn()
  id: string; // 战队ID，例如 "Alpha_01"

  @Column({ length: 100 })
  name: string; // 战队名称

  @Column({ type: 'text', nullable: true })
  description: string; // 战队描述

  @Column({ nullable: true })
  logoUrl: string; // 战队Logo URL

  @Column()
  leaderId: string; // 队长用户ID

  @Column({ default: 0 })
  totalPower: number; // 战队总战力

  @Column({ default: 0 })
  weeklyKills: number; // 本周总击杀数

  @Column({ default: 30 })
  memberLimit: number; // 成员数量上限，默认为30

  @Column({ default: true })
  isActive: boolean; // 战队是否激活

  @Column({ nullable: true })
  activationCode: string; // 战队激活码

  @Column({ default: false })
  isMainClan: boolean; // 是否为主战队（超级管理员）

  @OneToMany(() => User, user => user.clan)
  members: User[]; // 关联的战队成员

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
