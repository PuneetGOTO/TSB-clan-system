import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterLeaderDto } from './dto/register-leader.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TwoFactorAuthDto } from './dto/two-factor-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register-leader')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '注册战队队长' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '请求数据无效' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async registerLeader(
    @Body() registerDto: RegisterLeaderDto,
    @Request() req,
  ) {
    return this.authService.registerClanLeader(registerDto, req.user.id);
  }

  @Post('verify-2fa')
  @HttpCode(200)
  @ApiOperation({ summary: '验证两因素认证码' })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 401, description: '验证失败' })
  async verifyTwoFactorAuth(@Body() twoFactorAuthDto: TwoFactorAuthDto) {
    return this.authService.verifyTwoFactorAuthenticationCode(
      twoFactorAuthDto.userId,
      twoFactorAuthDto.code,
    );
  }

  @Post('enable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '启用两因素认证' })
  @ApiResponse({ status: 200, description: '成功生成两因素认证密钥' })
  async enableTwoFactorAuth(@Request() req) {
    return this.authService.enableTwoFactorAuthentication(req.user.id);
  }

  @Post('confirm-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '确认两因素认证' })
  @ApiResponse({ status: 200, description: '两因素认证已启用' })
  @ApiResponse({ status: 401, description: '验证码无效' })
  async confirmTwoFactorAuth(
    @Request() req,
    @Body() twoFactorAuthDto: TwoFactorAuthDto,
  ) {
    return this.authService.confirmTwoFactorAuthentication(
      req.user.id,
      twoFactorAuthDto.code,
    );
  }

  @Post('disable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '禁用两因素认证' })
  @ApiResponse({ status: 200, description: '两因素认证已禁用' })
  @ApiResponse({ status: 401, description: '验证码无效' })
  async disableTwoFactorAuth(
    @Request() req,
    @Body() twoFactorAuthDto: TwoFactorAuthDto,
  ) {
    return this.authService.disableTwoFactorAuthentication(
      req.user.id,
      twoFactorAuthDto.code,
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiResponse({ status: 401, description: '当前密码错误' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('request-password-reset')
  @HttpCode(200)
  @ApiOperation({ summary: '请求重置密码' })
  @ApiResponse({ status: 200, description: '如果邮箱存在，重置邮件已发送' })
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: '重置密码' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 400, description: '令牌无效或已过期' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '刷新令牌' })
  @ApiResponse({ status: 200, description: '令牌刷新成功' })
  @ApiResponse({ status: 400, description: '刷新令牌无效或已过期' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '成功获取用户信息' })
  @ApiResponse({ status: 401, description: '未认证' })
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.id);
  }
}
