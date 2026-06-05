import { Tag } from 'antd';

const statusColors = {
  Approved: 'green',
  Terminated: 'default',
  'Under Review': 'orange',
  'Pend Entity': 'blue',
  Draft: 'default',
};

export default function StatusBadge({ status }) {
  return <Tag color={statusColors[status] || 'default'}>{status}</Tag>;
}
