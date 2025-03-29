import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Badge, Modal } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Header, Content, Sider, Footer } = Layout;
const { Title } = Typography;

const ClanLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  
  // 实际应用中，这将从用户认证状态中获取
  const clanName = "Alpha_01";
  const leaderName = "队长";
  const notificationCount = 2;
  
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
      key: '/clan-dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/clan-dashboard">战队概览</Link>,
    },
    {
      key: '/clan-dashboard/members',
      icon: <TeamOutlined />,
      label: <Link to="/clan-dashboard/members">成员管理</Link>,
    },
    {
      key: '/clan-dashboard/tasks',
      icon: <FileTextOutlined />,
      label: <Link to="/clan-dashboard/tasks">任务进度</Link>,
    },
    {
      key: '/clan-dashboard/statistics',
      icon: <BarChartOutlined />,
      label: <Link to="/clan-dashboard/statistics">数据统计</Link>,
    },
    {
      key: '/clan-dashboard/achievements',
      icon: <TrophyOutlined />,
      label: <Link to="/clan-dashboard/achievements">战队成就</Link>,
    },
    {
      key: '/clan-dashboard/settings',
      icon: <SettingOutlined />,
      label: <Link to="/clan-dashboard/settings">战队设置</Link>,
    }
  ];
  
  const notificationsMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: <div>新成员申请加入战队</div>,
        },
        {
          key: '2',
          label: <div>战队任务已更新</div>,
        },
        {
          key: '3',
          label: <div style={{ textAlign: 'center' }}>
            <Link to="/clan-dashboard/notifications">查看全部通知</Link>
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
          background: '#0f3460'
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
            <Link to="/clan-dashboard">
              <Title level={4} style={{ margin: 0, color: '#fff' }}>
                {clanName} 战队
              </Title>
            </Link>
          )}
        </div>
        
        <Menu
          theme="dark"
          defaultSelectedKeys={['/clan-dashboard']}
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
                {leaderName}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }}>
          <Outlet />
        </Content>
        
        <Footer style={{ textAlign: 'center', padding: '12px' }}>
          TSB战队管理系统 ©{new Date().getFullYear()} 战队专用版
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ClanLayout;
