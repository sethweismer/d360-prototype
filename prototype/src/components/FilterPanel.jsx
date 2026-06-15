import { Select, Input, Button, Space, Tag, Typography } from 'antd';
import { SearchOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

const DELEGATION_TYPES = ['Clinical-UM', 'Clinical-PHM', 'Claims'];
const LOB_OPTIONS = ['Medicare', 'Medicaid', 'Commercial', 'I-SNP', 'D-SNP', 'C-SNP'];
const ENTITY_TYPES = ['Provider', 'Vendor'];

export default function FilterPanel({ filters, onFilterChange, onClear, productOptions = [], hiddenFields = [] }) {
  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value && (Array.isArray(value) ? value.length > 0 : value !== '')
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <Space wrap size={[12, 8]} align="center">
        <Space size={4} align="center">
          <FilterOutlined style={{ color: '#5E5D5A' }} />
          <Typography.Text strong style={{ color: '#5E5D5A', marginRight: 4 }}>Filters</Typography.Text>
        </Space>
        <Input
          placeholder="Search entity name or Tracking ID..."
          prefix={<SearchOutlined />}
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        {!hiddenFields.includes('entityType') && (
          <Select
            placeholder="Entity Type"
            mode="multiple"
            value={filters.entityType || []}
            onChange={(val) => onFilterChange('entityType', val)}
            style={{ minWidth: 140 }}
            allowClear
            maxTagCount={1}
          >
            {ENTITY_TYPES.map((t) => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
        )}
        {!hiddenFields.includes('lob') && (
          <Select
            placeholder="LOB"
            mode="multiple"
            value={filters.lob || []}
            onChange={(val) => onFilterChange('lob', val)}
            style={{ minWidth: 130 }}
            allowClear
            maxTagCount={1}
          >
            {LOB_OPTIONS.map((l) => (
              <Option key={l} value={l}>{l}</Option>
            ))}
          </Select>
        )}
        {!hiddenFields.includes('product') && (
          <Select
            placeholder="Product"
            mode="multiple"
            value={filters.product || []}
            onChange={(val) => onFilterChange('product', val)}
            style={{ minWidth: 180 }}
            allowClear
            maxTagCount={1}
          >
            {productOptions.map((p) => (
              <Option key={p} value={p}>{p}</Option>
            ))}
          </Select>
        )}
        {!hiddenFields.includes('delegationType') && (
          <Select
            placeholder="Delegation Type"
            mode="multiple"
            value={filters.delegationType || []}
            onChange={(val) => onFilterChange('delegationType', val)}
            style={{ minWidth: 170 }}
            allowClear
            maxTagCount={1}
          >
            {DELEGATION_TYPES.map((t) => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
        )}
        {activeFilters.length > 0 && (
          <Button
            icon={<ClearOutlined />}
            onClick={onClear}
            size="small"
            type="text"
          >
            Clear All
          </Button>
        )}
      </Space>
      {activeFilters.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {activeFilters.map(([key, value]) => {
            const values = Array.isArray(value) ? value : [value];
            return values.map((v) => (
              <Tag
                key={`${key}-${v}`}
                closable
                onClose={() => {
                  if (Array.isArray(filters[key])) {
                    onFilterChange(key, filters[key].filter((x) => x !== v));
                  } else {
                    onFilterChange(key, '');
                  }
                }}
                style={{ marginBottom: 4 }}
              >
                {v}
              </Tag>
            ));
          })}
        </div>
      )}
    </div>
  );
}
