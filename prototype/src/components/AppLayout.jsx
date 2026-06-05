import { Layout, Switch, Typography, Space } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  RobotOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import aetnaLogo from '../assets/aetna-logo.png';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isEditUser, setIsEditUser, showChatbot, setShowChatbot, showDashboard, setShowDashboard } = useUser();

  return (
    <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            background: '#FFFFFF',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E8E8E8',
            height: 56,
          }}
        >
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
            <Text type="secondary" style={{ fontSize: 12 }}>
              Dashboard
            </Text>
            <Switch
              checked={showDashboard}
              onChange={setShowDashboard}
              size="small"
              checkedChildren="On"
              unCheckedChildren="Off"
            />
            <div style={{ width: 1, height: 20, background: '#DBD8D5', margin: '0 4px' }} />
            <RobotOutlined style={{ color: showChatbot ? '#004D99' : '#8F8C89' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              AI Assistant
            </Text>
            <Switch
              checked={showChatbot}
              onChange={setShowChatbot}
              size="small"
              checkedChildren="On"
              unCheckedChildren="Off"
            />
            <UserOutlined style={{ marginLeft: 8, color: '#5E5D5A' }} />
          </Space>
        </Header>
        <Content style={{ margin: '16px 24px' }}>
          <Outlet />
        </Content>
    </Layout>
  );
}
