import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Avatar, Typography, Tabs, Table, Statistic, Row, Col, Tag, Button, Empty, Spin, List } from 'antd';
import { 
  TeamOutlined, 
  TrophyOutlined, 
  FireOutlined, 
  LinkOutlined, 
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ClanDetails {
  id: string;
  name: string;
  logo: string | null;
  description: string;
  foundedDate: string;
  totalPower: number;
  memberCount: number;
  discordLink: string;
  announcements: {
    id: string;
    title: string;
    content: string;
    date: string;
  }[];
}

interface MemberData {
  id: string;
  gameId: string;
  profileLink: string;
  kills: number;
  joinDate: string;
}

const ClanDetails: React.FC = () => {
  const { clanId } = useParams<{ clanId: string }>();
  const [loading, setLoading] = useState(true);
  const [clan, setClan] = useState<ClanDetails | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);

  useEffect(() => {
    // 在真实应用中，这将是API调用
    setTimeout(() => {
      if (clanId === 'Alpha_01') {
        setClan({
          id: 'Alpha_01',
          name: 'Alpha小队',
          logo: null, // 实际应用中会是图片URL
          description: 'Alpha小队是《The Strongest Battlegrounds》游戏中的一支精英战队，专注于团队协作和战术配合。我们欢迎各位热爱游戏、注重团队配合的玩家加入！',
          foundedDate: '2025-02-15',
          totalPower: 22500,
          memberCount: 15,
          discordLink: 'https://discord.gg/example',
          announcements: [
            {
              id: '1',
              title: '周末活动公告',
              content: '本周末我们将组织一次团队战役，请所有成员于周六晚8点准时在Discord集合。',
              date: '2025-03-25'
            },
            {
              id: '2',
              title: '招募新成员',
              content: '我们正在招募新的战队成员，如果你是有经验的玩家并且热爱团队合作，欢迎申请加入！',
              date: '2025-03-20'
            }
          ]
        });
        
        setMembers([
          {
            id: '1',
            gameId: 'TSB_User01',
            profileLink: 'https://example.com/profile/TSB_User01',
            kills: 142,
            joinDate: '2025-02-15'
          },
          {
            id: '2',
            gameId: 'TSB_User02',
            profileLink: 'https://example.com/profile/TSB_User02',
            kills: 128,
            joinDate: '2025-02-15'
          },
          {
            id: '3',
            gameId: 'TSB_User03',
            profileLink: 'https://example.com/profile/TSB_User03',
            kills: 95,
            joinDate: '2025-02-18'
          },
          {
            id: '4',
            gameId: 'TSB_User04',
            profileLink: 'https://example.com/profile/TSB_User04',
            kills: 87,
            joinDate: '2025-02-20'
          },
          {
            id: '5',
            gameId: 'TSB_User05',
            profileLink: 'https://example.com/profile/TSB_User05',
            kills: 65,
            joinDate: '2025-02-25'
          }
        ]);
      } else if (clanId === 'Beta_02') {
        setClan({
          id: 'Beta_02',
          name: 'Beta突击队',
          logo: null,
          description: 'Beta突击队专注于高难度任务和精准作战，我们拥有游戏中最有经验的玩家团队之一。',
          foundedDate: '2025-03-10',
          totalPower: 28450,
          memberCount: 20,
          discordLink: 'https://discord.gg/beta-example',
          announcements: [
            {
              id: '1',
              title: '战术训练日程',
              content: '本周将进行三次战术训练，请所有队员查看Discord中的详细安排。',
              date: '2025-03-28'
            }
          ]
        });
        
        // 模拟Beta_02战队成员数据
        setMembers([
          {
            id: '1',
            gameId: 'TSB_Beta01',
            profileLink: 'https://example.com/profile/TSB_Beta01',
            kills: 156,
            joinDate: '2025-03-10'
          },
          {
            id: '2',
            gameId: 'TSB_Beta02',
            profileLink: 'https://example.com/profile/TSB_Beta02',
            kills: 145,
            joinDate: '2025-03-10'
          }
        ]);
      } else if (clanId === 'GJ_Team') {
        setClan({
          id: 'GJ_Team',
          name: 'GJ战队(主战队)',
          logo: null,
          description: 'GJ战队是《The Strongest Battlegrounds》游戏的主战队，由游戏创始成员组建，拥有最强的战斗力和战术配合。',
          foundedDate: '2025-01-01',
          totalPower: 45000,
          memberCount: 30,
          discordLink: 'https://discord.gg/gj-example',
          announcements: [
            {
              id: '1',
              title: '战队系统更新公告',
              content: '我们很高兴地宣布，战队管理系统正式上线，现在可以更方便地管理战队成员和活动了！',
              date: '2025-03-30'
            },
            {
              id: '2',
              title: '跨战队资源调配',
              content: '主战队将于下周进行资源调配，为各子战队提供支持，请各队长做好准备。',
              date: '2025-03-25'
            }
          ]
        });
        
        // GJ战队成员数据太多，这里只展示前几个
        setMembers([
          {
            id: '1',
            gameId: 'TSB_Leader',
            profileLink: 'https://example.com/profile/TSB_Leader',
            kills: 230,
            joinDate: '2025-01-01'
          },
          {
            id: '2',
            gameId: 'TSB_Elite01',
            profileLink: 'https://example.com/profile/TSB_Elite01',
            kills: 212,
            joinDate: '2025-01-01'
          }
        ]);
      }
      
      setLoading(false);
    }, 1000);
  }, [clanId]);

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
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="加载战队数据中..." />
      </div>
    );
  }

  if (!clan) {
    return (
      <Empty
        description={
          <span>找不到ID为 <Text code>{clanId}</Text> 的战队</span>
        }
      >
        <Button type="primary">
          <Link to="/">返回首页</Link>
        </Button>
      </Empty>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          {clan.logo ? (
            <Avatar src={clan.logo} size={64} />
          ) : (
            <Avatar icon={<TeamOutlined />} size={64} style={{ backgroundColor: '#1890ff' }} />
          )}
          <div style={{ marginLeft: 16 }}>
            <Title level={2} style={{ margin: 0 }}>{clan.name}</Title>
            <Text type="secondary">
              <CalendarOutlined style={{ marginRight: 8 }} />
              创建于 {clan.foundedDate}
            </Text>
          </div>
        </div>
        
        <Paragraph>{clan.description}</Paragraph>
        
        <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
          <Col span={8}>
            <Statistic
              title="战队战斗力"
              value={clan.totalPower}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="成员数量"
              value={clan.memberCount}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="社群链接"
              value=""
              prefix={<LinkOutlined />}
              valueRender={() => (
                <Button type="link" href={clan.discordLink} target="_blank" style={{ padding: 0 }}>
                  Discord
                </Button>
              )}
            />
          </Col>
        </Row>
        
        <Tabs defaultActiveKey="1">
          <TabPane tab="公告" key="1">
            {clan.announcements.length > 0 ? (
              <List
                itemLayout="vertical"
                dataSource={clan.announcements}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    extra={
                      <div style={{ color: '#8c8c8c' }}>
                        {item.date}
                      </div>
                    }
                  >
                    <List.Item.Meta
                      title={item.title}
                    />
                    {item.content}
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无公告" />
            )}
          </TabPane>
          <TabPane tab="成员列表" key="2">
            <Table 
              columns={memberColumns} 
              dataSource={members} 
              rowKey="id" 
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ClanDetails;
