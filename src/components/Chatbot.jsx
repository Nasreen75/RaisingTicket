import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const Chatbot = () => {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am MITS Campus AI Assistant 🤖\nAsk me anything in English or తెలుగు regarding campus Wi-Fi, hostel hot water, bus routes, fee receipts, or submit an anonymous complaint.',
      suggestCategory: null,
      canCreateTicket: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text });
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data.reply,
        suggestCategory: res.data.suggestCategory,
        canCreateTicket: res.data.canCreateTicket,
        isSensitive: res.data.isSensitive,
        userQuery: text,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I'm having trouble connecting right now, but you can always raise a complaint ticket directly!",
          suggestCategory: 'other',
          canCreateTicket: true,
          userQuery: text,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicketFromBot = (msg) => {
    setIsOpen(false);
    navigate('/raise-complaint', {
      state: {
        prefillCategory: msg.suggestCategory || 'other',
        prefillTitle: msg.userQuery ? msg.userQuery.slice(0, 80) : '',
      },
    });
  };

  return (
    <>
      {/* Floating Animated Robot Icon Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.floatingButton}
        title="Open MITS Campus AI Assistant"
      >
        <div style={styles.botIconWrapper}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Robot Head */}
            <rect x="3" y="11" width="18" height="10" rx="3" fill="#ffffff" fillOpacity="0.2" />
            <circle cx="12" cy="5" r="2.5" fill="#ffffff" />
            <path d="M12 7.5v3.5" />
            {/* Eyes */}
            <circle cx="8.5" cy="15" r="1.5" fill="#ffffff" />
            <circle cx="15.5" cy="15" r="1.5" fill="#ffffff" />
            {/* Mouth */}
            <line x1="8.5" y1="18.5" x2="15.5" y2="18.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Ears */}
            <line x1="1" y1="15" x2="3" y2="15" />
            <line x1="21" y1="15" x2="23" y2="15" />
          </svg>
        </div>
        <span style={{ fontWeight: '800', letterSpacing: '0.4px', fontSize: '15px' }}>
          {isOpen ? '✕ Close Bot' : '🤖 AI Assistant'}
        </span>
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header with Diagrammatic AI Architecture Graphic */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={styles.headerAvatar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8" y2="16" />
                  <line x1="16" y1="16" x2="16" y2="16" />
                </svg>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: '900', letterSpacing: '0.2px' }}>
                  {t('chatTitle')}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={styles.onlineDot} />
                  <span style={{ fontSize: '11.5px', color: '#fecaca', fontWeight: '600' }}>
                    Online &bull; NLP Semantic Classifier Active
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              ✕
            </button>
          </div>

          {/* AI Diagram Card showing workflow */}
          <div style={styles.architectureDiagramBox}>
            <div style={styles.diagramStep}>
              <span style={{ fontSize: '14px' }}>💬</span>
              <span>Ask Query</span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>&rarr;</span>
            <div style={styles.diagramStep}>
              <span style={{ fontSize: '14px' }}>🧠</span>
              <span>NLP Match</span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>&rarr;</span>
            <div style={styles.diagramStep}>
              <span style={{ fontSize: '14px' }}>🚀</span>
              <span>Auto-Ticket</span>
            </div>
          </div>

          <div style={styles.messagesContainer}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  ...styles.messageRow,
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {m.sender === 'bot' && (
                  <div style={styles.msgAvatar}>🤖</div>
                )}
                <div
                  style={{
                    ...styles.messageBubble,
                    background: m.sender === 'user' ? '#c1121f' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : '#1f2937',
                    border: m.sender === 'bot' ? '1.5px solid #e2e8f0' : 'none',
                    borderBottomRightRadius: m.sender === 'user' ? '3px' : '16px',
                    borderBottomLeftRadius: m.sender === 'bot' ? '3px' : '16px',
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '13.5px' }}>
                    {m.text}
                  </p>

                  {/* Sensitive issue anonymous prompt */}
                  {m.isSensitive && (
                    <div style={styles.sensitiveAlertBox}>
                      🛡️ <strong>Safety Protected:</strong> You can file this with identity encryption enabled.
                    </div>
                  )}

                  {/* Option to convert query into ticket */}
                  {m.canCreateTicket && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => handleCreateTicketFromBot(m)}
                        style={styles.createTicketBtn}
                      >
                        📝 Convert to Helpdesk Ticket →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                <div style={styles.msgAvatar}>🤖</div>
                <div style={{ ...styles.messageBubble, background: '#ffffff', color: '#6b7280', border: '1.5px solid #e2e8f0' }}>
                  Processing with Campus NLP Engine... ⚡
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} style={styles.inputArea}>
            <input
              type="text"
              placeholder={t('chatPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.chatInput}
            />
            <button type="submit" disabled={!input.trim() || loading} style={styles.sendBtn}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: 'linear-gradient(135deg, #c1121f 0%, #8b0a14 100%)',
    color: '#ffffff',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '999px',
    padding: '12px 22px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 8px 28px rgba(193,18,31,0.45)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
  },
  botIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '88px',
    right: '24px',
    width: '390px',
    maxWidth: 'calc(100vw - 32px)',
    height: '540px',
    maxHeight: 'calc(100vh - 110px)',
    background: '#ffffff',
    borderRadius: '18px',
    boxShadow: '0 16px 44px rgba(0,0,0,0.3)',
    border: '1.5px solid #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9999,
  },
  header: {
    background: '#c1121f',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  headerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    fontWeight: 'bold',
  },
  architectureDiagramBox: {
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diagramStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155',
    background: '#ffffff',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  messagesContainer: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    background: '#f1f5f9',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'flex-end',
    gap: '8px',
  },
  msgAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
    marginBottom: '2px',
  },
  messageBubble: {
    maxWidth: '82%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '13.5px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  sensitiveAlertBox: {
    background: '#fef2f2',
    color: '#991b1b',
    padding: '8px 10px',
    borderRadius: '8px',
    fontSize: '11.5px',
    marginTop: '8px',
    border: '1px solid #fecaca',
  },
  createTicketBtn: {
    background: '#c1121f',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(193,18,31,0.25)',
  },
  inputArea: {
    padding: '12px 14px',
    borderTop: '1px solid #e2e8f0',
    background: '#ffffff',
    display: 'flex',
    gap: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '11px 16px',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '13.5px',
    outline: 'none',
  },
  sendBtn: {
    background: '#c1121f',
    color: '#ffffff',
    border: 'none',
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(193,18,31,0.3)',
  },
};

export default Chatbot;
