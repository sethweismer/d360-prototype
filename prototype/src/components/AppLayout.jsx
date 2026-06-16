import { useState, useMemo } from 'react';
import { Layout, Switch, Typography, Space, AutoComplete, Input } from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  RobotOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import delegates, { getAllDelegations } from '../data/mockData';
import aetnaLogo from '../assets/aetna-logo.png';
import appianLogo from '../assets/anatomy_icons/appian_logo.jpeg';

const { Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isEditUser, setIsEditUser, showChatbot, setShowChatbot, showDashboard, setShowDashboard, layoutMode, setLayoutMode } = useUser();
  const [searchValue, setSearchValue] = useState('');

  const allDelegations = useMemo(() => getAllDelegations(), []);

  const searchOptions = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (q.length < 2) return [];

    const entityMatches = delegates
      .filter((d) =>
        d.contractedEntity.toLowerCase().includes(q) ||
        (d.trackingId && d.trackingId.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map((d) => ({
        value: `delegate::${d.id}`,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontWeight: 500 }}>{d.contractedEntity}</span>
            <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>{d.trackingId}</Text>
          </div>
        ),
      }));

    const delegationMatches = allDelegations
      .filter((d) => d.delegationTrackingId && d.delegationTrackingId.toLowerCase().includes(q))
      .slice(0, 6)
      .map((d) => ({
        value: `delegation::${d.id}`,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontWeight: 500 }}>{d.delegationTrackingId}</span>
            <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>{d.contractedEntity}</Text>
          </div>
        ),
      }));

    const options = [];
    if (entityMatches.length > 0) options.push({ label: 'Delegated Entities', options: entityMatches });
    if (delegationMatches.length > 0) options.push({ label: 'Delegations', options: delegationMatches });
    return options;
  }, [searchValue, allDelegations]);

  const handleSelect = (value) => {
    if (value.startsWith('delegate::')) {
      navigate(`/delegates/${value.replace('delegate::', '')}`);
    } else if (value.startsWith('delegation::')) {
      const id = value.replace('delegation::', '');
      const del = allDelegations.find((d) => d.id === id);
      if (del) navigate(`/delegates/${del.delegateId}/delegations/${id}`);
    }
    setSearchValue('');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Prototype controls bar */}
      <div style={{
        background: '#F2EFEB',
        borderBottom: '1px solid #DBD8D5',
        padding: '6px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <Space align="center" size={12}>
          {isEditUser ? (
            <EditOutlined style={{ color: '#004D99' }} />
          ) : (
            <EyeOutlined style={{ color: '#8F8C89' }} />
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isEditUser ? 'Edit Mode' : 'Read-Only'}
          </Text>
          <Switch
            checked={isEditUser}
            onChange={setIsEditUser}
            size="small"
            checkedChildren="Edit"
            unCheckedChildren="View"
          />
          <div style={{ width: 1, height: 20, background: '#DBD8D5', margin: '0 4px' }} />
          <DashboardOutlined style={{ color: showDashboard ? '#004D99' : '#8F8C89' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>Dashboard</Text>
          <Switch
            checked={showDashboard}
            onChange={setShowDashboard}
            size="small"
            checkedChildren="On"
            unCheckedChildren="Off"
          />
          <div style={{ width: 1, height: 20, background: '#DBD8D5', margin: '0 4px' }} />
          <AppstoreOutlined style={{ color: layoutMode === 'cardFilters' ? '#004D99' : '#8F8C89' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>Card Filters</Text>
          <Switch
            checked={layoutMode === 'cardFilters'}
            onChange={(checked) => setLayoutMode(checked ? 'cardFilters' : 'standard')}
            size="small"
            checkedChildren="On"
            unCheckedChildren="Off"
          />
          <div style={{ width: 1, height: 20, background: '#DBD8D5', margin: '0 4px' }} />
          <RobotOutlined style={{ color: showChatbot ? '#004D99' : '#8F8C89' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>AI Assistant</Text>
          <Switch
            checked={showChatbot}
            onChange={setShowChatbot}
            size="small"
            checkedChildren="On"
            unCheckedChildren="Off"
          />
        </Space>
      </div>
      {/* App header */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E8E8',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={aetnaLogo}
            alt="Aetna"
            style={{ height: 24, cursor: 'pointer', display: 'block' }}
            onClick={() => navigate('/')}
          />
          <div style={{ width: 1, height: 20, background: '#DBD8D5' }} />
          <span
            style={{ fontSize: 16, fontWeight: 600, color: '#6D2077', cursor: 'pointer', lineHeight: 1 }}
            onClick={() => navigate('/')}
          >
            Delegation Source-of-Truth
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '1px solid #C8C5C2', background: '#F2EFEB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: '#5E5D5A', letterSpacing: '0.02em',
          }}>
            DU
          </div>
          <img src={appianLogo} alt="Appian" style={{ height: 26, display: 'block' }} />
        </div>
      </div>
      {/* Global search bar */}
      <div style={{
        background: '#6D2077',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        <span style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap' }}>
          Find a delegate or delegation:
        </span>
        <AutoComplete
          value={searchValue}
          options={searchOptions}
          onSelect={handleSelect}
          onChange={setSearchValue}
          filterOption={false}
          popupMatchSelectWidth={480}
          style={{ width: 480 }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: '#8F8C89' }} />}
            placeholder="Search by entity name or tracking ID…"
            allowClear
            style={{ height: 32, fontSize: 13 }}
          />
        </AutoComplete>
      </div>
      <Content style={{ margin: '16px 24px' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
