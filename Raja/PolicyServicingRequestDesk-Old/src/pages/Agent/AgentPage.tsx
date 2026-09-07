// ============================================================
// AI COPILOT AGENT PAGE - Copilot Studio Integration
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
  Input,
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  Send24Regular,
  DocumentSearch20Regular,
  ClipboardTask20Regular,
  ArrowCounterclockwise20Regular,
  QuestionCircle20Regular,
  Sparkle24Regular,
} from '@fluentui/react-icons';
import { designTokens } from '../../theme/tokens';

const useStyles = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    height: 'calc(100vh - 120px)',
    gap: '16px',
    maxWidth: '1200px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  agentCard: {
    padding: '20px',
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    background: `linear-gradient(135deg, #0E4DA4, #1A7EEE)`,
    color: 'white',
  },
  agentAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  quickPrompts: {
    padding: '16px',
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  promptBtn: {
    width: '100%',
    justifyContent: 'flex-start',
    marginBottom: '6px',
    fontSize: '12px',
    textAlign: 'left',
    whiteSpace: 'normal',
    height: 'auto',
    padding: '8px 10px',
    lineHeight: 1.4,
  },
  chatArea: {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: designTokens.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  chatHeader: {
    padding: '16px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  messageBubble: {
    display: 'flex',
    gap: '10px',
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageContent: {
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  agentMessage: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    borderRadius: '4px 12px 12px 12px',
    boxShadow: designTokens.shadows.sm,
  },
  userMessage: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderRadius: '12px 4px 12px 12px',
  },
  messageTime: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
    marginTop: '4px',
    textAlign: 'right',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '4px 12px 12px 12px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralForeground3,
  },
  inputArea: {
    padding: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  inputField: {
    flex: 1,
  },
  suggestion: {
    padding: '8px 14px',
    borderRadius: designTokens.borderRadius.pill,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    backgroundColor: tokens.colorNeutralBackground1,
    whiteSpace: 'nowrap',
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      border: `1px solid ${tokens.colorBrandBackground}`,
      color: tokens.colorBrandForeground1,
    },
  },
  suggestionsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '8px 16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const QUICK_PROMPTS = [
  { icon: <DocumentSearch20Regular />, text: 'What is the status of my request SR20240847123?' },
  { icon: <ClipboardTask20Regular />, text: 'I want to change my address on policy LI-2021-00147832' },
  { icon: <QuestionCircle20Regular />, text: 'What documents are needed for nominee change?' },
  { icon: <ArrowCounterclockwise20Regular />, text: 'Can I reinstate my lapsed policy?' },
];

const AGENT_RESPONSES: Record<string, string> = {
  status:
    '📋 **Request SR20240847123 - Address Change**\n\n**Current Status:** Pending Approval\n**Submitted:** 2 days ago\n**SLA Deadline:** In 6 hours\n**Assigned To:** Priya Verma\n\nYour document has been verified. The request is awaiting final approval from the servicing team. You will be notified once approved.',
  address:
    '🏠 **Address Change Request**\n\nI can help you initiate an address change request for policy LI-2021-00147832.\n\n**Required Documents:**\n• Valid Address Proof (Aadhaar/Utility Bill)\n• Self-Declaration Form (optional)\n\n**SLA:** 2 business days\n**Approval Required:** Yes (1 level)\n\nWould you like me to start the address change request now?',
  nominee:
    '👥 **Documents Required for Nominee Change:**\n\n1. ✅ **Nominee Identity Proof** (Mandatory) - Aadhaar, PAN, or Passport of the new nominee\n2. ✅ **Nominee Change Form** (Mandatory) - Signed form (download from portal)\n\n**Important Notes:**\n• If nominee is a minor, guardian details are required\n• Total nominee share must equal 100%\n• SLA: 3-5 business days\n\nWould you like to initiate a nominee change request?',
  reinstate:
    '🔄 **Policy Reinstatement**\n\nTo check reinstatement eligibility, I\'ll need your policy number. Reinstatement is available if:\n\n• Policy lapsed within the last 5 years\n• Good health declaration can be provided\n• Arrear premiums are paid\n\n**Required Documents:**\n1. Health Declaration Form\n2. Arrear Premium Payment Receipt\n\nPlease provide your policy number to check eligibility.',
  default:
    '👋 Hello! I\'m the **Policy Servicing Assistant**. I can help you with:\n\n• 🔍 Check request status\n• 📋 Initiate servicing requests\n• 📚 Answer policy questions\n• 🔄 Policy reinstatement guidance\n• 📄 Document requirements\n\nHow can I assist you today?',
};

const getAgentResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();
  if (lower.includes('status') || lower.includes('sr2024')) return AGENT_RESPONSES.status;
  if (lower.includes('address') || lower.includes('change address')) return AGENT_RESPONSES.address;
  if (lower.includes('nominee') || lower.includes('document')) return AGENT_RESPONSES.nominee;
  if (lower.includes('reinstate') || lower.includes('lapsed')) return AGENT_RESPONSES.reinstate;
  return AGENT_RESPONSES.default;
};

