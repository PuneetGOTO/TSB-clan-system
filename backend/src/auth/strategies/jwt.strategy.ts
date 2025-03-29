import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super-secret-jwt-key-please-change-in-production'),
    });
  }

  async validate(payload: JwtPayload) {
    // 这里可以添加额外的验证逻辑，比如检查用户是否存在
    // 返回的对象将会被添加到请求对象中，作为req.user
    const user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    if (payload.clanId) {
      user['clanId'] = payload.clanId;
    }

    // 如果是两因素认证的临时令牌，添加标记
    if (payload.isTwoFactorAuthenticationToken) {
      user['isTwoFactorAuthenticationToken'] = true;
    }

    return user;
  }
}
