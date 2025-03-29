import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 检查路由是否被标记为公开访问
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 继续JWT认证
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    // 如果出现错误或者用户未认证，抛出异常
    if (err || !user) {
      throw err || new UnauthorizedException('请先登录');
    }

    // 如果是两因素认证的临时令牌，检查当前路由是否允许
    if (user.isTwoFactorAuthenticationToken) {
      // 这里只允许访问验证两因素认证的路由，其他路由都需要完全认证
      const request = context.switchToHttp().getRequest();
      if (request.url !== '/api/auth/verify-2fa') {
        throw new UnauthorizedException('需要完成两因素认证');
      }
    }

    return user;
  }
}
