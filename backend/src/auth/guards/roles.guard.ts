import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由所需的角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果路由没有指定角色要求，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // 如果没有用户信息，拒绝访问
    if (!user) {
      throw new ForbiddenException('没有权限访问此资源');
    }

    // 检查用户角色是否满足要求
    const hasRequiredRole = requiredRoles.some(role => user.role === role);

    // 如果用户是超级管理员，允许访问所有资源
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // 特殊处理：如果用户是战队队长，允许访问所有与自己战队相关的资源
    if (user.role === UserRole.CLAN_LEADER) {
      const request = context.switchToHttp().getRequest();
      const requestedClanId = request.params.clanId || request.body.clanId;
      
      // 如果请求涉及战队ID，且与用户的战队ID匹配，则允许访问
      if (requestedClanId && requestedClanId === user.clanId) {
        return true;
      }
    }

    if (!hasRequiredRole) {
      throw new ForbiddenException('没有权限访问此资源');
    }

    return hasRequiredRole;
  }
}