const SUGGESTIONS = [
  'Track my request',
  'Change address',
  'Nominee documents',
  'Premium mode change',
  'Bank account update',
];

export const AgentPage: React.FC = () => {
  const styles = useStyles();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: AGENT_RESPONSES.default,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate agent thinking
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: getAgentResponse(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 1200 + Math.random() * 800);
  };

  const renderMessageContent = (content: string) => {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    return (
      <div>
        {lines.map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <Text key={i} weight="bold" style={{ display: 'block' }}>{line.slice(2, -2)}</Text>;
          }
          if (line.startsWith('• ')) {
            return <Text key={i} style={{ display: 'block', paddingLeft: 8 }}>{line}</Text>;
          }
          if (line.startsWith('#')) {
            return <Text key={i} size={400} weight="bold" style={{ display: 'block' }}>{line.replace(/^#+\s/, '')}</Text>;
          }
          return <Text key={i} style={{ display: line ? 'block' : 'block', minHeight: line ? undefined : 8 }}>{line}</Text>;
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Agent Info */}
        <div className={styles.agentCard}>
          <div className={styles.agentAvatar}>
            <Sparkle24Regular style={{ width: 28, height: 28 }} />
          </div>
          <Text weight="bold" style={{ color: 'white', fontSize: 16, display: 'block' }}>
            Policy Servicing Assistant
          </Text>
          <Text size={200} style={{ color: 'rgba(255,255,255,0.8)', display: 'block', marginTop: 4 }}>
            Powered by Microsoft Copilot Studio
          </Text>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            <Badge appearance="filled" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small">
              Request Tracking
            </Badge>
            <Badge appearance="filled" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small">
              Policy Q&A
            </Badge>
            <Badge appearance="filled" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} size="small">
              AI-Powered
            </Badge>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className={styles.quickPrompts}>
          <Text size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground3, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
            Quick Actions
          </Text>
          {QUICK_PROMPTS.map((prompt, i) => (
            <Button
              key={i}
              className={styles.promptBtn}
              appearance="subtle"
              icon={prompt.icon}
              onClick={() => sendMessage(prompt.text)}
            >
              {prompt.text}
            </Button>
          ))}
        </div>

        {/* Capabilities */}
        <Card style={{ padding: 16, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
          <Text size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground3, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
            Capabilities
          </Text>
          {[
            '🔍 Track request status',
            '📋 Submit new requests',
            '📚 Policy information',
            '📄 Document guidance',
            '🔄 Eligibility checks',
            '📞 Escalation support',
          ].map((cap) => (
            <Text key={cap} size={200} style={{ display: 'block', padding: '3px 0', color: tokens.colorNeutralForeground2 }}>
              {cap}
            </Text>
          ))}
        </Card>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <Avatar
            name="PS"
            size={36}
            style={{ backgroundColor: tokens.colorBrandBackground }}
          />
          <div>
            <Text weight="semibold">Policy Servicing Assistant</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }} />
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Online</Text>
            </div>
          </div>
          <Button
            appearance="subtle"
            size="small"
            style={{ marginLeft: 'auto' }}
            onClick={() => setMessages([{
              id: 'welcome-new',
              role: 'agent',
              content: AGENT_RESPONSES.default,
              timestamp: new Date(),
            }])}
          >
            New Conversation
          </Button>
        </div>

        {/* Messages */}
        <div className={styles.chatMessages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : ''}`}
            >
              <Avatar
                name={msg.role === 'agent' ? 'PS' : 'You'}
                size={28}
                style={{ backgroundColor: msg.role === 'agent' ? tokens.colorBrandBackground : tokens.colorNeutralBackground4, flexShrink: 0, alignSelf: 'flex-start' }}
              />
              <div>
                <div
                  className={`${styles.messageContent} ${msg.role === 'agent' ? styles.agentMessage : styles.userMessage}`}
                >
                  {msg.role === 'agent' ? renderMessageContent(msg.content) : <Text>{msg.content}</Text>}
                </div>
                <Text className={styles.messageTime}>
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={styles.messageBubble}>
              <Avatar name="PS" size={28} style={{ backgroundColor: tokens.colorBrandBackground }} />
              <div className={styles.typingIndicator}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={styles.dot}
                    style={{ animationDelay: `${i * 0.16}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className={styles.suggestionsRow}>
          {SUGGESTIONS.map((s) => (
            <span
              key={s}
              className={styles.suggestion}
              onClick={() => sendMessage(s)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(s)}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <Input
            className={styles.inputField}
            placeholder="Ask anything about your policy or request..."
            value={inputValue}
            onChange={(_, d) => setInputValue(d.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputValue);
              }
            }}
            disabled={isTyping}
            aria-label="Chat input"
          />
          <Button
            appearance="primary"
            icon={<Send24Regular />}
            disabled={!inputValue.trim() || isTyping}
            onClick={() => sendMessage(inputValue)}
            aria-label="Send message"
          />
        </div>
      </div>
    </div>
  );
};
