import { useMemo } from 'react';
import { Typography, Table, Button, Space, Tag } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import delegates, { getAllDelegations } from '../data/mockData';
import { exportToCSV, exportToExcel } from '../utils/exportReport';
import StatusBadge from '../components/StatusBadge';

const { Title, Text } = Typography;

const pillStyle = { fontSize: 12, color: '#1A1A1A', border: 'none' };
const entityTypePillColors = { Provider: '#D6E4F0', Vendor: '#FDE8D0' };

export default function OpenCAPDelegationsReport() {
  const navigate = useNavigate();
  const location = useLocation();

  const reportData = useMemo(() => {
    return getAllDelegations()
      .filter((d) => d.correctiveActionPlan && d.status === 'Approved')
      .map((d) => {
        const delegate = delegates.find((del) => del.id === d.delegateId);
        return {
          id: d.id,
          delegateId: d.delegateId,
          contractedEntity: d.contractedEntity,
          trackingId: delegate?.trackingId,
          entityType: delegate?.entityType,
          lob: d.lob,
          productName: d.productName,
          delegationTrackingId: d.delegationTrackingId,
          delegationType: d.delegationType,
          status: d.status,
          nextAuditDue: d.nextAuditDue,
        };
      });
  }, []);

  const columns = [
    {
      title: 'Tracking ID',
      dataIndex: 'delegationTrackingId',
      width: 120,
      render: (v, record) => v ? (
        <a
          onClick={() => navigate(
            `/delegates/${record.delegateId}/delegations/${record.id}`,
            { state: {
              delegationList: reportData.map((d) => ({ id: d.id, delegateId: d.delegateId })),
              returnPath: location.pathname,
              returnLabel: 'Delegations with Open CAPs',
            }}
          )}
          style={{ color: '#004D99', fontWeight: 500 }}
        >
          {v}
        </a>
      ) : <span style={{ color: '#CCC9C6' }}>--</span>,
    },
    {
      title: 'Contracted Entity',
      dataIndex: 'contractedEntity',
      width: 220,
      sorter: (a, b) => a.contractedEntity.localeCompare(b.contractedEntity),
      render: (text, record) => (
        <a
          onClick={() => navigate(`/delegates/${record.delegateId}`)}
          style={{ color: '#004D99', fontWeight: 500 }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Tracking ID',
      dataIndex: 'trackingId',
      width: 120,
      sorter: (a, b) => (a.trackingId || '').localeCompare(b.trackingId || ''),
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      width: 110,
      sorter: (a, b) => (a.entityType || '').localeCompare(b.entityType || ''),
      render: (v) => v ? (
        <Tag style={{ ...pillStyle, background: '#EDEDEB' }}>{v}</Tag>
      ) : null,
    },
    {
      title: 'LOB',
      dataIndex: 'lob',
      width: 120,
      sorter: (a, b) => a.lob.localeCompare(b.lob),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      width: 180,
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Delegation Type',
      dataIndex: 'delegationType',
      width: 140,
      sorter: (a, b) => a.delegationType.localeCompare(b.delegationType),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Next Audit Due',
      dataIndex: 'nextAuditDue',
      width: 130,
      render: (date) => {
        if (!date) return <span style={{ color: '#CCC9C6' }}>--</span>;
        const isOverdue = date < new Date().toISOString().split('T')[0];
        return (
          <span style={isOverdue ? { color: '#DB3321', fontWeight: 500 } : {}}>{date}</span>
        );
      },
      sorter: (a, b) => (a.nextAuditDue || '9999').localeCompare(b.nextAuditDue || '9999'),
    },
  ];

  const exportColumns = columns.map((c) => ({ title: c.title, dataIndex: c.dataIndex }));

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ color: '#004D99' }}>
          Back to Dashboard
        </Button>
      </Space>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Delegations with Open CAPs</Title>
          <Text type="secondary">
            {reportData.length} delegation{reportData.length !== 1 ? 's' : ''} with active Corrective Action Plans
          </Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => exportToCSV(reportData, exportColumns, 'open-cap-delegations.csv')}>
            Export CSV
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={() => exportToExcel(reportData, exportColumns, 'open-cap-delegations.xlsx')}>
            Export Excel
          </Button>
        </Space>
      </div>

      <div className="table-bordered">
        <Table
          dataSource={reportData}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
          scroll={{ x: 1100 }}
        />
      </div>
    </div>
  );
}
