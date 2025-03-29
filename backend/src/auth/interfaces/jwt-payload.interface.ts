import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // 用户ID
  email: string; // 用户邮箱
  role: UserRole; // 用户角色
  clanId?: string; // 战队ID（可选）
  isTwoFactorAuthenticationToken?: boolean; // 是否是两因素认证临时令牌
  isRefreshToken?: boolean; // 是否是刷新令牌
}
