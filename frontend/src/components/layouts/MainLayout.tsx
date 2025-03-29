import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Typography } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  LoginOutlined, 
  UserOutlined,
  DashboardOutlined 
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  // 在实际应用中，这会从用户认证状态获取
  const isLoggedIn = false;
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', background: '#1a1a2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0, color: '#fff' }}>
              TSB战队系统
            </Title>
          </Link>
          
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ flex: 1, minWidth: 0, background: 'transparent', borderBottom: 'none', marginLeft: '20px' }}
            items={[
              {
                key: 'home',
                icon: <HomeOutlined />,
                label: <Link to="/">首页</Link>,
              },
              {
                key: 'clans',
                icon: <TeamOutlined />,
                label: <Link to="/clans">战队列表</Link>,
              }
            ]}
          />
        </div>
        
        <div>
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button type="primary" icon={<DashboardOutlined />}>
                <Link to="/clan-dashboard" style={{ color: 'inherit' }}>
                  我的战队
                </Link>
              </Button>
              <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </div>
          ) : (
            <Button type="primary" icon={<LoginOutlined />}>
              <Link to="/login" style={{ color: 'inherit' }}>
                登录
              </Link>
            </Button>
          )}
        </div>
      </Header>
      
      <Content style={{ padding: '24px 50px', position: 'relative' }}>
        <Outlet />
      </Content>
      
      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff', padding: '12px' }}>
        The Strongest Battlegrounds 战队系统 ©{new Date().getFullYear()} 版权所有
      </Footer>
    </Layout>
  );
};

export default MainLayout;
