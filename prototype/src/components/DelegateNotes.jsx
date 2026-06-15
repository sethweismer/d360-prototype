import { useState } from 'react';
import { Typography, Button, Input, Space, Empty, message, Popconfirm } from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useUser } from '../context/UserContext';

const { Text } = Typography;
const { TextArea } = Input;

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DelegateNotes({ initialNotes = [] }) {
  const { isEditUser } = useUser();
  const [notes, setNotes] = useState(initialNotes);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (!newText.trim()) return;
    const now = new Date().toISOString();
    setNotes([
      ...notes,
      {
        id: `N-${Date.now()}`,
        text: newText.trim(),
        createdAt: now,
        updatedAt: null,
        author: 'Current User',
      },
    ]);
    setNewText('');
    setAdding(false);
    message.success('Note added');
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = () => {
    const now = new Date().toISOString();
    setNotes(
      notes.map((n) =>
        n.id === editingId ? { ...n, text: editText.trim(), updatedAt: now } : n
      )
    );
    setEditingId(null);
    setEditText('');
    message.success('Note updated');
  };

  const handleDelete = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
    message.success('Note deleted');
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 18, fontWeight: 500 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Notes
        </span>
        {isEditUser && !adding && (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setAdding(true)}
          >
            Add Note
          </Button>
        )}
      </div>

      {adding && (
        <div style={{ marginBottom: 16, padding: 12, background: '#F9F7F5', borderRadius: 6 }}>
          <TextArea
            rows={3}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Write a note..."
            autoFocus
          />
          <Space style={{ marginTop: 8 }}>
            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleAdd}>
              Save
            </Button>
            <Button size="small" icon={<CloseOutlined />} onClick={() => { setAdding(false); setNewText(''); }}>
              Cancel
            </Button>
          </Space>
        </div>
      )}

      {notes.length === 0 && !adding && (
        <div style={{
          padding: '16px',
          background: '#FFFFFF',
          border: '1px solid #F0EEEC',
          borderRadius: 6,
          textAlign: 'center',
        }}>
          <Empty description="No notes" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              padding: '12px 16px',
              background: '#FFFFFF',
              border: '1px solid #F0EEEC',
              borderRadius: 6,
            }}
          >
            {editingId === note.id ? (
              <>
                <TextArea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
                <Space style={{ marginTop: 8 }}>
                  <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button size="small" icon={<CloseOutlined />} onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </Space>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}>{note.text}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {note.author} &middot; {note.updatedAt ? `Updated ${formatTimestamp(note.updatedAt)}` : formatTimestamp(note.createdAt)}
                  </Text>
                  {isEditUser && (
                    <Space size={4}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(note)}
                      />
                      <Popconfirm
                        title="Delete this note?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(note.id)}
                        okText="Delete"
                        okType="danger"
                        cancelText="Cancel"
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </Space>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
