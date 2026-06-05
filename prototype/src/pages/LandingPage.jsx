import { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Typography,
  Segmented,
  Space,
  Button,
  Pagination,
} from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  UpOutlined,
  DownOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import delegates, {
  getStats,
  getAllDelegations,
  getDelegationsForDelegate,
  getLobSummaryForDelegate,
} from '../data/mockData';
import FilterPanel from '../components/FilterPanel';
import StatusBadge from '../components/StatusBadge';
import DelegationChatbot from '../components/DelegationChatbot';
import { useUser } from '../context/UserContext';

const { Title, Text } = Typography;

const emptyFilters = {
  search: '',
  status: [],
  delegationType: [],
  lob: [],
  product: [],
  state: [],
  entityType: [],
};

const typeColors = {
  'Clinical-UM': '#7D3F98',
  'Clinical-PHM': '#004D99',
  Claims: '#002B57',
};
const productColors = {
  'Medicare': '#118738',
  'Medicaid': '#B26000',
  'Commercial': '#004D99',
  'I-SNP': '#7D3F98',
  'D-SNP': '#002B57',
  'C-SNP': '#DB3321',
};

function getProductColor(name) {
  for (const [key, color] of Object.entries(productColors)) {
    if (name.startsWith(key)) return color;
  }
  return '#8F8C89';
}

