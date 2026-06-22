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
  Select,
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
  FilterOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import providerGroupIcon from '../assets/anatomy_icons/provider_group.svg';
import formsIcon from '../assets/anatomy_icons/forms.svg';
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
import { exportToCSV, exportToExcel } from '../utils/exportReport';

const { Title, Text } = Typography;

const emptyFilters = {
  search: '',
  delegationType: [],
  lob: [],
  product: [],
  entityType: [],
  openCAP: false,
};

// Brand palette pill styles (light bg, black text, no connotative colors)
const pillStyle = { margin: 0, fontSize: 12, color: '#1A1A1A' };

const lobPillColors = {
  Medicare: '#E8D5F5',
  Medicaid: '#D6E4F0',
  Commercial: '#FDE8D0',
  'I-SNP': '#E0D4F0',
  'D-SNP': '#D0DCE8',
  'C-SNP': '#E8E0D0',
};

const typePillColors = {
  'Clinical-UM': '#F0E4FA',
  'Clinical-PHM': '#E0ECF7',
  Claims: '#F5EDE0',
};

const entityTypePillColors = {
  Provider: '#D6E4F0',
  Vendor: '#FDE8D0',
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
  const { showChatbot, showDashboard, layoutMode } = useUser();
  const stats = useMemo(() => getStats(), []);
  const allDelegations = useMemo(() => getAllDelegations(), []);

  const entitiesWithOpenCAPs = useMemo(() => {
    const ids = new Set(
      allDelegations
        .filter((d) => d.correctiveActionPlan && d.status === 'Approved')
        .map((d) => d.delegateId)
    );
    return ids.size;
  }, [allDelegations]);

  const entityTypeBreakdown = useMemo(() => {
    const counts = {};
    delegates.forEach((d) => {
      counts[d.entityType] = (counts[d.entityType] || 0) + 1;
    });
    return counts;
  }, []);

  const activeDelegationsByLob = useMemo(() => {
    const counts = {};
    allDelegations.filter((d) => d.status === 'Approved').forEach((d) => {
      counts[d.lob] = (counts[d.lob] || 0) + 1;
    });
    return Object.entries(counts).map(([lob, count]) => ({ lob, count })).sort((a, b) => b.count - a.count);
  }, [allDelegations]);

  const activeDelegationsByProduct = useMemo(() => {
    const counts = {};
    allDelegations.filter((d) => d.status === 'Approved').forEach((d) => {
      counts[d.productName] = (counts[d.productName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count);
  }, [allDelegations]);

  const activeDelegationsByType = useMemo(() => {
    const counts = {};
    allDelegations.filter((d) => d.status === 'Approved').forEach((d) => {
      counts[d.delegationType] = (counts[d.delegationType] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
  }, [allDelegations]);

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

  // Pagination (shared)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Distribution data (static — used for Quick Reports in standard layout)
  const typeDistribution = useMemo(() => {
    const entitySets = {};
    allDelegations.forEach((d) => {
      if (!entitySets[d.delegationType]) entitySets[d.delegationType] = new Set();
      entitySets[d.delegationType].add(d.delegateId);
    });
    return Object.entries(entitySets).map(([type, ids]) => ({ type, count: ids.size })).sort((a, b) => b.count - a.count);
  }, [allDelegations]);

  const lobDistribution = useMemo(() => {
    const counts = {};
    delegates.forEach((d) => {
      const lobs = new Set(d.products.map((p) => p.lob));
      lobs.forEach((lob) => {
        counts[lob] = (counts[lob] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([lob, count]) => ({ lob, count })).sort((a, b) => b.count - a.count);
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

  // Filtered distribution counts (reactive — used in Card Filters sidebar)
  // These reflect the narrowed-down counts based on current filters
  const filteredDistributions = useMemo(() => {
    // For each filter option, count = "if I add this value to the current selections,
    // how many delegates would be in the result?" This uses the same AND logic as the
    // table: a delegate must have ALL selected values in each category.

    // Helper: given a set of filter values, compute which delegates pass (AND logic).
    // Each category is checked independently — a delegate needs at least one delegation
    // per selected value, but they don't have to be the same delegation.
    const getDelegatesForFilters = (f) => {
      // Base filter: search + entityType (delegate-level concerns)
      const baseDelegations = allDelegations.filter((d) => {
        if (f.search) {
          const term = f.search.toLowerCase();
          const delegate = delegates.find((del) => del.id === d.delegateId);
          const searchable = [d.contractedEntity, delegate?.trackingId || ''].join(' ').toLowerCase();
          if (!searchable.includes(term)) return false;
        }
        if (f.entityType.length > 0) {
          const delegate = delegates.find((del) => del.id === d.delegateId);
          if (!delegate || !f.entityType.includes(delegate.entityType)) return false;
        }
        return true;
      });

      // Group delegations by delegate
      const byDelegate = {};
      baseDelegations.forEach((d) => {
        if (!byDelegate[d.delegateId]) byDelegate[d.delegateId] = [];
        byDelegate[d.delegateId].push(d);
      });

      // AND check: for each selected value in each category, the delegate must have
      // at least one delegation with that value (checked independently per category)
      const passing = new Set();
      Object.entries(byDelegate).forEach(([id, dels]) => {
        if (f.lob.length > 0) {
          const myLobs = new Set(dels.map((d) => d.lob));
          if (!f.lob.every((v) => myLobs.has(v))) return;
        }
        if (f.product.length > 0) {
          const myProducts = new Set(dels.map((d) => d.productName));
          if (!f.product.every((v) => myProducts.has(v))) return;
        }
        if (f.delegationType.length > 0) {
          const myTypes = new Set(dels.map((d) => d.delegationType));
          if (!f.delegationType.every((v) => myTypes.has(v))) return;
        }
        if (f.openCAP && !dels.some((d) => d.correctiveActionPlan)) return;
        passing.add(id);
      });
      return passing;
    };

    // For each option in a category, simulate adding it to current selections and count
    const countForCategory = (categoryKey, allValues) => {
      const counts = {};
      allValues.forEach((val) => {
        const simulated = { ...filters, [categoryKey]: [...(filters[categoryKey] || []), val] };
        // Deduplicate in case val is already selected
        simulated[categoryKey] = [...new Set(simulated[categoryKey])];
        counts[val] = getDelegatesForFilters(simulated).size;
      });
      return counts;
    };

    const lobValues = lobDistribution.map((item) => item.lob);
    const productValues = productDistribution.map((item) => item.product);
    const typeValues = typeDistribution.map((item) => item.type);

    const lobCounts = countForCategory('lob', lobValues);
    const productCounts = countForCategory('product', productValues);
    const typeCounts = countForCategory('delegationType', typeValues);

    // openCAP count: simulate toggling openCAP on (from current filters)
    const capSimulated = { ...filters, openCAP: true };
    const openCAPCount = getDelegatesForFilters(capSimulated).size;

    return {
      lob: lobDistribution.map((item) => ({ ...item, count: lobCounts[item.lob] || 0 })),
      product: productDistribution.map((item) => ({ ...item, count: productCounts[item.product] || 0 })),
      type: typeDistribution.map((item) => ({ ...item, count: typeCounts[item.type] || 0 })),
      openCAPs: openCAPCount,
    };
  }, [filters, allDelegations, lobDistribution, productDistribution, typeDistribution]);

  // Grouped view: filter delegates, then build LOB summaries
  const filteredGrouped = useMemo(() => {
    return delegates
      .map((d) => {
        // Delegate-level filters
        if (filters.search) {
          const term = filters.search.toLowerCase();
          const searchable = [d.contractedEntity, d.trackingId, d.auditedEntity]
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
            if (filters.delegationType.length > 0) {
              dels = dels.filter((del) => filters.delegationType.includes(del.delegationType));
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

  // Shared helper: base-filter delegations by search + entityType only, group by delegate,
  // then apply AND logic per category independently.
  const getPassingDelegateIds = useMemo(() => {
    // Base filter: search + entityType
    const baseDelegations = allDelegations.filter((d) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const delegate = delegates.find((del) => del.id === d.delegateId);
        const searchable = [d.contractedEntity, delegate?.trackingId || ''].join(' ').toLowerCase();
        if (!searchable.includes(term)) return false;
      }
      if (filters.entityType.length > 0) {
        const delegate = delegates.find((del) => del.id === d.delegateId);
        if (!delegate || !filters.entityType.includes(delegate.entityType)) return false;
      }
      return true;
    });

    // Group by delegate — check each category independently
    const byDelegate = {};
    baseDelegations.forEach((d) => {
      if (!byDelegate[d.delegateId]) byDelegate[d.delegateId] = [];
      byDelegate[d.delegateId].push(d);
    });

    const passing = new Set();
    Object.entries(byDelegate).forEach(([id, dels]) => {
      if (filters.lob.length > 0) {
        const myLobs = new Set(dels.map((d) => d.lob));
        if (!filters.lob.every((v) => myLobs.has(v))) return;
      }
      if (filters.product.length > 0) {
        const myProducts = new Set(dels.map((d) => d.productName));
        if (!filters.product.every((v) => myProducts.has(v))) return;
      }
      if (filters.delegationType.length > 0) {
        const myTypes = new Set(dels.map((d) => d.delegationType));
        if (!filters.delegationType.every((v) => myTypes.has(v))) return;
      }
      if (filters.openCAP && !dels.some((d) => d.correctiveActionPlan)) return;
      passing.add(id);
    });

    return { passing, baseDelegations };
  }, [filters, allDelegations]);

  // Ungrouped view: group by Contracted Entity + LOB
  const filteredUngrouped = useMemo(() => {
    const { passing, baseDelegations } = getPassingDelegateIds;

    const groupMap = {};
    baseDelegations.forEach((d) => {
      if (!passing.has(d.delegateId)) return;
      const key = `${d.delegateId}-${d.lob}`;
      if (!groupMap[key]) {
        const delegate = delegates.find((del) => del.id === d.delegateId);
        groupMap[key] = {
          id: key,
          delegateId: d.delegateId,
          contractedEntity: d.contractedEntity,
          trackingId: delegate?.trackingId,
          entityType: delegate?.entityType,
          lob: d.lob,
          products: new Set(),
          delegationTypes: new Set(),
          statuses: new Set(),
          hasOpenCAP: false,
        };
      }
      groupMap[key].products.add(d.productName);
      groupMap[key].delegationTypes.add(d.delegationType);
      groupMap[key].statuses.add(d.status);
      if (d.correctiveActionPlan) groupMap[key].hasOpenCAP = true;
    });

    return Object.values(groupMap).map((g) => ({
      ...g,
      products: [...g.products],
      delegationTypes: [...g.delegationTypes],
      statuses: [...g.statuses],
    }));
  }, [getPassingDelegateIds]);

  // By-entity view: one row per delegate with LOBs aggregated as pills
  const filteredByEntity = useMemo(() => {
    const { passing, baseDelegations } = getPassingDelegateIds;

    const groupMap = {};
    baseDelegations.forEach((d) => {
      if (!passing.has(d.delegateId)) return;
      const key = d.delegateId;
      if (!groupMap[key]) {
        const delegate = delegates.find((del) => del.id === d.delegateId);
        groupMap[key] = {
          id: key,
          delegateId: d.delegateId,
          contractedEntity: d.contractedEntity,
          trackingId: delegate?.trackingId,
          entityType: delegate?.entityType,
          lobs: new Set(),
          products: new Set(),
          delegationTypes: new Set(),
          hasOpenCAP: false,
        };
      }
      groupMap[key].lobs.add(d.lob);
      groupMap[key].products.add(d.productName);
      groupMap[key].delegationTypes.add(d.delegationType);
      if (d.correctiveActionPlan) groupMap[key].hasOpenCAP = true;
    });

    return Object.values(groupMap).map((g) => ({
      ...g,
      lobs: [...g.lobs],
      products: [...g.products],
      delegationTypes: [...g.delegationTypes],
    }));
  }, [getPassingDelegateIds]);

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
                <Tag key={name} style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>
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
              <Tag key={t} style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>
                {t}
              </Tag>
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
      render: (v) => <Tag style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>{v}</Tag>,
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
              <Tag key={name} style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>
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
            <Tag key={t} style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>
              {t}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Open CAP',
      dataIndex: 'hasOpenCAP',
      width: 80,
      align: 'center',
      render: (v) => v ? <Tag color="red">Yes</Tag> : <span style={{ color: '#CCC9C6' }}>No</span>,
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

  // By-entity view columns
  const byEntityColumns = [
    {
      title: 'Contracted Entity',
      dataIndex: 'contractedEntity',
      width: 200,
      sorter: (a, b) => a.contractedEntity.localeCompare(b.contractedEntity),
      render: (text, record) => (
        <a
          onClick={() => navigate(`/delegates/${record.delegateId}`)}
          style={{ fontWeight: 500, color: '#004D99' }}
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
      render: (v) => <Tag style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>{v}</Tag>,
    },
    {
      title: 'LOB',
      dataIndex: 'lobs',
      width: 180,
      render: (lobs) => (
        <Space size={4} wrap>
          {lobs.map((lob) => (
            <Tag key={lob} style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>{lob}</Tag>
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
              <Tag key={name} style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>
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
            <Tag key={t} style={{ ...pillStyle, background: '#EDEDEB', border: 'none' }}>
              {t}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Open CAP',
      dataIndex: 'hasOpenCAP',
      width: 80,
      align: 'center',
      render: (v) => v ? <Tag color="red">Yes</Tag> : <span style={{ color: '#CCC9C6' }}>No</span>,
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

  const exportCols = [
    { title: 'Contracted Entity', dataIndex: 'contractedEntity' },
    { title: 'Tracking ID', dataIndex: 'trackingId' },
    { title: 'Entity Type', dataIndex: 'entityType' },
    { title: 'LOBs', dataIndex: 'lobs' },
    { title: 'Products', dataIndex: 'products' },
    { title: 'Delegation Types', dataIndex: 'delegationTypes' },
    { title: 'Open CAP', dataIndex: 'hasOpenCAP' },
  ];

  return (
    <div>
    <Row gutter={16}>
      {/* Left column: KPIs, charts, table */}
      <Col xs={24} lg={showChatbot ? 16 : 24} style={showChatbot ? {} : { maxWidth: 1380, margin: '0 auto' }}>

      {/* KPI Cards & Distribution Charts — toggled via Dashboard switch */}
      {showDashboard && (<>
      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        <Card style={{ flex: 1, borderRadius: 16, boxShadow: '0px 1.5px 24px 0px rgba(0,0,0,0.25)' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Total Delegated Entities</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#6D2077', lineHeight: 1.1, margin: '8px 0' }}>
            {stats.totalDelegates}
          </div>
        </Card>
        <Card style={{ flex: 1, borderRadius: 16, boxShadow: '0px 1.5px 24px 0px rgba(0,0,0,0.25)' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Active Delegations</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#6D2077', lineHeight: 1.1, margin: '8px 0' }}>
            {stats.activeDelegations}
          </div>
        </Card>
      </div>


      {/* Quick Report Cards — hidden in cardFilters mode since they become inline filters */}
      {layoutMode !== 'cardFilters' && (<>
      <Card style={{ marginBottom: 40, borderRadius: 16 }} styles={{ body: { padding: '20px 24px' } }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
          <img src={providerGroupIcon} style={{ width: 28, height: 28, marginTop: 3 }} />
          <div>
            <Title level={3} style={{ margin: 0 }}>Delegate Reports</Title>
            <Text type="secondary" style={{ display: 'block', fontSize: 14 }}>Counts of delegated entities — the organizations and vendors that hold delegation agreements — broken down by LOB, product, and delegation type. Click any item to open a filterable report you can export.</Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 64 }}>
          {/* Entities by LOB */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Entities by LOB</div>
            {lobDistribution.map((item, i) => (
              <div
                key={item.lob}
                onClick={() => navigate(`/reports/lob/${item.lob.toLowerCase().replace(/\s+/g, '-')}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < lobDistribution.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99', fontSize: 16 }}>{item.lob}</Text>
                <span style={{ background: '#F2EFEB', color: '#1A1A1A', borderRadius: 6, padding: '1px 9px', fontSize: 13, fontWeight: 400, display: 'inline-block' }}>{item.count}</span>
              </div>
            ))}
          </div>
          {/* Entities by Product */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Entities by Product</div>
            {productDistribution.map((item, i) => (
              <div
                key={item.product}
                onClick={() => navigate(`/reports/product/${encodeURIComponent(item.product.toLowerCase().replace(/\s+/g, '-'))}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < productDistribution.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99', fontSize: 16 }}>{item.product}</Text>
                <span style={{ background: '#F2EFEB', color: '#1A1A1A', borderRadius: 6, padding: '1px 9px', fontSize: 13, fontWeight: 400, display: 'inline-block' }}>{item.count}</span>
              </div>
            ))}
          </div>
          {/* Entities by Delegation Type */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Entities by Delegation Type</div>
            {typeDistribution.map((item, i) => (
              <div
                key={item.type}
                onClick={() => navigate(`/reports/delegation-type/${item.type.toLowerCase().replace(/\s+/g, '-')}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < typeDistribution.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99', fontSize: 16 }}>{item.type}</Text>
                <span style={{ background: '#F2EFEB', color: '#1A1A1A', borderRadius: 6, padding: '1px 9px', fontSize: 13, fontWeight: 400, display: 'inline-block' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 24, borderRadius: 16 }} styles={{ body: { padding: '20px 24px' } }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
          <img src={formsIcon} style={{ width: 28, height: 28, marginTop: 3 }} />
          <div>
            <Title level={3} style={{ margin: 0 }}>Delegation Reports</Title>
            <Text type="secondary" style={{ display: 'block', fontSize: 14 }}>Counts of active delegation agreements — the individual delegated services under each entity's contract — broken down by LOB, product, and delegation type. Click any item to open a filterable report you can export.</Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 64 }}>
          {/* Active Delegations by LOB */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Active Delegations by LOB</div>
            {activeDelegationsByLob.map((item, i) => (
              <div
                key={item.lob}
                onClick={() => navigate(`/reports/active-delegations/lob/${item.lob.toLowerCase().replace(/\s+/g, '-')}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < activeDelegationsByLob.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99', fontSize: 16 }}>{item.lob}</Text>
                <span style={{ background: '#F2EFEB', color: '#1A1A1A', borderRadius: 6, padding: '1px 9px', fontSize: 13, fontWeight: 400, display: 'inline-block' }}>{item.count}</span>
              </div>
            ))}
          </div>
          {/* Active Delegations by Product */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Active Delegations by Product</div>
            {activeDelegationsByProduct.map((item, i) => (
              <div
                key={item.product}
                onClick={() => navigate(`/reports/active-delegations/product/${encodeURIComponent(item.product.toLowerCase().replace(/\s+/g, '-'))}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < activeDelegationsByProduct.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99', fontSize: 16 }}>{item.product}</Text>
                <span style={{ background: '#F2EFEB', color: '#1A1A1A', borderRadius: 6, padding: '1px 9px', fontSize: 13, fontWeight: 400, display: 'inline-block' }}>{item.count}</span>
              </div>
            ))}
          </div>
          {/* Active Delegations by Type */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Active Delegations by Type</div>
            {activeDelegationsByType.map((item, i) => (
              <div
                key={item.type}
                onClick={() => navigate(`/reports/active-delegations/type/${item.type.toLowerCase().replace(/\s+/g, '-')}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < activeDelegationsByType.length - 1 ? '1px solid #F0EEEC' : 'none', cursor: 'pointer' }}
              >
                <Text style={{ color: '#004D99', fontSize: 16 }}>{item.type}</Text>
                <span style={{ background: '#F2EFEB', color: '#1A1A1A', borderRadius: 6, padding: '1px 9px', fontSize: 13, fontWeight: 400, display: 'inline-block' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      </>)}
      </>)}
      {/* Delegated Entities section — hidden for now, report pages have filters */}
      {false && <div style={{ marginBottom: 24 }}>
            <Title level={3} style={{ margin: '0 0 12px' }}>
              Delegated Entities
            </Title>

            {layoutMode === 'standard' ? (
              <>
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
                productOptions={productOptions}
              />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {filteredByEntity.length} delegated entities
              </Text>
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => exportToCSV(filteredByEntity, exportCols, 'delegated-entities.csv')}
                >
                  Export CSV
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => exportToExcel(filteredByEntity, exportCols, 'delegated-entities.xlsx')}
                >
                  Export Excel
                </Button>
              </Space>
            </div>

            <div className="table-bordered">
              <Table
                dataSource={filteredByEntity.slice(
                  (currentPage - 1) * pageSize,
                  currentPage * pageSize
                )}
                columns={byEntityColumns}
                showSorterTooltip={false}
          rowKey="id"
                size="small"
                pagination={false}
                scroll={{ x: 1200 }}
              />
            </div>

            {/* Pagination */}
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
                total={filteredByEntity.length}
                showSizeChanger
                size="small"
                pageSizeOptions={[10, 20, 50]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </div>
              </>
            ) : (
              /* ---- Card Filters layout: sidebar + table ---- */
              <div style={{ display: 'flex', gap: 24 }}>
                {/* Left filter sidebar */}
                <div style={{ width: 220, flexShrink: 0, background: '#fff', borderRadius: 8, border: '1px solid #EDEDEB', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <FilterOutlined style={{ color: '#5E5D5A' }} />
                    <Text strong style={{ color: '#5E5D5A' }}>Filters</Text>
                    {(filters.search || filters.entityType.length > 0 || filters.openCAP || filters.lob.length > 0 || filters.product.length > 0 || filters.delegationType.length > 0) && (
                      <Button type="link" size="small" onClick={handleClear} style={{ marginLeft: 'auto', padding: 0, fontSize: 11 }}>Clear All</Button>
                    )}
                  </div>

                  <input
                    placeholder="Search entity name or Tracking ID..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    style={{ width: '100%', padding: '5px 10px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, marginBottom: 16 }}
                  />

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 12, color: '#5E5D5A', display: 'block', marginBottom: 4 }}>Entity Type</Text>
                    <Select
                      placeholder="All"
                      mode="multiple"
                      value={filters.entityType || []}
                      onChange={(val) => handleFilterChange('entityType', val)}
                      style={{ width: '100%' }}
                      allowClear
                      maxTagCount={1}
                      size="small"
                      options={[
                        { label: 'Provider', value: 'Provider' },
                        { label: 'Vendor', value: 'Vendor' },
                      ]}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 12, color: '#5E5D5A', display: 'block', marginBottom: 4 }}>Open CAPs</Text>
                    {(() => {
                      const capDisabled = !filters.openCAP && filteredDistributions.openCAPs === 0;
                      return (
                        <div
                          onClick={capDisabled ? undefined : () => handleFilterChange('openCAP', !filters.openCAP)}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '4px 8px', borderRadius: 4,
                            cursor: capDisabled ? 'default' : 'pointer',
                            opacity: capDisabled ? 0.4 : 1,
                            background: filters.openCAP ? '#F0E4FA' : 'transparent',
                            fontWeight: filters.openCAP ? 600 : 400,
                            fontSize: 13,
                          }}
                        >
                          <Text style={{ fontSize: 13, color: filters.openCAP ? '#7D3F98' : '#1A1A1A' }}>Has Open CAP</Text>
                          <Text strong style={{ fontSize: 13 }}>{filteredDistributions.openCAPs}</Text>
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 12, color: '#5E5D5A', display: 'block', marginBottom: 4 }}>LOB</Text>
                    {filteredDistributions.lob.map((item) => {
                      const isActive = filters.lob.includes(item.lob);
                      const isDisabled = !isActive && item.count === 0;
                      return (
                        <div
                          key={item.lob}
                          onClick={isDisabled ? undefined : () => {
                            const newVal = isActive ? filters.lob.filter((l) => l !== item.lob) : [...filters.lob, item.lob];
                            handleFilterChange('lob', newVal);
                          }}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '4px 8px', borderRadius: 4, fontSize: 13,
                            cursor: isDisabled ? 'default' : 'pointer',
                            opacity: isDisabled ? 0.4 : 1,
                            background: isActive ? '#F0E4FA' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <Text style={{ fontSize: 13, color: isActive ? '#7D3F98' : '#1A1A1A' }}>{item.lob}</Text>
                          <Text strong style={{ fontSize: 13 }}>{item.count}</Text>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 12, color: '#5E5D5A', display: 'block', marginBottom: 4 }}>Product</Text>
                    {filteredDistributions.product.map((item) => {
                      const isActive = filters.product.includes(item.product);
                      const isDisabled = !isActive && item.count === 0;
                      return (
                        <div
                          key={item.product}
                          onClick={isDisabled ? undefined : () => {
                            const newVal = isActive ? filters.product.filter((p) => p !== item.product) : [...filters.product, item.product];
                            handleFilterChange('product', newVal);
                          }}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '4px 8px', borderRadius: 4, fontSize: 13,
                            cursor: isDisabled ? 'default' : 'pointer',
                            opacity: isDisabled ? 0.4 : 1,
                            background: isActive ? '#F0E4FA' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <Text style={{ fontSize: 13, color: isActive ? '#7D3F98' : '#1A1A1A' }}>{item.product}</Text>
                          <Text strong style={{ fontSize: 13 }}>{item.count}</Text>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 12, color: '#5E5D5A', display: 'block', marginBottom: 4 }}>Delegation Type</Text>
                    {filteredDistributions.type.map((item) => {
                      const isActive = filters.delegationType.includes(item.type);
                      const isDisabled = !isActive && item.count === 0;
                      return (
                        <div
                          key={item.type}
                          onClick={isDisabled ? undefined : () => {
                            const newVal = isActive ? filters.delegationType.filter((t) => t !== item.type) : [...filters.delegationType, item.type];
                            handleFilterChange('delegationType', newVal);
                          }}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '4px 8px', borderRadius: 4, fontSize: 13,
                            cursor: isDisabled ? 'default' : 'pointer',
                            opacity: isDisabled ? 0.4 : 1,
                            background: isActive ? '#F0E4FA' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <Text style={{ fontSize: 13, color: isActive ? '#7D3F98' : '#1A1A1A' }}>{item.type}</Text>
                          <Text strong style={{ fontSize: 13 }}>{item.count}</Text>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: table content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {filteredByEntity.length} delegated entities
                    </Text>
                    <Space>
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => exportToCSV(filteredByEntity, exportCols, 'delegated-entities.csv')}
                      >
                        Export CSV
                      </Button>
                      <Button
                        icon={<FileExcelOutlined />}
                        onClick={() => exportToExcel(filteredByEntity, exportCols, 'delegated-entities.xlsx')}
                      >
                        Export Excel
                      </Button>
                    </Space>
                  </div>

                  <div className="table-bordered">
                    <Table
                      dataSource={filteredByEntity.slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      )}
                      columns={byEntityColumns}
                      showSorterTooltip={false}
          rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ x: 1200 }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredByEntity.length}
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
              </div>
            )}
      </div>}
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
