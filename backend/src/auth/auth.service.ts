import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterLeaderDto } from './dto/register-leader.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { LoggingService } from '../logging/logging.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private twoFactorAuthService: TwoFactorAuthService,
    private mailService: MailService,
    private loggingService: LoggingService,
  ) {}

  // 用户登录
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    // 如果用户启用了两因素认证，返回一个特殊标记
    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, email: user.email, isTwoFactorAuthenticationToken: true },
        { expiresIn: '5m' }
      );
      
      return {
        requireTwoFactor: true,
        tempToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      };
    }

    // 生成令牌
    const tokens = this.generateTokens(user);
    
    // 记录登录日志
    await this.loggingService.logUserActivity(
      user.id,
      'AUTH_LOGIN',
      `用户 ${user.email} 登录成功`,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clanId: user.clanId,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      ...tokens,
    };
  }

  // 注册战队队长
  async registerClanLeader(registerDto: RegisterLeaderDto, adminId: string) {
    // 检查是否有权限创建队长
    const admin = await this.usersService.findById(adminId);
    if (admin.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('只有超级管理员可以创建战队队长');
    }

    // 检查战队ID是否存在
    // 这里假设在创建队长前，已经创建了战队，实际情况可能不同
    const clanExists = await this.usersService.checkClanExists(registerDto.clanId);
    if (!clanExists) {
      throw new BadRequestException(`ID为 ${registerDto.clanId} 的战队不存在`);
    }

    // 检查邮箱是否已被使用
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册');
    }

    // 生成随机密码
    const randomPassword = this.generateRandomPassword();

    // 创建队长账户
    const newLeader = await this.usersService.createClanLeader({
      email: registerDto.email,
      password: randomPassword,
      clanId: registerDto.clanId,
      initialMemberCount: registerDto.initialMemberCount,
    });

    // 生成激活链接
    const activationToken = this.jwtService.sign(
      { sub: newLeader.id, email: newLeader.email, action: 'activate' },
      { expiresIn: '24h' }
    );

    // 发送激活邮件
    await this.mailService.sendClanLeaderActivation(
      newLeader.email,
      {
        clanId: registerDto.clanId,
        activationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate?token=${activationToken}`,
        temporaryPassword: randomPassword,
      }
    );

    // 记录日志
    await this.loggingService.logUserActivity(
      adminId,
      'LEADER_CREATED',
      `管理员 ${admin.email} 创建了战队 ${registerDto.clanId} 的队长账号 ${registerDto.email}`,
    );

    return { success: true, message: '战队队长账号创建成功，激活邮件已发送' };
  }

  // 验证用户凭据
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    return user;
  }

  // 验证两因素认证码
  async verifyTwoFactorAuthenticationCode(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('该用户未启用两因素认证');
    }

    const isCodeValid = this.twoFactorAuthService.verifyCode(
      code,
      user.twoFactorSecret
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('验证码无效');
    }

    // 验证成功，生成完整权限的令牌
    const tokens = this.generateTokens(user);

    // 记录日志
    await this.loggingService.logUserActivity(
      user.id,
      'TWO_FACTOR_AUTH',
      `用户 ${user.email} 完成两因素认证`,
    );

    return {
      verified: true,
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clanId: user.clanId,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  // 启用两因素认证
  async enableTwoFactorAuthentication(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 生成两因素认证密钥
    const { secret, otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(
      user.email
    );

    // 生成QR码
    const qrCodeUrl = await this.twoFactorAuthService.generateQrCodeDataURL(otpAuthUrl);

    // 保存密钥但不立即启用
    await this.usersService.setTwoFactorAuthenticationSecret(userId, secret);

    return {
      secret,
      qrCodeUrl,
    };
  }

  // 确认并完成两因素认证启用
  async confirmTwoFactorAuthentication(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('用户不存在或未设置两因素认证密钥');
    }

    const isCodeValid = this.twoFactorAuthService.verifyCode(
      code,
      user.twoFactorSecret
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('验证码无效');
    }

    // 验证成功，启用两因素认证
    await this.usersService.enableTwoFactorAuthentication(userId);

    // 记录日志
    await this.loggingService.logUserActivity(
      user.id,
      'TWO_FACTOR_ENABLED',
      `用户 ${user.email} 启用了两因素认证`,
    );

    return { enabled: true };
  }

  // 禁用两因素认证
  async disableTwoFactorAuthentication(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('该用户未启用两因素认证');
    }

    const isCodeValid = this.twoFactorAuthService.verifyCode(
      code,
      user.twoFactorSecret
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('验证码无效');
    }

    // 验证成功，禁用两因素认证
    await this.usersService.disableTwoFactorAuthentication(userId);

    // 记录日志
    await this.loggingService.logUserActivity(
      user.id,
      'TWO_FACTOR_DISABLED',
      `用户 ${user.email} 禁用了两因素认证`,
    );

    return { success: true };
  }

  // 修改密码
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('当前密码错误');
    }

    // 更新密码
    await this.usersService.updatePassword(userId, changePasswordDto.newPassword);

    // 记录日志
    await this.loggingService.logUserActivity(
      user.id,
      'PASSWORD_CHANGED',
      `用户 ${user.email} 修改了密码`,
    );

    return { success: true };
  }

  // 请求重置密码
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // 为了安全考虑，即使用户不存在也返回成功
      return { success: true, message: '如果该邮箱已注册，重置密码邮件将发送到该邮箱' };
    }

    // 生成重置令牌
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, action: 'reset-password' },
      { expiresIn: '1h' }
    );

    // 发送重置密码邮件
    await this.mailService.sendPasswordResetEmail(
      user.email,
      {
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
      }
    );

    // 记录日志
    await this.loggingService.logUserActivity(
      user.id,
      'PASSWORD_RESET_REQUESTED',
      `用户 ${user.email} 请求重置密码`,
    );

    return { success: true, message: '如果该邮箱已注册，重置密码邮件将发送到该邮箱' };
  }

  // 重置密码
  async resetPassword(token: string, newPassword: string) {
    try {
      // 验证令牌
      const payload = this.jwtService.verify(token);
      if (payload.action !== 'reset-password') {
        throw new BadRequestException('无效的令牌');
      }

      // 更新密码
      await this.usersService.updatePassword(payload.sub, newPassword);

      // 记录日志
      await this.loggingService.logUserActivity(
        payload.sub,
        'PASSWORD_RESET_COMPLETED',
        `用户 ${payload.email} 完成密码重置`,
      );

      return { success: true };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('令牌无效或已过期');
      }
      throw error;
    }
  }

  // 刷新令牌
  async refreshToken(refreshToken: string) {
    try {
      // 验证刷新令牌
      const payload = this.jwtService.verify(refreshToken);
      if (!payload.isRefreshToken) {
        throw new BadRequestException('无效的刷新令牌');
      }

      // 获取用户信息
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 生成新令牌
      const tokens = this.generateTokens(user);

      return tokens;
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('刷新令牌无效或已过期');
      }
      throw error;
    }
  }

  // 获取用户信息
  async getUserProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clanId: user.clanId,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }

  // 生成JWT令牌
  private generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    if (user.clanId) {
      payload.clanId = user.clanId;
    }

    // 访问令牌，短期有效
    const token = this.jwtService.sign(payload);

    // 刷新令牌，长期有效
    const refreshToken = this.jwtService.sign(
      { ...payload, isRefreshToken: true },
      { expiresIn: '7d' }
    );

    return { token, refreshToken };
  }

  // 生成随机密码
  private generateRandomPassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    
    return password;
  }
}
