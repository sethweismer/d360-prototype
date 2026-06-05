import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Col,
  Typography,
  Tag,
  Row,
  Space,
  Button,
  Table,
  Collapse,
  message,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  ProfileOutlined,
  CopyOutlined,
  ContactsOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileProtectOutlined,
  ToolOutlined,
  LaptopOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import delegates, { getDelegationsForDelegate } from '../data/mockData';
import { useUser } from '../context/UserContext';
import StatusBadge from '../components/StatusBadge';
import DelegateNotes from '../components/DelegateNotes';

const { Title, Text } = Typography;

function MissingValue() {
  return <Text type="secondary" style={{ fontStyle: 'italic', color: '#CCC9C6' }}>--</Text>;
}

function FieldValue({ value }) {
  if (value === null || value === undefined || value === '') return <MissingValue />;
  return value;
}


function SummaryField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 400, color: '#5E5D5A', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{children}</div>
    </div>
  );
}

// Delegate summary header — columns read top-to-bottom, left-to-right
function DelegateSummary({ delegate }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 18, fontWeight: 500, display: 'block', marginBottom: 12 }}>
        <ProfileOutlined style={{ marginRight: 8 }} />
        Delegate Details
      </span>
    <Card size="small">
      <Row gutter={24}>
        {/* Column 1: Contracted Entity & Address */}
        <Col xs={24} sm={12} lg={6}>
          <SummaryField label="Contracted Entity">{delegate.contractedEntity}</SummaryField>
          <SummaryField label="Address"><FieldValue value={delegate.address} /></SummaryField>
          <SummaryField label="State">{delegate.state}</SummaryField>
          <SummaryField label="TIN">{delegate.tin}</SummaryField>
        </Col>
        {/* Column 2: Audited Entity & MSO */}
        <Col xs={24} sm={12} lg={6}>
          <SummaryField label="Audited Entity"><FieldValue value={delegate.auditedEntity} /></SummaryField>
          <SummaryField label="MSO (Management Services Organization)"><FieldValue value={delegate.mso} /></SummaryField>
          <SummaryField label="Audited Entity Status"><FieldValue value={delegate.auditedEntityStatus} /></SummaryField>
          <SummaryField label="Entity Type">
            <Tag color={delegate.entityType === 'Provider' ? 'blue' : 'orange'}>
              {delegate.entityType}
            </Tag>
          </SummaryField>
          <SummaryField label="Model Type">
            <Tag color={delegate.modelType === 'Standard' ? 'green' : 'volcano'}>
              {delegate.modelType}
            </Tag>
          </SummaryField>
        </Col>
        {/* Column 3: Contract Dates */}
        <Col xs={24} sm={12} lg={6}>
          <SummaryField label="Contract Effective"><FieldValue value={delegate.contractEffectiveDate} /></SummaryField>
          <SummaryField label="Contract Renewal"><FieldValue value={delegate.contractRenewalDate} /></SummaryField>
          <SummaryField label="Contract Term"><FieldValue value={delegate.contractTermDate} /></SummaryField>
        </Col>
        {/* Column 4: People / IDs */}
        <Col xs={24} sm={12} lg={6}>
          <SummaryField label="Tracking ID">{delegate.trackingId}</SummaryField>
          <SummaryField label="Engagement Manager"><FieldValue value={delegate.engagementManager} /></SummaryField>
          <SummaryField label="Network Contractor"><FieldValue value={delegate.networkContractor} /></SummaryField>
        </Col>
      </Row>
    </Card>
    </div>
  );
}

