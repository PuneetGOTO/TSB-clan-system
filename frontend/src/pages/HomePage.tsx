import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input, List, Card, Badge, Divider, Typography, Space } from 'antd';
import { SearchOutlined, FireOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Search } = Input;

interface Announcement {
  id: string;
  title: string;
  content: string;
  isTopPinned: boolean;
  createdAt: Date;
}

interface Clan {
  id: string;
  name: string;
  createdAt: Date;
  memberCount: number;
  powerLevel: number;
}

// 模拟数据，实际项目中会从API获取
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '欢迎来到The Strongest Battlegrounds战队系统',
    content: '这是我们全新的战队管理系统，在这里你可以管理战队、查看数据和组织活动。',
    isTopPinned: true,
    createdAt: new Date('2025-03-15')
  },
  {
    id: '2',
    title: '系统更新公告',
    content: '我们添加了新的战队数据同步功能，现在可以自动更新战斗力和击杀榜了。',
    isTopPinned: true,
    createdAt: new Date('2025-03-20')
  }
];

const mockClans: Clan[] = [
  {
    id: 'GJ_Team',
    name: 'GJ战队(主战队)',
    createdAt: new Date('2025-01-01'),
    memberCount: 30,
    powerLevel: 45000
  },
  {
    id: 'Alpha_01',
    name: 'Alpha小队',
    createdAt: new Date('2025-02-15'),
    memberCount: 15,
    powerLevel: 22500
  },
  {
    id: 'Beta_02',
    name: 'Beta突击队',
    createdAt: new Date('2025-03-10'),
    memberCount: 20,
    powerLevel: 28450
  }
];

const HomePage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    // 在实际应用中，这里会从API获取数据
    setAnnouncements(mockAnnouncements);
    setClans(mockClans);
  }, []);

  const filteredClans = clans.filter(clan => 
    clan.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const pinnedAnnouncements = announcements.filter(a => a.isTopPinned);
  const regularAnnouncements = announcements.filter(a => !a.isTopPinned);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
        {/* 左侧：战队列表 */}
        <div style={{ flex: 2 }}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>战队列表</span>
                <Search
                  placeholder="搜索战队名称"
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: 200 }}
                  prefix={<SearchOutlined />}
                />
              </div>
            }
            style={{ marginBottom: '24px' }}
          >
            <List
              itemLayout="horizontal"
              dataSource={filteredClans}
              renderItem={clan => (
                <List.Item 
                  actions={[
                    <span>{clan.memberCount} 成员</span>,
                    <span><FireOutlined style={{ color: '#ff4d4f' }} /> {clan.powerLevel.toLocaleString()} 战力</span>
                  ]}
                >
                  <List.Item.Meta
                    title={<Link to={`/clan/${clan.id}`}>{clan.name}</Link>}
                    description={`创建时间: ${clan.createdAt.toLocaleDateString()}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* 右侧：公告系统 */}
        <div style={{ flex: 1 }}>
          <Card title="公告栏" style={{ marginBottom: '24px' }}>
            {pinnedAnnouncements.map(announcement => (
              <div key={announcement.id} style={{ marginBottom: '16px' }}>
                <Badge.Ribbon text="置顶" color="red">
                  <Card type="inner" title={announcement.title}>
                    <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}>
                      {announcement.content}
                    </Paragraph>
                    <div style={{ textAlign: 'right', color: '#888', fontSize: '12px' }}>
                      {announcement.createdAt.toLocaleDateString()}
                    </div>
                  </Card>
                </Badge.Ribbon>
              </div>
            ))}
            
            {regularAnnouncements.length > 0 && (
              <>
                <Divider orientation="left">历史公告</Divider>
                <List
                  size="small"
                  dataSource={regularAnnouncements}
                  renderItem={item => (
                    <List.Item>
                      <Link to={`/announcements/${item.id}`}>{item.title}</Link>
                      <div>{item.createdAt.toLocaleDateString()}</div>
                    </List.Item>
                  )}
                />
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
