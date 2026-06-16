import { Tag } from 'antd';

const filterLabels = {
  search: 'Search',
  entityType: 'Entity Type',
  lob: 'LOB',
  product: 'Product',
  delegationType: 'Delegation Type',
};

export default function ReportResultsSummary({ count, noun, pluralNoun, filters = {}, pageContext = [], actions }) {
  const activeFilters = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) ? value.length === 0 : value === '')) return;
    const label = filterLabels[key] || key;
    const display = Array.isArray(value) ? value.join(', ') : value;
    activeFilters.push({ label, value: display });
  });

  const allContext = [...pageContext, ...activeFilters];
  const plural = count !== 1;
  const label = plural ? (pluralNoun || `${noun}s`) : noun;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E0DDD9',
      borderRadius: 8,
      padding: '14px 20px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 20,
    }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: '#6D2077', lineHeight: 1 }}>{count}</span>
        <span style={{ fontSize: 15, color: '#5E5D5A' }}>{label}</span>
      </div>

      {allContext.length > 0 && (
        <>
          <div style={{ width: 1, height: 36, background: '#DBD8D5', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: 12, color: '#8F8C89', marginRight: 2 }}>Filtered by:</span>
            {allContext.map(({ label, value }) => (
              <Tag key={label} style={{ margin: 0, fontSize: 13, padding: '2px 8px' }}>
                <span style={{ fontWeight: 600 }}>{label}:</span> {value}
              </Tag>
            ))}
          </div>
        </>
      )}
      {!allContext.length && <div style={{ flex: 1 }} />}
      {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}
