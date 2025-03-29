import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Clan } from './entities/clan.entity';
import { CreateClanDto } from './dto/create-clan.dto';
import { UpdateClanDto } from './dto/update-clan.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ClansService {
  constructor(
    @InjectRepository(Clan)
    private clansRepository: Repository<Clan>,
    private usersService: UsersService,
  ) {}

  async findAll(): Promise<Clan[]> {
    return this.clansRepository.find({ 
      order: { createdAt: 'DESC' },
      relations: ['members']
    });
  }

  async findAllActive(): Promise<Clan[]> {
    return this.clansRepository.find({ 
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['members']
    });
  }

  async findOne(id: string): Promise<Clan> {
    const clan = await this.clansRepository.findOne({ 
      where: { id },
      relations: ['members']
    });
    
    if (!clan) {
      throw new NotFoundException(`ID为${id}的战队不存在`);
    }
    
    return clan;
  }

  async create(createClanDto: CreateClanDto): Promise<Clan> {
    // 检查战队ID是否已存在
    const existingClan = await this.clansRepository.findOne({
      where: { id: createClanDto.id }
    });
    
    if (existingClan) {
      throw new ConflictException(`战队ID ${createClanDto.id} 已被使用`);
    }

    // 检查战队队长是否存在
    const leader = await this.usersService.findOne(createClanDto.leaderId);
    
    // 生成激活码（仅对非主战队生效）
    const activationCode = createClanDto.isMainClan ? null : uuidv4();
    
    // 创建新战队
    const newClan = this.clansRepository.create({
      ...createClanDto,
      activationCode,
      isActive: createClanDto.isMainClan ? true : false, // 主战队默认激活
    });
    
    const savedClan = await this.clansRepository.save(newClan);
    
    // 更新战队队长的信息
    await this.usersService.update(leader.id, {
      clanId: savedClan.id,
      role: UserRole.CLAN_LEADER,
    });
    
    return savedClan;
  }

  async update(id: string, updateClanDto: UpdateClanDto): Promise<Clan> {
    const clan = await this.findOne(id);
    
    // 如果要更新队长，需要检查新队长是否存在，并更新新旧队长的角色
    if (updateClanDto.leaderId && updateClanDto.leaderId !== clan.leaderId) {
      // 检查新队长是否存在
      const newLeader = await this.usersService.findOne(updateClanDto.leaderId);
      
      // 检查新队长是否属于该战队
      if (newLeader.clanId !== clan.id) {
        throw new ForbiddenException('新队长必须是该战队的成员');
      }
      
      // 更新旧队长角色为普通成员
      await this.usersService.update(clan.leaderId, {
        role: UserRole.CLAN_MEMBER,
      });
      
      // 更新新队长角色
      await this.usersService.update(newLeader.id, {
        role: UserRole.CLAN_LEADER,
      });
    }
    
    // 更新战队信息
    this.clansRepository.merge(clan, updateClanDto);
    return this.clansRepository.save(clan);
  }

  async remove(id: string): Promise<void> {
    const clan = await this.findOne(id);
    
    // 检查是否为主战队，主战队不能被删除
    if (clan.isMainClan) {
      throw new ForbiddenException('不能删除主战队');
    }
    
    // 检查战队是否有成员
    if (clan.members && clan.members.length > 0) {
      throw new ForbiddenException('战队中还有成员，不能删除');
    }
    
    await this.clansRepository.remove(clan);
  }

  async activate(id: string, activationCode: string): Promise<Clan> {
    const clan = await this.findOne(id);
    
    // 检查战队是否已激活
    if (clan.isActive) {
      throw new ConflictException('战队已激活');
    }
    
    // 检查激活码是否正确
    if (clan.activationCode !== activationCode) {
      throw new ForbiddenException('激活码不正确');
    }
    
    // 激活战队
    clan.isActive = true;
    clan.activationCode = null; // 激活后清除激活码
    
    return this.clansRepository.save(clan);
  }

  async deactivate(id: string): Promise<Clan> {
    const clan = await this.findOne(id);
    
    // 检查是否为主战队，主战队不能被停用
    if (clan.isMainClan) {
      throw new ForbiddenException('不能停用主战队');
    }
    
    // 停用战队
    clan.isActive = false;
    clan.activationCode = uuidv4(); // 重新生成激活码
    
    return this.clansRepository.save(clan);
  }

  async updateTotalPower(id: string): Promise<Clan> {
    const clan = await this.findOne(id);
    
    // 计算战队所有成员的总战力
    let totalPower = 0;
    if (clan.members) {
      totalPower = clan.members.reduce((sum, member) => sum + member.power, 0);
    }
    
    // 更新战队总战力
    clan.totalPower = totalPower;
    return this.clansRepository.save(clan);
  }

  async updateWeeklyKills(id: string): Promise<Clan> {
    const clan = await this.findOne(id);
    
    // 计算战队所有成员的本周击杀总数
    let weeklyKills = 0;
    if (clan.members) {
      weeklyKills = clan.members.reduce((sum, member) => sum + member.weeklyKills, 0);
    }
    
    // 更新战队本周击杀数
    clan.weeklyKills = weeklyKills;
    return this.clansRepository.save(clan);
  }

  async resetAllWeeklyKills(): Promise<void> {
    // 重置所有战队的本周击杀数
    await this.clansRepository.update({}, { weeklyKills: 0 });
  }

  async findMainClan(): Promise<Clan> {
    const mainClan = await this.clansRepository.findOne({
      where: { isMainClan: true },
      relations: ['members']
    });
    
    if (!mainClan) {
      throw new NotFoundException('主战队不存在');
    }
    
    return mainClan;
  }

  async addMemberToClan(clanId: string, userId: string): Promise<void> {
    const clan = await this.findOne(clanId);
    const user = await this.usersService.findOne(userId);
    
    // 检查战队是否已激活
    if (!clan.isActive) {
      throw new ForbiddenException('战队未激活，不能添加成员');
    }
    
    // 检查战队成员是否已达到上限
    if (clan.members && clan.members.length >= clan.memberLimit) {
      throw new ForbiddenException('战队成员已达到上限');
    }
    
    // 检查用户是否已有战队
    if (user.clanId) {
      throw new ConflictException('用户已经加入其他战队');
    }
    
    // 将用户添加到战队
    await this.usersService.update(userId, {
      clanId: clanId,
      role: UserRole.CLAN_MEMBER,
    });
  }

  async removeMemberFromClan(clanId: string, userId: string): Promise<void> {
    const clan = await this.findOne(clanId);
    const user = await this.usersService.findOne(userId);
    
    // 检查用户是否属于该战队
    if (user.clanId !== clanId) {
      throw new ForbiddenException('用户不属于该战队');
    }
    
    // 检查用户是否为战队队长
    if (user.id === clan.leaderId) {
      throw new ForbiddenException('不能删除战队队长，请先更换队长');
    }
    
    // 将用户从战队移除
    await this.usersService.update(userId, {
      clanId: null,
      role: UserRole.CLAN_MEMBER, // 保持原来的角色类型，但移除战队关联
    });
  }
}
