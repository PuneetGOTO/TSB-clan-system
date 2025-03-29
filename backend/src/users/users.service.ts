import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findAllByClanId(clanId: string): Promise<User[]> {
    return this.usersRepository.find({ where: { clanId } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }
    return user;
  }

  async findByEmail(email: string, includePassword: boolean = false): Promise<User> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    
    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }
    
    const user = await queryBuilder
      .where('user.email = :email', { email })
      .getOne();
    
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查邮箱是否已经存在
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`邮箱 ${createUserDto.email} 已被注册`);
    }

    // 创建新用户
    const user = this.usersRepository.create({
      ...createUserDto,
      password: await this.hashPassword(createUserDto.password),
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 如果要更新密码，先对密码进行哈希处理
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    // 更新用户数据
    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updatePower(id: string, power: number): Promise<User> {
    const user = await this.findOne(id);
    user.power = power;
    return this.usersRepository.save(user);
  }

  async updateWeeklyKills(id: string, kills: number): Promise<User> {
    const user = await this.findOne(id);
    user.weeklyKills = kills;
    return this.usersRepository.save(user);
  }

  async resetWeeklyKills(): Promise<void> {
    await this.usersRepository.update({}, { weeklyKills: 0 });
  }

  async setTwoFactorAuth(id: string, secret: string, enabled: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.twoFactorAuthSecret = secret;
    user.isTwoFactorAuthEnabled = enabled;
    return this.usersRepository.save(user);
  }

  async recordLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
