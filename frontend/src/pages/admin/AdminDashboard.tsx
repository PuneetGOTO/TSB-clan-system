import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Tag, Typography, Progress, Alert } from 'antd';
import { 
  TeamOutlined, 
  TrophyOutlined, 
  RiseOutlined, 
  SafetyOutlined,
  PlusOutlined,
  SyncOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface ClanData {
  id: string;
  name: string;
  leader: string;
  members: number;
  powerLevel: number;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
}

interface RecentActivity {
  id: string;
  type: string;
  actor: string;
  description: string;
  timestamp: string;
  ipAddress: string;
}

const AdminDashboard: React.FC = () => {
  // 在实际应用中，这些数据会从API获取
  const [loading, setLoading] = useState(true);
  const [clanData, setClanData] = useState<ClanData[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setClanData([
        {
          id: 'GJ_Team',
          name: 'GJ战队(主战队)',
          leader: 'an920513@gmail.com',
          members: 30,
          powerLevel: 45000,
          status: 'active',
          lastActive: '10分钟前'
        },
        {
          id: 'Alpha_01',
          name: 'Alpha小队',
          leader: 'alpha-leader@example.com',
          members: 15,
          powerLevel: 22500,
          status: 'active',
          lastActive: '2小时前'
        },
        {
          id: 'Beta_02',
          name: 'Beta突击队',
          leader: 'beta-leader@example.com',
          members: 20,
          powerLevel: 28450,
          status: 'active',
          lastActive: '30分钟前'
        }
      ]);
      
      setActivities([
        {
          id: '1',
          type: 'MEMBER_REMOVE',
          actor: 'beta-leader@example.com',
          description: '移除玩家ID: TSB_User99（原因：连续离线超7天）',
          timestamp: '2025-03-30 00:15:22',
          ipAddress: '192.168.1.100'
        },
        {
          id: '2',
          type: 'RESOURCE_TRANSFER',
          actor: 'an920513@gmail.com',
          description: '资源调配: 从GJ_Team向Alpha_01转移5000战力值',
          timestamp: '2025-03-29 22:30:45',
          ipAddress: '192.168.1.1'
        },
        {
          id: '3',
          type: 'NEW_CLAN',
          actor: 'an920513@gmail.com',
          description: '创建新战队: Beta_02',
          timestamp: '2025-03-29 20:05:10',
          ipAddress: '192.168.1.1'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
  const clanColumns: ColumnsType<ClanData> = [
    {
      title: '战队ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '战队名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '队长',
      dataIndex: 'leader',
      key: 'leader',
    },
    {
      title: '成员数',
      dataIndex: 'members',
      key: 'members',
    },
    {
      title: '战斗力',
      dataIndex: 'powerLevel',
      key: 'powerLevel',
      render: (value) => <span>{value.toLocaleString()}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = '活跃';
        
        if (status === 'inactive') {
          color = 'volcano';
          text = '不活跃';
        } else if (status === 'pending') {
          color = 'geekblue';
          text = '待激活';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '最后活动',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" size="small">查看详情</Button>
      ),
    }
  ];
  
  const activityColumns: ColumnsType<RecentActivity> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let color = 'blue';
        
        if (type.includes('REMOVE')) {
          color = 'red';
        } else if (type.includes('TRANSFER')) {
          color = 'orange';
        } else if (type.includes('NEW')) {
          color = 'green';
        }
        
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: '操作者',
      dataIndex: 'actor',
      key: 'actor',
    },
    {
      title: '详情',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    }
  ];
  
  // 系统状态相关数据
  const backupProgress = 85;
  const serverStatus = 'normal'; // 可能的值: normal, warning, error
  
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>管理控制台</Title>
        <Alert 
          message="系统运行正常" 
          description="最近一次全量备份于 2025-03-30 03:00:00 完成，数据同步状态良好。" 
          type="success" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      </div>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总战队数"
              value={clanData.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总成员数"
              value={clanData.reduce((acc, clan) => acc + clan.members, 0)}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总战斗力"
              value={clanData.reduce((acc, clan) => acc + clan.powerLevel, 0)}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="系统安全级别"
              value="高"
              valueStyle={{ color: '#3f8600' }}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card 
            title="战队列表" 
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                创建战队
              </Button>
            }
          >
            <Table 
              columns={clanColumns} 
              dataSource={clanData} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="系统状态">
            <div style={{ marginBottom: 16 }}>
              <Statistic title="服务器状态" value={serverStatus === 'normal' ? '正常' : '异常'} valueStyle={{ color: serverStatus === 'normal' ? '#3f8600' : '#cf1322' }} />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>数据备份进度</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress percent={backupProgress} status="active" />
            </div>
            
            <div style={{ marginTop: 16 }}>
              <Button icon={<SyncOutlined />} block>
                同步游戏数据
              </Button>
            </div>
          </Card>
          
          <Card title="最近操作记录" style={{ marginTop: 16 }}>
            <Table 
              columns={activityColumns} 
              dataSource={activities} 
              rowKey="id" 
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