// Contacts card
function ContactsCard({ contacts }) {
  if (!contacts) return null;
  const entries = Object.entries(contacts).filter(([, v]) => v);
  if (entries.length === 0) return null;

  const contactMeta = {
    um: { label: 'UM Contact', icon: <MedicineBoxOutlined />, color: '#7D3F98' },
    cm: { label: 'CM Contact', icon: <UserOutlined />, color: '#004D99' },
    claims: { label: 'Claims Contact', icon: <FileProtectOutlined />, color: '#002B57' },
    clinical: { label: 'Clinical Contact', icon: <MedicineBoxOutlined />, color: '#118738' },
    contracting: { label: 'Contracting Contact', icon: <ToolOutlined />, color: '#B26000' },
    technical: { label: 'Technical Contact', icon: <LaptopOutlined />, color: '#5E5D5A' },
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 18, fontWeight: 500, display: 'block', marginBottom: 12 }}>
        <ContactsOutlined style={{ marginRight: 8 }} />
        Contacts
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {entries.map(([key, value]) => {
          const meta = contactMeta[key] || { label: key, icon: <UserOutlined />, color: '#8F8C89' };
          const emailMatch = value?.match(/^(.+?)\s*\(([^)]+)\)$/);
          const name = emailMatch ? emailMatch[1] : value;
          const email = emailMatch ? emailMatch[2] : null;

          return (
            <div key={key} style={{ flex: '1 1 0', minWidth: 200 }}>
              <Card
                size="small"
                style={{ height: '100%', borderLeft: `3px solid ${meta.color}` }}
                styles={{ body: { padding: '12px 16px' } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `${meta.color}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: meta.color,
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{meta.label}</Text>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{name}</div>
                {email && (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#004D99',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
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
  const totalDelegations = delegate.products.reduce((sum, p) => sum + p.delegations.length, 0);

  const columns = [
    {
      title: 'Type',
      dataIndex: 'delegationType',
      width: 100,
      render: (t) => {
        const colors = { 'Clinical-UM': 'purple', 'Clinical-PHM': 'cyan', Claims: 'geekblue' };
        return <Tag color={colors[t] || 'default'}>{t}</Tag>;
      },
    },
    {
      title: 'States',
      dataIndex: 'states',
      width: 100,
      render: (states) => states?.join(', ') || <MissingValue />,
    },
    {
      title: 'Service Area',
      dataIndex: 'serviceArea',
      width: 160,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Delegated Entity Type',
      dataIndex: 'delegatedEntityType',
      width: 140,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      width: 120,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Term Date',
      dataIndex: 'termDate',
      width: 120,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Delegated Services',
      dataIndex: 'delegatedServices',
      width: 180,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Oversight Audit Timeline',
      dataIndex: 'oversightAuditTimeline',
      width: 160,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Last Audit',
      dataIndex: 'lastAuditCompleted',
      width: 130,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Next Audit',
      dataIndex: 'nextAuditDue',
      width: 140,
      render: (v) => {
        if (!v) return <MissingValue />;
        const isOverdue = v < new Date().toISOString().split('T')[0];
        return <span style={isOverdue ? { color: '#DB3321', fontWeight: 500 } : {}}>{v}</span>;
      },
    },
    {
      title: 'CAP',
      dataIndex: 'correctiveActionPlan',
      width: 80,
      align: 'center',
      render: (v) => v ? (
        <Tag color="red">Yes</Tag>
      ) : (
        <span style={{ color: '#CCC9C6' }}>No</span>
      ),
    },
    {
      title: 'Auth Comm',
      dataIndex: 'decisionAuthCommunication',
      width: 120,
      render: (v, record) => {
        if (record.delegationType !== 'Clinical-UM') return <span style={{ color: '#CCC9C6' }}>--</span>;
        return v ? <Tag color="blue">{v}</Tag> : <MissingValue />;
      },
    },
    {
      title: 'Encounter Submission Method',
      dataIndex: 'encounterSubmission',
      width: 120,
      render: (v, record) => {
        if (record.delegationType !== 'Claims') return <span style={{ color: '#CCC9C6' }}>--</span>;
        return <FieldValue value={v} />;
      },
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
      <span style={{ fontSize: 18, fontWeight: 500, display: 'block', marginBottom: 16 }}>
        <AppstoreOutlined style={{ marginRight: 8 }} />
        Products & Delegations ({totalDelegations})
      </span>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{product.name}</span>
                    <Tag>{product.delegations.length} delegation{product.delegations.length !== 1 ? 's' : ''}</Tag>
                  </div>
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
                    scroll={{ x: 1960 }}
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
                    { label: 'Product', value: del.productName },
                    { label: 'Delegated Entity Type', value: del.delegatedEntityType },
                    { label: 'Delegated Services', value: del.delegatedServices },
                    { label: 'Oversight Audit Timeline', value: del.oversightAuditTimeline },
                    { label: 'Last Audit', value: del.lastAuditCompleted },
                    {
                      label: 'Next Audit Due',
                      value: del.nextAuditDue,
                      displayOverride: del.nextAuditDue ? (
                        <span
                          style={
                            del.nextAuditDue < new Date().toISOString().split('T')[0]
                              ? { color: '#DB3321', fontWeight: 500 }
                              : {}
                          }
                        >
                          {del.nextAuditDue}
                        </span>
                      ) : undefined,
                    },
                    {
                      label: 'Corrective Action Plan',
                      value: del.correctiveActionPlan,
                      displayOverride: del.correctiveActionPlan ? <Tag color="red">Yes</Tag> : 'No',
                    },
                  ];

                  if (type === 'Clinical-UM') {
                    entityFields.push({
                      label: 'Decision Auth Communication',
                      value: del.decisionAuthCommunication,
                    });
                  }

                  if (type === 'Claims') {
                    entityFields.push(
                      { label: 'Encounter Submission', value: del.encounterSubmission },
                    );
                  }

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

// ---- MAIN DELEGATE DETAIL PAGE ----
export default function DelegateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('table');

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
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} align="center">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          />
          <Title level={2} style={{ margin: 0 }}>
            {delegate.contractedEntity}
          </Title>
        </Space>
        {/* View toggle hidden — Entity Detail view preserved but not shown for now */}
        {/* <Segmented
          value={viewMode}
          onChange={setViewMode}
          options={[
            { label: 'Entity Detail', value: 'entity', icon: <ProfileOutlined /> },
            { label: 'Table View', value: 'table', icon: <TableOutlined /> },
          ]}
        /> */}
      </Space>

      <DelegateSummary delegate={delegate} />
      <ContactsCard contacts={delegate.contacts} />
      {viewMode === 'table' ? (
        <TableFirstView delegate={delegate} />
      ) : (
        <EntityDetailView delegate={delegate} />
      )}
      <DelegateNotes initialNotes={delegate.notes || []} />
    </div>
  );
}
