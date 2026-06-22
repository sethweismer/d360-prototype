import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Typography, Tag, Space, Button, Card, Empty, Divider, Table } from 'antd';
import {
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { getDelegationById } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import DelegateNotes from '../components/DelegateNotes';

const { Title, Text } = Typography;

const pillStyle = { fontSize: 12, color: '#1A1A1A', border: 'none' };
const typePillColors = { 'Clinical-UM': '#F0E4FA', 'Clinical-PHM': '#E0ECF7', Claims: '#F5EDE0' };
const entityTypePillColors = { Provider: '#D6E4F0', Vendor: '#FDE8D0' };
const lobPillColors = {
  Medicare: '#E8D5F5', Medicaid: '#D6E4F0', Commercial: '#FDE8D0',
  'I-SNP': '#E0D4F0', 'D-SNP': '#D0DCE8', 'C-SNP': '#E8E0D0',
};
function getProductPillColor(name) {
  if (name.startsWith('Medicare')) return '#E8D5F5';
  if (name.startsWith('Medicaid')) return '#D6E4F0';
  if (name.startsWith('Commercial')) return '#FDE8D0';
  if (name.startsWith('I-SNP')) return '#E0D4F0';
  if (name.startsWith('D-SNP')) return '#D0DCE8';
  if (name.startsWith('C-SNP')) return '#E8E0D0';
  return '#EDEDEB';
}

function MissingValue() {
  return <Text type="secondary" style={{ fontStyle: 'italic', color: '#CCC9C6' }}>--</Text>;
}

function Field({ label, value, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 400, color: '#5E5D5A', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>
        {children ?? (value === null || value === undefined || value === ''
          ? <MissingValue />
          : value)}
      </div>
    </div>
  );
}

export default function DelegationDetail() {
  const { delegateId, delegationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const result = getDelegationById(delegationId);

  if (!result) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <Empty description="Delegation not found" />
        <Button onClick={() => navigate(`/delegates/${delegateId}`)} style={{ marginTop: 16 }}>
          Back to Delegate
        </Button>
      </div>
    );
  }

  const { delegation: del, product, delegate } = result;

  const typeColor = '#EDEDEB';

  // Navigation context — report-provided list takes priority over delegate's full list
  const reportContext = location.state?.delegationList ? location.state : null;
  const navList = reportContext
    ? reportContext.delegationList
    : delegate.products.flatMap((p) =>
        p.delegations.map((d) => ({ id: d.id, delegateId: delegate.id }))
      );
  const currentIndex = navList.findIndex((d) => d.id === delegationId);
  const prevDelegation = currentIndex > 0 ? navList[currentIndex - 1] : null;
  const nextDelegation = currentIndex < navList.length - 1 ? navList[currentIndex + 1] : null;

  const goTo = (item) => navigate(
    `/delegates/${item.delegateId}/delegations/${item.id}`,
    { state: reportContext }
  );

  const backPath = reportContext?.returnPath || `/delegates/${delegateId}`;
  const backLabel = reportContext?.returnLabel || delegate.contractedEntity;

  return (
    <div>
      {/* Back navigation */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(backPath)}
          style={{ color: '#004D99' }}
        >
          Back to {backLabel}
        </Button>
      </Space>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            {del.delegationTrackingId || del.id}
          </Title>
          <Space align="center">
            <Text type="secondary" style={{ fontSize: 13 }}>
              {currentIndex + 1} of {navList.length}
            </Text>
            <Button
              icon={<LeftOutlined />}
              disabled={!prevDelegation}
              onClick={() => prevDelegation && goTo(prevDelegation)}
            >
              Previous delegation
            </Button>
            <Button
              iconPosition="end"
              icon={<RightOutlined />}
              disabled={!nextDelegation}
              onClick={() => nextDelegation && goTo(nextDelegation)}
            >
              Next delegation
            </Button>
          </Space>
        </div>
        {false && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 6, alignItems: 'center' }}>
          <Tag style={{ ...pillStyle, background: typeColor, padding: '2px 8px', margin: 0 }}>
            {del.delegationType}
          </Tag>
          <Tag style={{ ...pillStyle, background: '#EDEDEB', padding: '2px 8px', margin: 0 }}>
            {product.lob}
          </Tag>
          <Tag style={{ ...pillStyle, background: '#EDEDEB', padding: '2px 8px', margin: 0 }}>
            {product.name}
          </Tag>
          {(del.effectiveDate || del.termDate) && (
            <Text type="secondary" style={{ fontSize: 14 }}>
              <CalendarOutlined style={{ marginRight: 4, color: '#7D3F98' }} />
              {[
                del.effectiveDate && `Effective: ${del.effectiveDate}`,
                del.termDate && `Term: ${del.termDate}`,
              ].filter(Boolean).join(' · ')}
            </Text>
          )}
        </div>}
      </div>

      {/* Delegation details — transposed table experiment */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 500 }}>Delegation Details</span>
      </div>
      <div style={{ marginBottom: 24 }} className="table-bordered">
        <Table
            showHeader={false}
            pagination={false}
            size="small"
            showSorterTooltip={false}
            rowKey="label"
            dataSource={[
              { label: 'LOB', value: product.lob },
              { label: 'Product', value: product.name },
              { label: 'Delegation Type', value: <Tag style={{ ...pillStyle, background: typeColor }}>{del.delegationType}</Tag> },
              { label: 'Status', value: <StatusBadge status={del.status} /> },
              { label: 'Eff. Date', value: del.effectiveDate },
              { label: 'Term Date', value: del.termDate },
              { label: 'Audited Entity', value: del.auditedEntity },
              { label: 'Audited Entity Status', value: del.auditedEntityStatus },
              { label: 'MSO', value: del.mso },
              { label: 'Service Area', value: del.serviceArea },
              { label: 'Delegated Services', value: del.delegatedServices },
              { label: 'Engagement Manager', value: del.engagementManager },
              { label: 'Corrective Action Plan', value: del.correctiveActionPlan ? <Tag color="red">Yes</Tag> : 'No' },
            ]}
            columns={[
              {
                dataIndex: 'label',
                width: 200,
                onCell: () => ({ style: { background: '#F2EFEB' } }),
                render: (v) => <span style={{ fontSize: 13, color: '#1A1A19', fontWeight: 600 }}>{v}</span>,
              },
              {
                dataIndex: 'value',
                render: (v) => (
                  <span style={{ fontSize: 13, fontWeight: 400 }}>
                    {v === null || v === undefined || v === '' ? <MissingValue /> : v}
                  </span>
                ),
              },
            ]}
          />
      </div>

      {/* Delegating Entity overview */}
      <Card
        size="small"
        style={{ marginBottom: 24, borderLeft: '3px solid #004D99' }}
        title={
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            <AppstoreOutlined style={{ marginRight: 8, color: '#004D99' }} />
            Delegating Entity
          </span>
        }
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 32px', alignItems: 'center' }}>
          <a
            onClick={() => navigate(`/delegates/${delegate.id}`)}
            style={{ fontWeight: 600, fontSize: 15, color: '#004D99' }}
          >
            {delegate.contractedEntity}
          </a>
          <Tag style={{ ...pillStyle, background: '#EDEDEB' }}>
            {delegate.entityType}
          </Tag>
          <Text type="secondary">
            <span style={{ fontWeight: 500 }}>Tracking ID:</span> {delegate.trackingId}
          </Text>
          {delegate.address && (
            <Text type="secondary">
              <EnvironmentOutlined style={{ marginRight: 4, color: '#7D3F98' }} />
              {delegate.address}
            </Text>
          )}
          {(delegate.contractEffectiveDate || delegate.contractRenewalDate || delegate.contractTermDate) && (
            <Text type="secondary">
              <CalendarOutlined style={{ marginRight: 4, color: '#7D3F98' }} />
              {[
                delegate.contractEffectiveDate && `Effective: ${delegate.contractEffectiveDate}`,
                delegate.contractRenewalDate && `Renewal: ${delegate.contractRenewalDate}`,
                delegate.contractTermDate && `Term: ${delegate.contractTermDate}`,
              ].filter(Boolean).join(' · ')}
            </Text>
          )}
        </div>
      </Card>

      {/* Notes */}
      <DelegateNotes initialNotes={[]} />
    </div>
  );
}
