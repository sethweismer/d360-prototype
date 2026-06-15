import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Table,
  Collapse,
  message,
  Empty,
  Segmented,
} from 'antd';
import {
  ArrowLeftOutlined,
  CopyOutlined,
  ContactsOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileProtectOutlined,
  ToolOutlined,
  LaptopOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import delegates, { getDelegationsForDelegate } from '../data/mockData';
import { useUser } from '../context/UserContext';
import StatusBadge from '../components/StatusBadge';
import DelegateNotes from '../components/DelegateNotes';

const { Title, Text } = Typography;

const pillStyle = { fontSize: 12, color: '#1A1A1A', border: 'none' };
const typePillColors = {
  'Clinical-UM': '#F0E4FA',
  'Clinical-PHM': '#E0ECF7',
  Claims: '#F5EDE0',
};
const entityTypePillColors = {
  Provider: '#D6E4F0',
  Vendor: '#FDE8D0',
};

function MissingValue() {
  return <Text type="secondary" style={{ fontStyle: 'italic', color: '#CCC9C6' }}>--</Text>;
}

function FieldValue({ value }) {
  if (value === null || value === undefined || value === '') return <MissingValue />;
  return value;
}




// Contacts card
function ContactsCard({ contacts }) {
  if (!contacts) return null;
  const entries = Object.entries(contacts).filter(([, v]) => v);
  if (entries.length === 0) return null;

  const brandPurple = '#7D3F98';
  const contactMeta = {
    um: { label: 'UM Contact', icon: <MedicineBoxOutlined /> },
    cm: { label: 'CM Contact', icon: <UserOutlined /> },
    claims: { label: 'Claims Contact', icon: <FileProtectOutlined /> },
    clinical: { label: 'Clinical Contact', icon: <MedicineBoxOutlined /> },
    contracting: { label: 'Contracting Contact', icon: <ToolOutlined /> },
    technical: { label: 'Technical Contact', icon: <LaptopOutlined /> },
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 18, fontWeight: 500, display: 'block', marginBottom: 12 }}>
        <ContactsOutlined style={{ marginRight: 8 }} />
        Contacts
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {entries.map(([key, value]) => {
          const meta = contactMeta[key] || { label: key, icon: <UserOutlined /> };
          const emailMatch = value?.match(/^(.+?)\s*\(([^)]+)\)$/);
          const name = emailMatch ? emailMatch[1] : value;
          const email = emailMatch ? emailMatch[2] : null;

          return (
            <div key={key} style={{ flex: '1 1 0', minWidth: 200 }}>
              <Card
                size="small"
                style={{ height: '100%', borderLeft: `3px solid ${brandPurple}` }}
                styles={{ body: { padding: '12px 16px' } }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `${brandPurple}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: brandPurple,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{meta.label}</Text>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                    {email && (
                      <div
                        style={{
                          fontSize: 12,
                          color: '#004D99',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer',
                          marginTop: 1,
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(email);
                          message.success('Email copied');
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
                        <CopyOutlined style={{ fontSize: 11, flexShrink: 0 }} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Product color mapping
const productColors = {
  'Medicare': '#118738',
  'Medicaid': '#B26000',
  'Commercial': '#004D99',
  'I-SNP': '#7D3F98',
  'D-SNP': '#002B57',
  'C-SNP': '#DB3321',
};

function getProductColor(productName) {
  for (const [key, color] of Object.entries(productColors)) {
    if (productName.startsWith(key)) return color;
  }
  return '#5E5D5A';
}

// ---- TABLE-FIRST VIEW (grouped by Product) ----
function TableFirstView({ delegate }) {
  const navigate = useNavigate();
  const totalDelegations = delegate.products.reduce((sum, p) => sum + p.delegations.length, 0);

  const columns = [
    {
      title: 'Tracking ID',
      dataIndex: 'delegationTrackingId',
      width: 85,
      render: (v, record) => v ? (
        <a
          onClick={() => navigate(`/delegates/${delegate.id}/delegations/${record.id}`)}
          style={{ color: '#004D99' }}
        >
          {v}
        </a>
      ) : <FieldValue value={v} />,
    },
    {
      title: 'Delegation Type',
      dataIndex: 'delegationType',
      width: 105,
      render: (t) => <Tag style={{ ...pillStyle, background: typePillColors[t] || '#EDEDEB' }}>{t}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 80,
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Eff. Date',
      dataIndex: 'effectiveDate',
      width: 80,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Term Date',
      dataIndex: 'termDate',
      width: 80,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Audited Entity',
      dataIndex: 'auditedEntity',
      width: 140,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'CAP',
      dataIndex: 'correctiveActionPlan',
      width: 50,
      align: 'center',
      render: (v) => v ? (
        <Tag color="red">Yes</Tag>
      ) : (
        <span style={{ color: '#CCC9C6' }}>No</span>
      ),
    },
  ];

  // Group products by LOB
  const lobGroups = useMemo(() => {
    const groups = {};
    delegate.products.forEach((p) => {
      if (!groups[p.lob]) groups[p.lob] = [];
      groups[p.lob].push(p);
    });
    return Object.entries(groups);
  }, [delegate.products]);

  return (
    <div>
      {lobGroups.map(([lob, products]) => (
        <div key={lob} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#DBD8D5' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#5E5D5A', whiteSpace: 'nowrap' }}>{lob}</span>
            <div style={{ flex: 1, height: 1, background: '#DBD8D5' }} />
          </div>
          {products.map((product) => {
            const color = getProductColor(product.name);
            return (
              <Card
                key={product.id}
                size="small"
                style={{ marginBottom: 16, borderLeft: `3px solid ${color}` }}
                title={
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{product.name}</span>
                }
                extra={null}
                styles={{ header: { borderBottom: '1px solid #F0F0F0' } }}
              >
                <div className="table-bordered">
                  <Table
                    dataSource={product.delegations}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    tableLayout="fixed"
                    scroll={{ x: 1385 }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---- ENTITY-DETAIL-FIRST VIEW ----
function EntityDetailView({ delegate }) {
  // Flatten all delegations and group by type
  const allDelegations = useMemo(() => getDelegationsForDelegate(delegate), [delegate]);

  const grouped = useMemo(() => {
    const groups = {};
    allDelegations.forEach((del) => {
      if (!groups[del.delegationType]) groups[del.delegationType] = [];
      groups[del.delegationType].push(del);
    });
    return groups;
  }, [allDelegations]);

  const typeOrder = ['Clinical-UM', 'Clinical-PHM', 'Claims'];
  const typeColors = { 'Clinical-UM': '#7D3F98', 'Clinical-PHM': '#004D99', Claims: '#002B57' };

  return (
    <div>
      {typeOrder
        .filter((type) => grouped[type])
        .map((type) => (
          <Card
            key={type}
            title={
              <Space align="center">
                <span
                  style={{
                    display: 'inline-block',
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    background: typeColors[type],
                    marginRight: 4,
                  }}
                />
                <span style={{ fontSize: 18, fontWeight: 500 }}>
                  {type === 'Clinical-UM'
                    ? 'Clinical — Utilization Management (UM)'
                    : type === 'Clinical-PHM'
                    ? 'Clinical — Population Health Management (PHM)'
                    : 'Claims'}
                </span>
                <Tag>{grouped[type].length}</Tag>
              </Space>
            }
            size="small"
            style={{ marginBottom: 16 }}
            styles={{ header: { borderBottom: 'none' } }}
          >
            <Collapse
              defaultActiveKey={grouped[type].map((d) => d.id)}
              items={grouped[type].map((del) => ({
                key: del.id,
                label: (
                  <Space>
                    <StatusBadge status={del.status} />
                    <Text strong>{del.productName}</Text>
                  </Space>
                ),
                children: (() => {
                  const entityFields = [
                    { label: 'Tracking ID', value: del.delegationTrackingId },
                    { label: 'Product', value: del.productName },
                    { label: 'Audited Entity', value: del.auditedEntity },
                    {
                      label: 'Corrective Action Plan',
                      value: del.correctiveActionPlan,
                      displayOverride: del.correctiveActionPlan ? <Tag color="red">Yes</Tag> : 'No',
                    },
                  ];

                  return (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '16px 24px',
                        padding: '4px 0',
                      }}
                    >
                      {entityFields.map(({ label, value, displayOverride }) => (
                        <div key={label}>
                          <div style={{ fontSize: 12, fontWeight: 400, color: '#5E5D5A' }}>
                            {label}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>
                            {displayOverride || <FieldValue value={value} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })(),
              }))}
            />
          </Card>
        ))}
    </div>
  );
}

// ---- FLAT LIST VIEW (single table with LOB & Product columns) ----
function FlatListView({ delegate }) {
  const navigate = useNavigate();
  const totalDelegations = delegate.products.reduce((sum, p) => sum + p.delegations.length, 0);

  const flatData = useMemo(() => {
    const rows = [];
    delegate.products.forEach((p) => {
      p.delegations.forEach((del) => {
        rows.push({ ...del, lob: p.lob, productName: p.name });
      });
    });
    return rows;
  }, [delegate.products]);

  const columns = [
    {
      title: 'Tracking ID',
      dataIndex: 'delegationTrackingId',
      width: 95,
      render: (v, record) => v ? (
        <a
          onClick={() => navigate(`/delegates/${delegate.id}/delegations/${record.id}`)}
          style={{ color: '#004D99' }}
        >
          {v}
        </a>
      ) : <FieldValue value={v} />,
    },
    {
      title: 'LOB',
      dataIndex: 'lob',
      width: 90,
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      width: 130,
    },
    {
      title: 'Delegation Type',
      dataIndex: 'delegationType',
      width: 105,
      render: (t) => <Tag style={{ ...pillStyle, background: typePillColors[t] || '#EDEDEB' }}>{t}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 80,
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Eff. Date',
      dataIndex: 'effectiveDate',
      width: 80,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Term Date',
      dataIndex: 'termDate',
      width: 80,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Audited Entity',
      dataIndex: 'auditedEntity',
      width: 140,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'CAP',
      dataIndex: 'correctiveActionPlan',
      width: 50,
      align: 'center',
      render: (v) => v ? (
        <Tag color="red">Yes</Tag>
      ) : (
        <span style={{ color: '#CCC9C6' }}>No</span>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="table-bordered">
        <Table
          dataSource={flatData}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
}

// ---- MAIN DELEGATE DETAIL PAGE ----
export default function DelegateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('flat');

  const delegate = delegates.find((d) => d.id === id);

  if (!delegate) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <Empty description="Delegate not found" />
        <Button onClick={() => navigate('/')} style={{ marginTop: 16 }}>
          Back to Home
        </Button>
      </div>
    );
  }

  const totalDelegations = delegate.products.reduce((sum, p) => sum + p.delegations.length, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space align="center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
            style={{ color: '#004D99' }}
          />
          <Title level={2} style={{ margin: 0 }}>
            {delegate.contractedEntity}
          </Title>
        </Space>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', marginTop: 4, paddingLeft: 40, alignItems: 'center' }}>
          <Tag style={{ ...pillStyle, margin: 0, background: entityTypePillColors[delegate.entityType] || '#EDEDEB' }}>
            {delegate.entityType}
          </Tag>
          <Text type="secondary" style={{ fontSize: 15 }}>
            <span style={{ fontWeight: 500 }}>Tracking ID:</span> {delegate.trackingId}
          </Text>
          {delegate.address && (
            <Text type="secondary" style={{ fontSize: 15 }}>
              <EnvironmentOutlined style={{ marginRight: 5, fontSize: 16, color: '#7D3F98' }} />
              {delegate.address}
            </Text>
          )}
          {(delegate.contractEffectiveDate || delegate.contractRenewalDate || delegate.contractTermDate) && (
            <Text type="secondary" style={{ fontSize: 15 }}>
              <CalendarOutlined style={{ marginRight: 5, fontSize: 16, color: '#7D3F98' }} />
              {[
                delegate.contractEffectiveDate && `Effective: ${delegate.contractEffectiveDate}`,
                delegate.contractRenewalDate && `Renewal: ${delegate.contractRenewalDate}`,
                delegate.contractTermDate && `Term: ${delegate.contractTermDate}`,
              ].filter(Boolean).join(' · ')}
            </Text>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 18, fontWeight: 500 }}>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          Delegations ({totalDelegations})
        </span>
      </div>
      <FlatListView delegate={delegate} />
      <ContactsCard contacts={delegate.contacts} />
      <DelegateNotes initialNotes={delegate.notes || []} />
    </div>
  );
}
