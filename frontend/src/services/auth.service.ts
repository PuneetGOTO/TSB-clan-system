import axios from 'axios';
import { apiService } from './api.service';

// API基础URL，在生产环境中应该替换为实际的API地址
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 用户角色枚举
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // 超级管理员
  CLAN_LEADER = 'CLAN_LEADER', // 战队队长
  CLAN_MEMBER = 'CLAN_MEMBER', // 战队成员
}

// 用户信息接口
export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  clanId?: string;
  clanName?: string;
  twoFactorEnabled: boolean;
}

// 认证服务类
class AuthService {
  private currentUser: UserInfo | null = null;
  
  constructor() {
    // 初始化时，尝试从localStorage获取用户信息
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user info');
        localStorage.removeItem('user_info');
      }
    }
  }
  
  // 登录
  async login(email: string, password: string): Promise<UserInfo> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      const { user, token, refreshToken } = response.data;
      
      // 保存令牌到localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_info', JSON.stringify(user));
      
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  // 通过Google Authenticator进行二次验证
  async verifyTwoFactor(code: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-2fa`, {
        code,
        userId: this.currentUser?.id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const { verified, token, refreshToken } = response.data;
      
      if (verified) {
        // 更新令牌
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Two-factor verification error:', error);
      throw error;
    }
  }
  
  // 登出
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    this.currentUser = null;
    
    // 重定向到登录页
    window.location.href = '/login';
  }
  
  // 注册（仅超级管理员可创建队长账户，队长再创建队员账户）
  async registerClanLeader(email: string, clanId: string, initialMemberCount: number): Promise<void> {
    try {
      if (!this.isSuperAdmin()) {
        throw new Error('Only super admin can register clan leaders');
      }
      
      await axios.post(`${API_BASE_URL}/auth/register-leader`, {
        email,
        clanId,
        initialMemberCount
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Register clan leader error:', error);
      throw error;
    }
  }
  
  // 获取当前用户信息
  getCurrentUser(): UserInfo | null {
    return this.currentUser;
  }
  
  // 刷新用户信息
  async refreshUserInfo(): Promise<UserInfo | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return null;
      }
      
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const user = response.data;
      localStorage.setItem('user_info', JSON.stringify(user));
      this.currentUser = user;
      
      return user;
    } catch (error) {
      console.error('Refresh user info error:', error);
      // 如果是401错误，清除认证信息并重定向到登录页
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.logout();
      }
      throw error;
    }
  }
  
  // 是否已登录
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token') && !!this.currentUser;
  }
  
  // 是否是超级管理员
  isSuperAdmin(): boolean {
    return this.currentUser?.role === UserRole.SUPER_ADMIN;
  }
  
  // 是否是战队队长
  isClanLeader(): boolean {
    return this.currentUser?.role === UserRole.CLAN_LEADER;
  }
  
  // 是否是战队成员
  isClanMember(): boolean {
    return this.currentUser?.role === UserRole.CLAN_MEMBER;
  }
  
  // 是否是特定战队的成员或队长
  isMemberOfClan(clanId: string): boolean {
    return this.currentUser?.clanId === clanId;
  }
  
  // 重置密码请求
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email });
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }
  
  // 重置密码
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
  
  // 修改密码（已登录状态）
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
  
  // 启用两因素认证
  async enableTwoFactor(): Promise<{qrCodeUrl: string, secret: string}> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/enable-2fa`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Enable two-factor error:', error);
      throw error;
    }
  }
  
  // 禁用两因素认证
  async disableTwoFactor(code: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/disable-2fa`, {
        code
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const { success } = response.data;
      
      if (success && this.currentUser) {
        this.currentUser.twoFactorEnabled = false;
        localStorage.setItem('user_info', JSON.stringify(this.currentUser));
      }
      
      return success;
    } catch (error) {
      console.error('Disable two-factor error:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const authService = new AuthService();
