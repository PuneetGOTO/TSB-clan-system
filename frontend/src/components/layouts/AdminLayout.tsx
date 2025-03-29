import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Badge, Modal } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ExclamationCircleOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  SafetyOutlined
} from '@ant-design/icons';

const { Header, Content, Sider, Footer } = Layout;
const { Title } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 实际应用中，这会从认证状态获取
  const adminName = "超级管理员";
  const notificationCount = 3;
  
  const signOut = () => {
    Modal.confirm({
      title: '确认退出登录',
      icon: <ExclamationCircleOutlined />,
      content: '您确定要退出当前登录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        // 在实际应用中，这里会调用登出API
        navigate('/');
      }
    });
  };
  
  const mainMenuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">管理控制台</Link>,
    },
    {
      key: '/admin/clans',
      icon: <TeamOutlined />,
      label: <Link to="/admin/clans">战队管理</Link>,
    },
    {
      key: '/admin/data',
      icon: <DatabaseOutlined />,
      label: <Link to="/admin/data">数据管理</Link>,
    },
    {
      key: '/admin/monitor',
      icon: <LineChartOutlined />,
      label: <Link to="/admin/monitor">监控面板</Link>,
    },
    {
      key: '/admin/security',
      icon: <SafetyOutlined />,
      label: <Link to="/admin/security">安全设置</Link>,
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">系统设置</Link>,
    }
  ];
  
  const notificationsMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: <div>Alpha_01战队申请资源调配</div>,
        },
        {
          key: '2',
          label: <div>新的成员待批准加入Beta_02</div>,
        },
        {
          key: '3',
          label: <div>系统备份完成</div>,
        },
        {
          key: '4',
          label: <div style={{ textAlign: 'center' }}>
            <Link to="/admin/notifications">查看全部通知</Link>
          </div>,
        }
      ]}
    />
  );
  
  const userMenu = (
    <Menu
      items={[
        {
          key: '1',
          icon: <UserOutlined />,
          label: <div>个人资料</div>,
        },
        {
          key: '2',
          icon: <SettingOutlined />,
          label: <div>账号设置</div>,
        },
        {
          type: 'divider',
        },
        {
          key: '3',
          icon: <LogoutOutlined />,
          label: <div onClick={signOut}>退出登录</div>,
          danger: true
        }
      ]}
    />
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{ 
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#1a1a2e'
        }}
      >
        <div style={{ 
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 16px'
        }}>
          {!collapsed && (
            <Link to="/admin">
              <Title level={4} style={{ margin: 0, color: '#fff' }}>
                TSB管理后台
              </Title>
            </Link>
          )}
        </div>
        
        <Menu
          theme="dark"
          defaultSelectedKeys={[location.pathname]}
          mode="inline"
          style={{ background: 'transparent' }}
          items={mainMenuItems}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? '80px' : '200px', transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: '64px', height: '64px' }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Dropdown overlay={notificationsMenu} trigger={['click']} placement="bottomRight">
              <Badge count={notificationCount} size="small">
                <Button type="text" icon={<BellOutlined style={{ fontSize: '16px' }} />} />
              </Badge>
            </Dropdown>
            
            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer'
              }}>
                <Avatar icon={<UserOutlined />} />
                {adminName}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }}>
          <Outlet />
        </Content>
        
        <Footer style={{ textAlign: 'center', padding: '12px' }}>
          TSB战队管理系统 ©{new Date().getFullYear()} 管理员专用
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
