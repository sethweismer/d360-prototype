import { useMemo, useState } from 'react';
import { Typography, Table, Button, Space, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import delegates from '../data/mockData';
import { exportToCSV, exportToExcel } from '../utils/exportReport';
import FilterPanel from '../components/FilterPanel';
import ReportResultsSummary from '../components/ReportResultsSummary';

const { Title, Text } = Typography;

const pillStyle = { fontSize: 12, color: '#1A1A1A', border: 'none' };
const entityTypePillColors = { Provider: '#D6E4F0', Vendor: '#FDE8D0' };
const lobPillColors = {
  Medicare: '#E8D5F5',
  Medicaid: '#D6E4F0',
  Commercial: '#FDE8D0',
  'I-SNP': '#E0D4F0',
  'D-SNP': '#D0DCE8',
  'C-SNP': '#E8E0D0',
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

const typeLabels = {
  'clinical-um': 'Clinical-UM',
  'clinical-phm': 'Clinical-PHM',
  'claims': 'Claims',
};

const emptyFilters = { search: '', entityType: [], lob: [], product: [], openCAP: false };

export default function DelegationTypeReport() {
  const navigate = useNavigate();
  const { type } = useParams();
  const typeLabel = typeLabels[type] || type;
  const [filters, setFilters] = useState(emptyFilters);
  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const handleClear = () => setFilters(emptyFilters);

  const reportData = useMemo(() => {
    const rows = [];
    delegates.forEach((d) => {
      const lobs = new Set();
      const products = new Set();
      let hasOpenCAP = false;
      let matches = false;

      d.products.forEach((p) => {
        p.delegations.forEach((del) => {
          if (del.delegationType === typeLabel) {
            matches = true;
            lobs.add(p.lob);
            products.add(p.name);
            if (del.correctiveActionPlan) hasOpenCAP = true;
          }
        });
      });

      if (!matches) return;

      rows.push({
        id: d.id,
        delegateId: d.id,
        contractedEntity: d.contractedEntity,
        trackingId: d.trackingId,
        entityType: d.entityType,
        lobs: [...lobs],
        products: [...products],
        hasOpenCAP,
      });
    });
    return rows;
  }, [typeLabel]);

  const productOptions = useMemo(() => {
    const products = new Set();
    reportData.forEach((row) => row.products.forEach((p) => products.add(p)));
    return [...products].sort();
  }, [reportData]);

  const filteredData = useMemo(() => {
    return reportData.filter((row) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (!row.contractedEntity.toLowerCase().includes(term) &&
            !(row.trackingId || '').toLowerCase().includes(term)) return false;
      }
      if (filters.entityType.length > 0 && !filters.entityType.includes(row.entityType)) return false;
      if (filters.lob.length > 0 && !filters.lob.every((l) => row.lobs.includes(l))) return false;
      if (filters.product.length > 0 && !filters.product.every((p) => row.products.includes(p))) return false;
      if (filters.openCAP && !row.hasOpenCAP) return false;
      return true;
    });
  }, [reportData, filters]);

  const columns = [
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
      sorter: (a, b) => a.entityType.localeCompare(b.entityType),
      render: (v) => (
        <Tag style={{ ...pillStyle, background: '#EDEDEB' }}>{v}</Tag>
      ),
    },
    {
      title: 'LOB',
      dataIndex: 'lobs',
      width: 180,
      render: (lobs) => (
        <Space size={4} wrap>
          {lobs.map((lob) => (
            <Tag key={lob} style={{ ...pillStyle, background: '#EDEDEB' }}>
              {lob}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Products',
      dataIndex: 'products',
      width: 220,
      render: (products) => (
        <Space size={4} wrap>
          {products.map((name) => {
            const planType = name.replace(/^(Medicare|Medicaid|Commercial|I-SNP|D-SNP|C-SNP)\s+/, '');
            return (
              <Tag key={name} style={{ ...pillStyle, background: '#EDEDEB' }}>
                {planType}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: 'Open CAP',
      dataIndex: 'hasOpenCAP',
      width: 90,
      align: 'center',
      sorter: (a, b) => Number(b.hasOpenCAP) - Number(a.hasOpenCAP),
      render: (v) => v ? <Tag color="red">Yes</Tag> : <span style={{ color: '#CCC9C6' }}>No</span>,
    },
  ];

  const exportColumns = [
    { title: 'Contracted Entity', dataIndex: 'contractedEntity' },
    { title: 'Tracking ID', dataIndex: 'trackingId' },
    { title: 'Entity Type', dataIndex: 'entityType' },
    { title: 'LOB', dataIndex: 'lobs' },
    { title: 'Products', dataIndex: 'products' },
    { title: 'Open CAP', dataIndex: 'hasOpenCAP' },
  ];

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

      <Title level={3} style={{ margin: '0 0 16px' }}>
        Delegated Entities Report — {typeLabel}
      </Title>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
        productOptions={productOptions}
        hiddenFields={['delegationType']}
      />
      <ReportResultsSummary
        count={filteredData.length}
        noun="delegated entity"
        pluralNoun="delegated entities"
        filters={filters}
        pageContext={[{ label: 'Delegation Type', value: typeLabel }]}
        actions={
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportToCSV(filteredData, exportColumns, `${type}-entities.csv`)}>Export CSV</Button>
            <Button type="primary" icon={<FileExcelOutlined />} onClick={() => exportToExcel(filteredData, exportColumns, `${type}-entities.xlsx`)}>Export Excel</Button>
          </Space>
        }
      />

      <div className="table-bordered">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
          scroll={{ x: 1000 }}
        />
      </div>
    </div>
  );
}
