import { useState, useMemo } from 'react';
import { Typography, Table, Button, Space, Tag, Select } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import delegates from '../data/mockData';
import { exportToCSV, exportToExcel } from '../utils/exportReport';
import StatusBadge from '../components/StatusBadge';

const { Title, Text } = Typography;

const typeLabels = {
  'clinical-um': 'Clinical-UM',
  'clinical-phm': 'Clinical-PHM',
  'claims': 'Claims',
};

export default function DelegationTypeReport() {
  const navigate = useNavigate();
  const { type } = useParams();
  const typeLabel = typeLabels[type] || type;

  const [stateFilter, setStateFilter] = useState([]);
  const [productFilter, setProductFilter] = useState([]);

  const allRows = useMemo(() => {
    const rows = [];
    delegates.forEach((d) => {
      d.products.forEach((p) => {
        p.delegations
          .filter((del) => del.delegationType === typeLabel)
          .forEach((del) => {
            rows.push({
              id: del.id,
              delegateId: d.id,
              contractedEntity: d.contractedEntity,
              entityType: d.entityType,
              tin: d.tin,
              state: d.state,
              engagementManager: d.engagementManager,
              networkContractor: d.networkContractor,
              lob: p.lob,
              productName: p.name,
              status: del.status,
              oversightAuditTimeline: del.oversightAuditTimeline,
              nextAuditDue: del.nextAuditDue,
              correctiveActionPlan: del.correctiveActionPlan,
            });
          });
      });
    });
    return rows;
  }, [typeLabel]);

  const reportData = useMemo(() => {
    const activeStates = stateFilter.filter((s) => s !== '__all__');
    return allRows.filter((row) => {
      if (activeStates.length > 0 && !activeStates.includes(row.state)) return false;
      if (productFilter.length > 0 && !productFilter.includes(row.productName)) return false;
      return true;
    });
  }, [allRows, stateFilter, productFilter]);

  const stateOptions = useMemo(() => [...new Set(allRows.map((r) => r.state))].sort(), [allRows]);
  const productOptions = useMemo(() => [...new Set(allRows.map((r) => r.productName))].sort(), [allRows]);

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
      title: 'LOB',
      dataIndex: 'lob',
      width: 120,
      sorter: (a, b) => a.lob.localeCompare(b.lob),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      width: 160,
      sorter: (a, b) => a.productName.localeCompare(b.productName),
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
            {typeLabel} Delegations
          </Title>
          <Text type="secondary">
            {reportData.length} delegation{reportData.length !== 1 ? 's' : ''}
          </Text>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportToCSV(reportData, exportColumns, `${type}-delegations.csv`)}
          >
            Export CSV
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => exportToExcel(reportData, exportColumns, `${type}-delegations.xlsx`)}
          >
            Export Excel
          </Button>
        </Space>
      </div>

      <Space wrap size={[12, 8]} style={{ marginBottom: 16 }} align="center">
        <Space size={4} align="center">
          <FilterOutlined style={{ color: '#5E5D5A' }} />
          <Text strong style={{ color: '#5E5D5A', marginRight: 4 }}>Filters</Text>
        </Space>
        <Select
          placeholder="State"
          mode="multiple"
          value={stateFilter}
          onChange={(val) => {
            const prevHadAll = stateFilter.includes('__all__');
            const nowHasAll = val.includes('__all__');

            if (nowHasAll && !prevHadAll) {
              // User clicked "Select All" — select everything
              setStateFilter(['__all__', ...stateOptions]);
            } else if (!nowHasAll && prevHadAll) {
              // User deselected "Select All" — clear everything
              setStateFilter([]);
            } else if (prevHadAll && nowHasAll) {
              // Had all selected, user deselected a specific state
              const remaining = val.filter((v) => v !== '__all__');
              setStateFilter(remaining);
            } else {
              // Normal selection — if they've now selected all states individually, add the marker
              if (val.length === stateOptions.length && !val.includes('__all__')) {
                setStateFilter(['__all__', ...val]);
              } else {
                setStateFilter(val);
              }
            }
          }}
          style={{ minWidth: 140 }}
          allowClear
          onClear={() => setStateFilter([])}
          maxTagCount={2}
          maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
          options={[
            { label: 'Select All', value: '__all__' },
            ...stateOptions.map((s) => ({ label: s, value: s })),
          ]}
        />
        <Select
          placeholder="Product"
          mode="multiple"
          value={productFilter}
          onChange={setProductFilter}
          style={{ minWidth: 180 }}
          allowClear
          maxTagCount={1}
          options={productOptions.map((p) => ({ label: p, value: p }))}
        />
      </Space>

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