function BarChart({ data, labelKey, countKey, colorMap, colorFn, onClickItem }) {
  const maxCount = Math.max(...data.map((d) => d[countKey]));
  return data.map((item) => (
    <div
      key={item[labelKey]}
      style={{ display: 'flex', alignItems: 'center', marginBottom: 8, cursor: onClickItem ? 'pointer' : 'default' }}
      onClick={() => onClickItem?.(item[labelKey])}
    >
      <Text style={{ width: 120, fontSize: 12, color: onClickItem ? '#004D99' : undefined }}>{item[labelKey]}</Text>
      <div
        style={{
          flex: 1,
          height: 20,
          background: '#F5F5F5',
          borderRadius: 4,
          marginRight: 8,
        }}
      >
        <div
          style={{
            width: `${(item[countKey] / maxCount) * 100}%`,
            height: '100%',
            background: colorFn ? colorFn(item[labelKey]) : (colorMap?.[item[labelKey]] || '#8F8C89'),
            borderRadius: 4,
            minWidth: 2,
          }}
        />
      </div>
      <Text strong style={{ width: 24, textAlign: 'right' }}>
        {item[countKey]}
      </Text>
    </div>
  ));
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { showChatbot, showDashboard } = useUser();
  const stats = useMemo(() => getStats(), []);
  const allDelegations = useMemo(() => getAllDelegations(), []);

  // Filters
  const [filters, setFilters] = useState(emptyFilters);
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // When LOB changes, clear product selections that are no longer valid
      if (key === 'lob' && next.product.length > 0) {
        const validProducts = new Set();
        delegates.forEach((d) => {
          d.products.forEach((p) => {
            if (value.length === 0 || value.includes(p.lob)) validProducts.add(p.name);
          });
        });
        next.product = next.product.filter((p) => validProducts.has(p));
      }
      return next;
    });
    setCurrentPage(1);
  };
  const handleClear = () => {
    setFilters(emptyFilters);
    setCurrentPage(1);
  };

  // View toggle
  const [viewMode, setViewMode] = useState('grouped');

  // Pagination (shared)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Distribution data
  const typeDistribution = useMemo(() => {
    const counts = {};
    allDelegations.forEach((d) => {
      if (d.status === 'Approved') {
        counts[d.delegationType] = (counts[d.delegationType] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [allDelegations]);

  const lobDistribution = useMemo(() => {
    const counts = {};
    delegates.forEach((d) => {
      const lobs = new Set(d.products.map((p) => p.lob));
      lobs.forEach((lob) => {
        counts[lob] = (counts[lob] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([lob, count]) => ({ lob, count }));
  }, []);

  const productDistribution = useMemo(() => {
    const counts = {};
    delegates.forEach((d) => {
      const products = new Set(d.products.map((p) => p.name));
      products.forEach((name) => {
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // Grouped view: filter delegates, then build LOB summaries
  const filteredGrouped = useMemo(() => {
    return delegates
      .map((d) => {
        // Delegate-level filters
        if (filters.search) {
          const term = filters.search.toLowerCase();
          const searchable = [d.contractedEntity, d.tin, d.trackingId, d.auditedEntity]
            .join(' ')
            .toLowerCase();
          if (!searchable.includes(term)) return null;
        }
        if (filters.entityType.length > 0 && !filters.entityType.includes(d.entityType))
          return null;

        // Filter products by LOB and product name
        let filteredProducts = d.products;
        if (filters.lob.length > 0) {
          filteredProducts = filteredProducts.filter((p) => filters.lob.includes(p.lob));
        }
        if (filters.product.length > 0) {
          filteredProducts = filteredProducts.filter((p) => filters.product.includes(p.name));
        }

        // Apply delegation-level filters to determine which products remain
        filteredProducts = filteredProducts
          .map((p) => {
            let dels = p.delegations;
            if (filters.status.length > 0) {
              dels = dels.filter((del) => filters.status.includes(del.status));
            }
            if (filters.delegationType.length > 0) {
              dels = dels.filter((del) => filters.delegationType.includes(del.delegationType));
            }
            if (filters.state.length > 0) {
              dels = dels.filter((del) => del.states?.some((s) => filters.state.includes(s)));
            }
            if (dels.length === 0) return null;
            return { ...p, delegations: dels };
          })
          .filter(Boolean);

        if (filteredProducts.length === 0) return null;

        // Build LOB summary from filtered products
        const lobMap = {};
        filteredProducts.forEach((p) => {
          if (!lobMap[p.lob]) lobMap[p.lob] = { lob: p.lob, products: [], delegationTypes: new Set(), statuses: new Set(), delegationCount: 0 };
          lobMap[p.lob].products.push(p.name);
          p.delegations.forEach((del) => {
            lobMap[p.lob].delegationTypes.add(del.delegationType);
            lobMap[p.lob].statuses.add(del.status);
          });
          lobMap[p.lob].delegationCount += p.delegations.length;
        });
        const lobSummary = Object.values(lobMap).map((l) => ({ ...l, delegationTypes: [...l.delegationTypes], statuses: [...l.statuses] }));

        const totalDelegations = filteredProducts.reduce((sum, p) => sum + p.delegations.length, 0);
        return { ...d, _lobSummary: lobSummary, _delegationCount: totalDelegations };
      })
      .filter(Boolean);
  }, [filters]);

  // Ungrouped view: group by Contracted Entity + LOB
  const filteredUngrouped = useMemo(() => {
    const filtered = allDelegations.filter((d) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const searchable = [d.contractedEntity, d.delegationType, d.productName]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(term)) return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(d.status)) return false;
      if (filters.delegationType.length > 0 && !filters.delegationType.includes(d.delegationType))
        return false;
      if (filters.lob.length > 0 && !filters.lob.includes(d.lob)) return false;
      if (filters.product.length > 0 && !filters.product.includes(d.productName)) return false;
      if (filters.state.length > 0) {
        if (!d.states?.some((s) => filters.state.includes(s))) return false;
      }
      if (filters.entityType.length > 0) {
        const delegate = delegates.find((del) => del.id === d.delegateId);
        if (!delegate || !filters.entityType.includes(delegate.entityType)) return false;
      }
      return true;
    });

    // Group by delegateId + lob
    const groupMap = {};
    filtered.forEach((d) => {
      const key = `${d.delegateId}-${d.lob}`;
      if (!groupMap[key]) {
        groupMap[key] = {
          id: key,
          delegateId: d.delegateId,
          contractedEntity: d.contractedEntity,
          lob: d.lob,
          products: new Set(),
          delegationTypes: new Set(),
          statuses: new Set(),
        };
      }
      groupMap[key].products.add(d.productName);
      groupMap[key].delegationTypes.add(d.delegationType);
      groupMap[key].statuses.add(d.status);
    });

    return Object.values(groupMap).map((g) => ({
      ...g,
      products: [...g.products],
      delegationTypes: [...g.delegationTypes],
      statuses: [...g.statuses],
    }));
  }, [filters, allDelegations]);

  // Compute dynamic product options based on LOB filter
  const productOptions = useMemo(() => {
    const products = new Set();
    delegates.forEach((d) => {
      d.products.forEach((p) => {
        if (filters.lob.length === 0 || filters.lob.includes(p.lob)) {
          products.add(p.name);
        }
      });
    });
    return [...products].sort();
  }, [filters.lob]);

  const today = new Date().toISOString().split('T')[0];

  // Grouped view: expand/collapse
  const [expandedKeys, setExpandedKeys] = useState(
    delegates.map((d) => d.id)
  );

  // Grouped view: paginate by delegate, then build flat rows
  const paginatedGrouped = useMemo(
    () => filteredGrouped.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredGrouped, currentPage, pageSize]
  );

  const groupedTableData = useMemo(() => {
    const rows = [];
    paginatedGrouped.forEach((delegate) => {
      rows.push({
        _type: 'delegate',
        _key: `delegate-${delegate.id}`,
        _delegate: delegate,
      });
      if (expandedKeys.includes(delegate.id)) {
        delegate._lobSummary.forEach((lobRow) => {
          rows.push({
            _type: 'lob',
            _key: `lob-${delegate.id}-${lobRow.lob}`,
            _delegateId: delegate.id,
            ...lobRow,
          });
        });
      }
    });
    return rows;
  }, [paginatedGrouped, expandedKeys]);

  const groupedColumns = [
    {
      title: <span style={{ paddingLeft: 64 }}>LOB</span>,
      dataIndex: 'lob',
      width: 180,
      render: (lob) => <span style={{ fontWeight: 500, paddingLeft: 64 }}>{lob}</span>,
    },
    {
      title: 'Products',
      dataIndex: 'products',
      width: 220,
      render: (products, record) => {
        if (!products) return null;
        return (
          <Space size={4} wrap>
            {products.map((name) => {
              const planType = name.replace(/^(Medicare|Medicaid|Commercial|I-SNP|D-SNP|C-SNP)\s+/, '');
              return (
                <Tag key={name} style={{ margin: 0, fontSize: 11 }} color={getProductColor(name)}>
                  {planType}
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: 'Delegation Types',
      dataIndex: 'delegationTypes',
      width: 200,
      render: (types) => {
        if (!types) return null;
        return (
          <Space size={4} wrap>
            {types.map((t) => (
              <Tag key={t} style={{ margin: 0, fontSize: 11 }} color={typeColors[t] || '#8F8C89'}>
                {t}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'statuses',
      width: 140,
      render: (statuses) => {
        if (!statuses) return null;
        return (
          <Space size={4} wrap>
            {statuses.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </Space>
        );
      },
    },
  ];

  // Ungrouped view columns
  const ungroupedColumns = [
    {
      title: 'Contracted Entity',
      dataIndex: 'contractedEntity',
      width: 200,
      sorter: (a, b) => a.contractedEntity.localeCompare(b.contractedEntity),
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'LOB',
      dataIndex: 'lob',
      width: 140,
      sorter: (a, b) => a.lob.localeCompare(b.lob),
      render: (lob) => <span style={{ fontWeight: 500 }}>{lob}</span>,
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
              <Tag key={name} style={{ margin: 0, fontSize: 11 }} color={getProductColor(name)}>
                {planType}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: 'Delegation Types',
      dataIndex: 'delegationTypes',
      width: 200,
      render: (types) => (
        <Space size={4} wrap>
          {types.map((t) => (
            <Tag key={t} style={{ margin: 0, fontSize: 11 }} color={typeColors[t] || '#8F8C89'}>
              {t}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statuses',
      width: 140,
      render: (statuses) => (
        <Space size={4} wrap>
          {statuses.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </Space>
      ),
    },
    {
      title: '',
      dataIndex: 'delegateId',
      width: 160,
      align: 'right',
      render: (delegateId) => (
        <Button
          type="primary"
          size="small"
          style={{ fontSize: 12 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/delegates/${delegateId}`);
          }}
        >
          View Contract Details
        </Button>
      ),
    },
  ];

  const allExpanded = paginatedGrouped.every((d) => expandedKeys.includes(d.id));
  const toggleExpand = (delegateId) => {
    setExpandedKeys((prev) =>
      prev.includes(delegateId)
        ? prev.filter((k) => k !== delegateId)
        : [...prev, delegateId]
    );
  };

  const totalDelegationCount =
    viewMode === 'grouped'
      ? filteredGrouped.reduce((sum, d) => sum + d._delegationCount, 0)
      : filteredUngrouped.length;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 16 }}>
        D360 — Delegation Source of Truth
      </Title>
    <Row gutter={16}>
      {/* Left column: KPIs, charts, table */}
      <Col xs={24} lg={showChatbot ? 16 : 24} style={showChatbot ? {} : { maxWidth: 1600 }}>

      {/* KPI Cards & Distribution Charts — toggled via Dashboard switch */}
      {showDashboard && (<>
      <Card size="small" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Space size={10}>
            <TeamOutlined style={{ color: '#004D99', fontSize: 20 }} />
            <Text strong style={{ color: '#004D99', fontSize: 28 }}>{stats.totalDelegates}</Text>
            <Text type="secondary" style={{ fontSize: 15 }}>Total Delegates</Text>
          </Space>
          <div style={{ width: 1, height: 32, background: '#DBD8D5' }} />
          <Space size={10}>
            <CheckCircleOutlined style={{ color: '#118738', fontSize: 20 }} />
            <Text strong style={{ color: '#118738', fontSize: 28 }}>{stats.activeDelegations}</Text>
            <Text type="secondary" style={{ fontSize: 15 }}>Active Delegations</Text>
          </Space>
        </div>
      </Card>

      {/* Quick Report Cards */}
      <Title level={3} style={{ marginBottom: 12 }}>Quick Reports</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={6}>
          <Card title="Delegates with Alerts" size="small">
            <div
              onClick={() => navigate('/reports/open-caps')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}
            >
              <Text style={{ color: '#004D99' }}>Open CAPs</Text>
              <Text strong>{stats.openCAPs}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Delegates by LOB" size="small">
            {lobDistribution.map((item, i) => (
              <div
                key={item.lob}
                onClick={() => navigate(`/reports/lob/${item.lob.toLowerCase().replace(/\s+/g, '-')}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < lobDistribution.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99' }}>{item.lob}</Text>
                <Text strong>{item.count}</Text>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Delegates by Product" size="small">
            {productDistribution.map((item, i) => (
              <div
                key={item.product}
                onClick={() => navigate(`/reports/product/${encodeURIComponent(item.product.toLowerCase().replace(/\s+/g, '-'))}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < productDistribution.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99' }}>{item.product}</Text>
                <Text strong>{item.count}</Text>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Active Delegations by Type" size="small">
            {typeDistribution.map((item, i) => (
              <div
                key={item.type}
                onClick={() => navigate(`/reports/delegation-type/${item.type.toLowerCase().replace(/\s+/g, '-')}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < typeDistribution.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99' }}>{item.type}</Text>
                <Text strong>{item.count}</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
      </>)}

      <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                Delegates & Delegations
              </Title>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  {
                    value: 'grouped',
                    icon: <AppstoreOutlined />,
                    label: 'Grouped',
                  },
                  {
                    value: 'ungrouped',
                    icon: <UnorderedListOutlined />,
                    label: 'Ungrouped',
                  },
                ]}
              />
            </div>

            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClear}
              productOptions={productOptions}
            />

            {/* Results count + expand/collapse toggle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '12px 0',
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                {viewMode === 'grouped'
                  ? `${filteredGrouped.length} delegates, ${totalDelegationCount} delegations`
                  : `${totalDelegationCount} delegations`}
              </Text>
              {viewMode === 'grouped' && (
                <Button
                  type="link"
                  size="small"
                  onClick={() =>
                    setExpandedKeys(allExpanded ? [] : paginatedGrouped.map((d) => d.id))
                  }
                >
                  {allExpanded ? (
                    <>
                      <UpOutlined style={{ fontSize: 10, marginRight: 4 }} />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <DownOutlined style={{ fontSize: 10, marginRight: 4 }} />
                      Expand All
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Grouped View */}
            {viewMode === 'grouped' && (
              <div className="table-bordered">
                <Table
                  dataSource={groupedTableData}
                  columns={groupedColumns}
                  rowKey="_key"
                  size="small"
                  pagination={false}
                  showHeader={true}
                  onRow={(record) => {
                    if (record._type === 'delegate') {
                      return {
                        onClick: () => toggleExpand(record._delegate.id),
                        style: { cursor: 'pointer' },
                      };
                    }
                    return {};
                  }}
                  components={{
                    body: {
                      row: ({ children, ...props }) => {
                        // Find the record from the data-row-key
                        const rowKey = props['data-row-key'];
                        const record = groupedTableData.find((r) => r._key === rowKey);
                        if (record?._type === 'delegate') {
                          const d = record._delegate;
                          const isExpanded = expandedKeys.includes(d.id);
                          const delCount = d._delegationCount;
                          return (
                            <tr {...props} style={{ background: '#F9F7F5' }}>
                              <td
                                colSpan={groupedColumns.length}
                                style={{
                                  padding: '10px 16px',
                                  borderBottom: '1px solid #DBD8D5',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    width: '100%',
                                  }}
                                >
                                  {isExpanded ? (
                                    <UpOutlined style={{ fontSize: 10, color: '#5E5D5A' }} />
                                  ) : (
                                    <DownOutlined style={{ fontSize: 10, color: '#5E5D5A' }} />
                                  )}
                                  <span style={{ fontWeight: 600, color: '#1A1A19', fontSize: 13 }}>
                                    {d.contractedEntity}
                                  </span>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {delCount} delegation
                                    {delCount !== 1 ? 's' : ''}
                                  </Text>
                                  <Button
                                    type="primary"
                                    size="small"
                                    style={{ marginLeft: 'auto', fontSize: 12 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/delegates/${d.id}`);
                                    }}
                                  >
                                    View Contract Details
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                        return <tr {...props}>{children}</tr>;
                      },
                    },
                  }}
                />
              </div>
            )}

            {/* Ungrouped View */}
            {viewMode === 'ungrouped' && (
              <div className="table-bordered">
                <Table
                  dataSource={filteredUngrouped.slice(
                    (currentPage - 1) * pageSize,
                    currentPage * pageSize
                  )}
                  columns={ungroupedColumns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  scroll={{ x: 1200 }}
                  onRow={() => ({})}
                />
              </div>
            )}

            {/* Shared pagination */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 12,
              }}
            >
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={viewMode === 'grouped' ? filteredGrouped.length : filteredUngrouped.length}
                showSizeChanger
                size="small"
                pageSizeOptions={[10, 20, 50]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </div>
      </div>
      </Col>

      {/* Right rail: AI Assistant */}
      {showChatbot && (
        <Col xs={24} lg={8}>
          <div style={{ position: 'sticky', top: 16 }}>
            <DelegationChatbot />
          </div>
        </Col>
      )}
    </Row>
    </div>
  );
}
