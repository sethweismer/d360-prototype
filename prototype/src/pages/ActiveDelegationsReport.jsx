import { useMemo, useState } from 'react';
import { Typography, Table, Button, Space, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAllDelegations } from '../data/mockData';
import { exportToCSV, exportToExcel } from '../utils/exportReport';
import StatusBadge from '../components/StatusBadge';
import FilterPanel from '../components/FilterPanel';
import ReportResultsSummary from '../components/ReportResultsSummary';

const { Title, Text } = Typography;

const pillStyle = { fontSize: 12, color: '#1A1A1A', border: 'none' };
const typePillColors = { 'Clinical-UM': '#F0E4FA', 'Clinical-PHM': '#E0ECF7', Claims: '#F5EDE0' };

function MissingValue() {
  return <span style={{ color: '#CCC9C6' }}>--</span>;
}
function FieldValue({ value }) {
  if (value === null || value === undefined || value === '') return <MissingValue />;
  return value;
}

const emptyFilters = { search: '', lob: [], product: [], delegationType: [] };

// category: 'lob' | 'product' | 'type'
export default function ActiveDelegationsReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { category, value } = useParams();
  const [filters, setFilters] = useState(emptyFilters);
  const handleFilterChange = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const handleClear = () => setFilters(emptyFilters);

  const allDelegations = useMemo(() => getAllDelegations(), []);

  const { reportData, pageTitle, fileSlug } = useMemo(() => {
    const active = allDelegations.filter((d) => d.status === 'Approved');

    let filtered;
    let label;
    let slug;

    if (category === 'lob') {
      filtered = active.filter((d) => d.lob.toLowerCase().replace(/\s+/g, '-') === value);
      label = filtered.length > 0 ? filtered[0].lob : value;
      slug = `active-delegations-lob-${value}`;
    } else if (category === 'product') {
      filtered = active.filter((d) => d.productName.toLowerCase().replace(/\s+/g, '-') === value);
      label = filtered.length > 0 ? filtered[0].productName : value;
      slug = `active-delegations-product-${value}`;
    } else {
      const typeLabels = { 'clinical-um': 'Clinical-UM', 'clinical-phm': 'Clinical-PHM', claims: 'Claims' };
      const typeLabel = typeLabels[value] || value;
      filtered = active.filter((d) => d.delegationType === typeLabel);
      label = typeLabel;
      slug = `active-delegations-type-${value}`;
    }

    return { reportData: filtered, pageTitle: label, fileSlug: slug };
  }, [allDelegations, category, value]);

  const productOptions = useMemo(() => {
    const products = new Set(reportData.map((d) => d.productName));
    return [...products].sort();
  }, [reportData]);

  const filteredData = useMemo(() => {
    return reportData.filter((d) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (!d.contractedEntity.toLowerCase().includes(term) &&
            !(d.delegationTrackingId || '').toLowerCase().includes(term)) return false;
      }
      if (filters.lob.length > 0 && !filters.lob.includes(d.lob)) return false;
      if (filters.product.length > 0 && !filters.product.includes(d.productName)) return false;
      if (filters.delegationType.length > 0 && !filters.delegationType.includes(d.delegationType)) return false;
      return true;
    });
  }, [reportData, filters]);

  const hiddenFields = category === 'lob' ? ['lob', 'entityType'] : category === 'product' ? ['product', 'entityType'] : ['delegationType', 'entityType'];

  const categoryLabel =
    category === 'lob' ? 'LOB' : category === 'product' ? 'Product' : 'Delegation Type';

  const columns = [
    {
      title: 'Tracking ID',
      dataIndex: 'delegationTrackingId',
      width: 110,
      render: (v, record) => v ? (
        <a
          onClick={() => navigate(
            `/delegates/${record.delegateId}/delegations/${record.id}`,
            { state: {
              delegationList: filteredData.map((d) => ({ id: d.id, delegateId: d.delegateId })),
              returnPath: location.pathname,
              returnLabel: `${categoryLabel}: ${pageTitle}`,
            }}
          )}
          style={{ color: '#004D99', fontWeight: 500 }}
        >
          {v}
        </a>
      ) : <FieldValue value={v} />,
    },
    {
      title: 'Contracted Entity',
      dataIndex: 'contractedEntity',
      width: 200,
      sorter: (a, b) => a.contractedEntity.localeCompare(b.contractedEntity),
      render: (text, record) => (
        <a
          onClick={() => navigate(`/delegates/${record.delegateId}`)}
          style={{ color: '#004D99', fontWeight: 400, fontSize: 12 }}
        >
          {text}
        </a>
      ),
    },
    ...(category !== 'lob' ? [{
      title: 'LOB',
      dataIndex: 'lob',
      width: 110,
      sorter: (a, b) => a.lob.localeCompare(b.lob),
    }] : []),
    ...(category !== 'product' ? [{
      title: 'Product',
      dataIndex: 'productName',
      width: 150,
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    }] : []),
    ...(category !== 'type' ? [{
      title: 'Delegation Type',
      dataIndex: 'delegationType',
      width: 90,
      sorter: (a, b) => a.delegationType.localeCompare(b.delegationType),
      render: (t) => <Tag style={{ ...pillStyle, background: '#EDEDEB' }}>{t}</Tag>,
    }] : []),
    {
      title: 'Status',
      dataIndex: 'status',
      width: 80,
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Eff. Date',
      dataIndex: 'effectiveDate',
      width: 90,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Term Date',
      dataIndex: 'termDate',
      width: 90,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'Audited Entity',
      dataIndex: 'auditedEntity',
      width: 160,
      render: (v) => <FieldValue value={v} />,
    },
    {
      title: 'CAP',
      dataIndex: 'correctiveActionPlan',
      width: 50,
      align: 'center',
      render: (v) => v ? <Tag color="red">Yes</Tag> : <span style={{ color: '#CCC9C6' }}>No</span>,
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

      <Title level={3} style={{ margin: '0 0 16px' }}>
        Active Delegations Report — {pageTitle}
      </Title>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
        productOptions={productOptions}
        hiddenFields={hiddenFields}
      />
      <ReportResultsSummary
        count={filteredData.length}
        noun="delegation"
        filters={filters}
        pageContext={[{ label: categoryLabel, value: pageTitle }]}
        actions={
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => exportToCSV(filteredData, exportColumns, `${fileSlug}.csv`)}>Export CSV</Button>
            <Button type="primary" icon={<FileExcelOutlined />} onClick={() => exportToExcel(filteredData, exportColumns, `${fileSlug}.xlsx`)}>Export Excel</Button>
          </Space>
        }
      />

      <div className="table-bordered">
        <Table
          dataSource={filteredData}
          columns={columns}
          showSorterTooltip={false}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
          scroll={{ x: 1600 }}
        />
      </div>
    </div>
  );
}
