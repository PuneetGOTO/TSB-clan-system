import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API基础URL，在生产环境中应该替换为实际的API地址
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
});

// 请求拦截器：添加认证令牌
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误和刷新令牌
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // 如果是401错误（未授权）且不是刷新令牌的请求
    if (error.response?.status === 401 && 
        originalRequest && 
        !(originalRequest.url?.includes('auth/refresh'))) {
      
      // 尝试刷新令牌
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // 没有刷新令牌，强制用户重新登录
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });
        
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // 保存新的令牌
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        // 更新原始请求的认证头
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // 重试原始请求
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新令牌失败，强制用户重新登录
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API服务类
class ApiService {
  // 战队相关API
  
  // 获取所有战队列表
  async getClans() {
    try {
      const response = await apiClient.get('/clans');
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 获取特定战队详情
  async getClanById(clanId: string) {
    try {
      const response = await apiClient.get(`/clans/${clanId}`);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 创建新战队
  async createClan(clanData: any) {
    try {
      const response = await apiClient.post('/clans', clanData);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 更新战队信息
  async updateClan(clanId: string, clanData: any) {
    try {
      const response = await apiClient.put(`/clans/${clanId}`, clanData);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 删除战队
  async deleteClan(clanId: string) {
    try {
      const response = await apiClient.delete(`/clans/${clanId}`);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 战队成员相关API
  
  // 获取战队成员列表
  async getClanMembers(clanId: string) {
    try {
      const response = await apiClient.get(`/clans/${clanId}/members`);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 添加战队成员
  async addClanMember(clanId: string, memberData: any) {
    try {
      const response = await apiClient.post(`/clans/${clanId}/members`, memberData);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 移除战队成员
  async removeClanMember(clanId: string, memberId: string, reason: string) {
    try {
      const response = await apiClient.delete(`/clans/${clanId}/members/${memberId}`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 公告相关API
  
  // 获取公告列表
  async getAnnouncements() {
    try {
      const response = await apiClient.get('/announcements');
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 创建公告
  async createAnnouncement(announcementData: any) {
    try {
      const response = await apiClient.post('/announcements', announcementData);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 更新公告
  async updateAnnouncement(announcementId: string, announcementData: any) {
    try {
      const response = await apiClient.put(`/announcements/${announcementId}`, announcementData);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 删除公告
  async deleteAnnouncement(announcementId: string) {
    try {
      const response = await apiClient.delete(`/announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 任务相关API
  
  // 获取战队任务列表
  async getClanTasks(clanId: string) {
    try {
      const response = await apiClient.get(`/clans/${clanId}/tasks`);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 创建战队任务
  async createClanTask(clanId: string, taskData: any) {
    try {
      const response = await apiClient.post(`/clans/${clanId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 更新战队任务进度
  async updateClanTaskProgress(clanId: string, taskId: string, progressData: any) {
    try {
      const response = await apiClient.patch(`/clans/${clanId}/tasks/${taskId}/progress`, progressData);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  // 错误处理
  private handleError(error: Error) {
    console.error('API Error:', error);
    // 在此可以添加其他错误处理逻辑，如发送到错误监控服务
  }
}

// 导出单例实例
export const apiService = new ApiService();
