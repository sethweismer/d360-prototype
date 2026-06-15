import { useMemo } from 'react';
import { Typography, Table, Button, Space, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import delegates from '../data/mockData';
import { exportToCSV, exportToExcel } from '../utils/exportReport';

const { Title, Text } = Typography;

export default function CAPReport() {
  const navigate = useNavigate();

  const capDelegates = useMemo(() => {
    return delegates
      .map((d) => {
        const capDelegations = d.products.flatMap((p) =>
          p.delegations
            .filter((del) => del.correctiveActionPlan && del.status === 'Approved')
            .map((del) => ({ ...del, productName: p.name, lob: p.lob }))
        );
        if (capDelegations.length === 0) return null;

        const lobs = [...new Set(capDelegations.map((del) => del.lob))];
        const products = [...new Set(capDelegations.map((del) => del.productName))];
        const delegationTypes = [...new Set(capDelegations.map((del) => del.delegationType))];

        return {
          id: d.id,
          contractedEntity: d.contractedEntity,
          entityType: d.entityType,
          tin: d.tin,
          state: d.state,
          engagementManager: d.engagementManager,
          networkContractor: d.networkContractor,
          lobs,
          products,
          delegationTypes,
          capCount: capDelegations.length,
        };
      })
      .filter(Boolean);
  }, []);

  const columns = [
    {
      title: 'Contracted Entity',
      dataIndex: 'contractedEntity',
      width: 200,
      sorter: (a, b) => a.contractedEntity.localeCompare(b.contractedEntity),
      render: (text, record) => (
        <a
          onClick={() => navigate(`/delegates/${record.id}`)}
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
      title: 'TIN',
      dataIndex: 'tin',
      width: 120,
    },
    {
      title: 'State',
      dataIndex: 'state',
      width: 70,
      sorter: (a, b) => a.state.localeCompare(b.state),
    },
    {
      title: 'Engagement Manager',
      dataIndex: 'engagementManager',
      width: 170,
      sorter: (a, b) => a.engagementManager.localeCompare(b.engagementManager),
    },
    {
      title: 'Network Contractor',
      dataIndex: 'networkContractor',
      width: 200,
    },
    {
      title: 'LOB(s)',
      dataIndex: 'lobs',
      width: 140,
      render: (lobs) => lobs.join(', '),
    },
    {
      title: 'Product(s)',
      dataIndex: 'products',
      width: 180,
      render: (products) => products.join(', '),
    },
    {
      title: 'Delegation Type(s)',
      dataIndex: 'delegationTypes',
      width: 160,
      render: (types) => types.join(', '),
    },
    {
      title: 'CAP Count',
      dataIndex: 'capCount',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.capCount - b.capCount,
      render: (v) => <Tag color="red">{v}</Tag>,
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
          style={{ color: '#004D99' }}
        >
          Back to Dashboard
        </Button>
      </Space>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Delegated Entities with Open CAPs
          </Title>
          <Text type="secondary">
            {capDelegates.length} delegated entit{capDelegates.length !== 1 ? 'ies' : 'y'} with active Corrective Action Plans
          </Text>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportToCSV(capDelegates, exportColumns, 'open-caps-report.csv')}
          >
            Export CSV
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => exportToExcel(capDelegates, exportColumns, 'open-caps-report.xlsx')}
          >
            Export Excel
          </Button>
        </Space>
      </div>

      <div className="table-bordered">
        <Table
          dataSource={capDelegates}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
          scroll={{ x: 1400 }}
        />
      </div>
    </div>
  );
}
