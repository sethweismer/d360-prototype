import { useMemo } from 'react';
import { Typography, Table, Button, Space, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import delegates from '../data/mockData';
import { exportToCSV, exportToExcel } from '../utils/exportReport';
import StatusBadge from '../components/StatusBadge';

const { Title, Text } = Typography;

export default function LOBReport() {
  const navigate = useNavigate();
  const { lob } = useParams();

  const reportData = useMemo(() => {
    const rows = [];
    delegates.forEach((d) => {
      d.products
        .filter((p) => p.lob.toLowerCase().replace(/\s+/g, '-') === lob)
        .forEach((p) => {
          p.delegations.forEach((del) => {
            rows.push({
              id: del.id,
              delegateId: d.id,
              contractedEntity: d.contractedEntity,
              entityType: d.entityType,
              tin: d.tin,
              state: d.state,
              engagementManager: d.engagementManager,
              networkContractor: d.networkContractor,
              productName: p.name,
              delegationType: del.delegationType,
              status: del.status,
              oversightAuditTimeline: del.oversightAuditTimeline,
              nextAuditDue: del.nextAuditDue,
              correctiveActionPlan: del.correctiveActionPlan,
            });
          });
        });
    });
    return rows;
  }, [lob]);

  const lobLabel = reportData.length > 0
    ? delegates.flatMap((d) => d.products).find((p) => p.lob.toLowerCase().replace(/\s+/g, '-') === lob)?.lob || lob
    : lob;

  const columns = [
    {
      title: 'Contracted Entity',
      dataIndex: 'contractedEntity',
      width: 200,
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
      title: 'Entity Type',
      dataIndex: 'entityType',
      width: 110,
      sorter: (a, b) => a.entityType.localeCompare(b.entityType),
      render: (v) => <Tag color={v === 'Provider' ? 'blue' : 'orange'}>{v}</Tag>,
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      width: 160,
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Delegation Type',
      dataIndex: 'delegationType',
      width: 130,
      sorter: (a, b) => a.delegationType.localeCompare(b.delegationType),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (status) => <StatusBadge status={status} />,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Oversight Audit',
      dataIndex: 'oversightAuditTimeline',
      width: 130,
      render: (v) => v || <span style={{ color: '#CCC9C6' }}>--</span>,
    },
    {
      title: 'Next Audit Due',
      dataIndex: 'nextAuditDue',
      width: 130,
      render: (date) => {
        if (!date) return <span style={{ color: '#CCC9C6' }}>--</span>;
        const isOverdue = date < new Date().toISOString().split('T')[0];
        return (
          <span style={isOverdue ? { color: '#DB3321', fontWeight: 500 } : {}}>
            {date}
          </span>
        );
      },
      sorter: (a, b) => (a.nextAuditDue || '9999').localeCompare(b.nextAuditDue || '9999'),
    },
    {
      title: 'CAP',
      dataIndex: 'correctiveActionPlan',
      width: 70,
      align: 'center',
      render: (cap) =>
        cap ? <Tag color="red">Yes</Tag> : <span style={{ color: '#CCC9C6' }}>--</span>,
    },
  ];

  const exportColumns = columns.map((c) => ({ title: c.title, dataIndex: c.dataIndex }));

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </Space>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {lobLabel} Delegations
          </Title>
          <Text type="secondary">
            {reportData.length} delegation{reportData.length !== 1 ? 's' : ''}
          </Text>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportToCSV(reportData, exportColumns, `${lob}-delegations.csv`)}
          >
            Export CSV
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => exportToExcel(reportData, exportColumns, `${lob}-delegations.xlsx`)}
          >
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
          scroll={{ x: 1200 }}
        />
      </div>
    </div>
  );
}
