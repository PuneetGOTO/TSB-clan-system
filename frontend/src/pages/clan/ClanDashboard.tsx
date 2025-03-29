import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Progress, Button, Avatar, Tag, Tooltip, Badge } from 'antd';
import { 
  TeamOutlined, 
  TrophyOutlined, 
  FireOutlined, 
  CheckCircleOutlined,
  LinkOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface MemberData {
  id: string;
  gameId: string;
  profileLink: string;
  kills: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
}

interface TaskData {
  id: string;
  name: string;
  progress: [number, number]; // [current, total]
  description: string;
  color: string;
  deadline?: string;
}

const ClanDashboard: React.FC = () => {
  // 在实际应用中，这些数据会从API获取
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [taskData, setTaskData] = useState<TaskData[]>([]);
  const [clanLogo, setClanLogo] = useState<string | null>(null);
  
  // 模拟数据，实际应用中会从API获取
  const clanName = 'Alpha_01';
  const totalPower = 22500;
  const memberCount = 15;
  const discordLink = 'https://discord.gg/example';

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setMemberData([
        {
          id: '1',
          gameId: 'TSB_User01',
          profileLink: 'https://example.com/profile/TSB_User01',
          kills: 142,
          joinDate: '2025-02-15',
          status: 'active',
          lastActive: '3小时前'
        },
        {
          id: '2',
          gameId: 'TSB_User02',
          profileLink: 'https://example.com/profile/TSB_User02',
          kills: 128,
          joinDate: '2025-02-15',
          status: 'active',
          lastActive: '1天前'
        },
        {
          id: '3',
          gameId: 'TSB_User03',
          profileLink: 'https://example.com/profile/TSB_User03',
          kills: 95,
          joinDate: '2025-02-18',
          status: 'active',
          lastActive: '5小时前'
        },
        {
          id: '4',
          gameId: 'TSB_User04',
          profileLink: 'https://example.com/profile/TSB_User04',
          kills: 87,
          joinDate: '2025-02-20',
          status: 'inactive',
          lastActive: '5天前'
        },
        {
          id: '5',
          gameId: 'TSB_User05',
          profileLink: 'https://example.com/profile/TSB_User05',
          kills: 65,
          joinDate: '2025-02-25',
          status: 'active',
          lastActive: '1小时前'
        }
      ]);
      
      setTaskData([
        {
          id: '1',
          name: '周末团队战',
          progress: [3, 5],
          description: '周末与Beta_02联合团队战役，目标完成5次团队匹配',
          color: '#1890ff'
        },
        {
          id: '2',
          name: '新成员招募',
          progress: [8, 10],
          description: '3月份招募计划，目标10名新成员',
          color: '#52c41a'
        },
        {
          id: '3',
          name: '资源收集',
          progress: [2500, 5000],
          description: '收集5000单位资源用于升级基地',
          color: '#722ed1'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
  const memberColumns: ColumnsType<MemberData> = [
    {
      title: '游戏ID',
      dataIndex: 'gameId',
      key: 'gameId',
      render: (gameId, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
          <a href={record.profileLink} target="_blank" rel="noopener noreferrer">
            {gameId}
          </a>
        </div>
      )
    },
    {
      title: '击杀数',
      dataIndex: 'kills',
      key: 'kills',
      sorter: (a, b) => a.kills - b.kills,
      render: (kills) => (
        <span>
          <FireOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
          {kills}
        </span>
      )
    },
    {
      title: '加入时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
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
        } else if (status === 'suspended') {
          color = 'red';
          text = '已暂停';
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
      render: () => (
        <div>
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small" danger>踢出</Button>
        </div>
      ),
    }
  ];
  
  const uploadLogo = () => {
    // 在实际应用中，这里会打开文件上传对话框
    console.log('上传LOGO');
  };
  
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>{clanName} 战队管理</Title>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {clanLogo ? (
                <Avatar src={clanLogo} size={120} />
              ) : (
                <div 
                  style={{ 
                    width: 120, 
                    height: 120, 
                    border: '1px dashed #d9d9d9', 
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={uploadLogo}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, color: '#1890ff' }}>
                      <TeamOutlined />
                    </div>
                    <div style={{ marginTop: 8 }}>点击上传LOGO</div>
                  </div>
                </div>
              )}
              <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>{clanName}</Title>
              <Text type="secondary">队长专用管理面板</Text>
            </div>
          </Card>
          
          <Card style={{ marginTop: 16 }}>
            <Statistic
              title="战队总战斗力"
              value={totalPower}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <div style={{ marginTop: 16 }}>
              <Statistic
                title="成员数量"
                value={memberCount}
                prefix={<TeamOutlined />}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <Text strong>社群链接</Text>
              <div style={{ marginTop: 8 }}>
                <Button type="link" icon={<LinkOutlined />} href={discordLink} target="_blank">
                  Discord
                </Button>
                <Button type="text" size="small" icon={<EditOutlined />}>
                  编辑
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={18}>
          <Card 
            title="本周击杀TOP榜单" 
            extra={
              <Tooltip title="最近同步时间: 1小时前">
                <Button type="text" icon={<SyncOutlined />}>
                  同步数据
                </Button>
              </Tooltip>
            }
          >
            <Table 
              columns={memberColumns.filter(col => ['gameId', 'kills', 'status', 'lastActive'].includes(col.key as string))} 
              dataSource={[...memberData].sort((a, b) => b.kills - a.kills).slice(0, 10)} 
              rowKey="id" 
              loading={loading}
              pagination={false}
            />
          </Card>
          
          <Card title="任务进度" style={{ marginTop: 16 }}>
            {taskData.map(task => (
              <div key={task.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>{task.name}</Text>
                  <Text>{`${task.progress[0]}/${task.progress[1]}`}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Progress 
                    percent={Math.round((task.progress[0] / task.progress[1]) * 100)} 
                    strokeColor={task.color}
                    status="active"
                  />
                </div>
                <Text type="secondary">{task.description}</Text>
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <Button type="text" size="small" icon={<EditOutlined />}>
                    编辑进度
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            title="成员管理" 
            extra={
              <Button type="primary" icon={<CloudDownloadOutlined />}>
                导出CSV
              </Button>
            }
          >
            <Table 
              columns={memberColumns} 
              dataSource={memberData} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClanDashboard;
