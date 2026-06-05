import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Avatar, Tag, Typography } from 'antd';
import { RobotOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import processQuery from '../utils/chatbotEngine';

const { Text } = Typography;

const WELCOME_MESSAGE =
  "Hello! I'm the D360 Assistant. Ask me anything about your delegation data.\n\nTry questions like:\n  How many delegates do we have?\n  Which delegates have overdue audits?\n  Who is the contact for Pacific Health Partners?";

const SUGGESTED_QUESTIONS = [
  'How many delegates do we have?',
  'Which delegates have overdue audits?',
  'Who has open CAPs?',
  'How many Clinical-UM delegations are there?',
  'How many delegates are in CA?',
  'Who is the contact for Midwest Care Alliance?',
  'Give me an overview',
  'Which delegates does Sarah Mitchell manage?',
];

export default function DelegationChatbot() {
  const [messages, setMessages] = useState([
    { id: 0, role: 'bot', text: WELCOME_MESSAGE },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processQuery(text);
      const botMsg = { id: Date.now() + 1, role: 'bot', text: response };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleSend = () => {
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (question) => {
    sendMessage(question);
  };

  const showSuggestions = messages.length <= 1;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ color: '#004D99', fontSize: 16 }} />
          <span>D360 Assistant</span>
          <Tag color="blue" style={{ fontSize: 10, marginLeft: 4, lineHeight: '16px' }}>AI</Tag>
        </div>
      }
      size="small"
      styles={{ header: { borderBottom: '1px solid #DBD8D5' } }}
    >
      {/* Messages area */}
      <div
        style={{
          height: 300,
          overflowY: 'auto',
          marginBottom: 12,
          paddingRight: 4,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              marginBottom: 12,
              gap: 8,
            }}
          >
            <Avatar
              size="small"
              icon={msg.role === 'bot' ? <RobotOutlined /> : <UserOutlined />}
              style={{
                background: msg.role === 'bot' ? '#004D99' : '#8F8C89',
                flexShrink: 0,
              }}
            />
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius:
                  msg.role === 'user'
                    ? '12px 4px 12px 12px'
                    : '4px 12px 12px 12px',
                background: msg.role === 'user' ? '#E6F3FF' : '#F2EFEB',
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#1A1A19',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Avatar
              size="small"
              icon={<RobotOutlined />}
              style={{ background: '#004D99', flexShrink: 0 }}
            />
            <div
              style={{
                padding: '8px 16px',
                borderRadius: '4px 12px 12px 12px',
                background: '#F2EFEB',
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#8F8C89',
                    animation: 'dotPulse 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
            Suggested questions:
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTED_QUESTIONS.map((q) => (
              <Tag
                key={q}
                style={{
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: '2px 8px',
                  borderColor: '#004D99',
                  color: '#004D99',
                  background: '#FFFFFF',
                }}
                onClick={() => handleSuggestionClick(q)}
              >
                {q}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Ask about delegates, audits, contacts..."
          disabled={isTyping}
          style={{ flex: 1 }}
          size="middle"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
          size="middle"
        />
      </div>

      {/* Typing animation keyframes */}
      <style>{`
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Card>
  );
}
