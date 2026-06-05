import { Input, Select, DatePicker, Switch } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

// Field type definitions for delegation fields
const FIELD_CONFIGS = {
  status: {
    type: 'select',
    options: ['Approved', 'Terminated', 'Under Review', 'Pend Entity', 'Draft'],
  },
  delegatedServices: {
    type: 'text',
  },
  nextAuditDue: { type: 'date' },
  lastAuditCompleted: { type: 'date' },
  oversightAuditTimeline: {
    type: 'select',
    options: ['Yearly', 'Bi-annual', 'Quarterly'],
  },
  correctiveActionPlan: {
    type: 'boolean',
  },
  decisionAuthCommunication: {
    type: 'select',
    options: ['Electronic 278', 'Manual Log'],
  },
  encounterSubmission: {
    type: 'select',
    options: ['Electronic 837', 'Manual'],
  },
};

export default function EditableField({ field, value, editing, onChange }) {
  const config = FIELD_CONFIGS[field];

  if (!editing || !config) {
    return null; // caller handles read-only display
  }

  const style = { width: '100%', minWidth: 120 };

  switch (config.type) {
    case 'select':
      return (
        <Select
          value={value || undefined}
          onChange={(val) => onChange(field, val)}
          style={style}
          size="small"
          placeholder="Select..."
          allowClear
        >
          {config.options.map((opt) => (
            <Option key={opt} value={opt}>{opt}</Option>
          ))}
        </Select>
      );

    case 'date':
      return (
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={(date, dateStr) => onChange(field, dateStr || null)}
          style={style}
          size="small"
          format="YYYY-MM-DD"
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(field, e.target.value ? Number(e.target.value) : null)}
          style={style}
          size="small"
          placeholder="Enter value..."
        />
      );

    case 'boolean':
      return (
        <Switch
          checked={!!value}
          onChange={(checked) => onChange(field, checked)}
          size="small"
          checkedChildren="Yes"
          unCheckedChildren="No"
        />
      );

    case 'text':
    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(field, e.target.value)}
          style={style}
          size="small"
          placeholder="Enter value..."
        />
      );
  }
}
