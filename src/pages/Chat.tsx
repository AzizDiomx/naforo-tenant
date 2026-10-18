import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Loader2, Lock, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi, API_ORIGIN } from '../lib/api';
import { io, Socket } from 'socket.io-client';

export default function Chat() {
  const navigate = useNavigate();
  const [thread, setThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const threadRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const token = localStorage.getItem('tenant_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // 1. Initialize WebSocket Connection
    const socket = io(API_ORIGIN, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Chat WebSocket connecté');
      if (threadRef.current?.id) {
        socket.emit('chat:join_thread', threadRef.current.id);
      }
    });

    socket.on('chat:message', (data: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      setTimeout(scrollToBottom, 100);
    });

    socket.on('chat:message_updated', (data: any) => {
      setMessages(prev =>
        prev.map(m => (m.id === data.messageId ? { ...m, content: data.content } : m))
      );
    });

    socket.on('chat:message_deleted', (data: any) => {
      setMessages(prev => prev.filter(m => m.id !== data.messageId));
    });

    // 2. Fetch tenant chat thread & messages history
    fetchApi('/chat/tenant-thread')
      .then(res => {
        setThread(res);
        threadRef.current = res;
        if (socketRef.current) {
          socketRef.current.emit('chat:join_thread', res.id);
        }
        return fetchApi(`/chat/threads/${res.id}/messages`);
      })
      .then(msgs => {
        setMessages(msgs);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      })
      .catch(err => {
        console.error('Erreur chargement tchat:', err);
        setLoading(false);
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !thread || sending) return;

    const messageText = input.trim();
    setInput('');
    setSending(true);

    try {
      if (editingMessageId) {
        await fetchApi(`/chat/messages/${editingMessageId}`, {
          method: 'PUT',
          body: JSON.stringify({ content: messageText }),
        });
        setEditingMessageId(null);
      } else {
        const sentMsg = await fetchApi(`/chat/threads/${thread.id}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content: messageText }),
        });

        setMessages(prev => {
          if (prev.some(m => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    try {
      await fetchApi(`/chat/messages/${msgId}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error('Erreur suppression message:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={24} style={{ marginRight: 8, color: '#013E37' }} />
        <span>Connexion au canal sécurisé...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 12 }}>
      {/* Chat Header */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            backgroundColor: '#013E37',
            border: '2px solid #059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#013E37', margin: 0 }}>
              Messagerie Bailleur
            </h2>
            <span style={{ fontSize: '0.725rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, fontWeight: '700' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              Canal Sécurisé (AES-256)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#047857', fontSize: '0.75rem', backgroundColor: '#ecfdf5', padding: '6px 12px', borderRadius: 20, border: '1px solid #a7f3d0', fontWeight: '700' }}>
          <Lock size={13} color="#059669" />
          Chiffré
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: '0.85rem' }}>
            <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
            <p>Aucun message. Posez votre première question à votre propriétaire ou gestionnaire.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderRole === 'tenant';
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;

            const isSameAsPrev = prevMsg && (prevMsg.senderRole === msg.senderRole);
            const isSameAsNext = nextMsg && (nextMsg.senderRole === msg.senderRole);

            let bubbleRadius = isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px';
            if (isSameAsPrev && isSameAsNext) {
              bubbleRadius = isMe ? '18px 4px 4px 18px' : '4px 18px 18px 4px';
            } else if (isSameAsPrev && !isSameAsNext) {
              bubbleRadius = isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px';
            } else if (!isSameAsPrev && isSameAsNext) {
              bubbleRadius = isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px';
            }

            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  marginTop: isSameAsPrev ? '3px' : '12px',
                  position: 'relative'
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: bubbleRadius,
                  backgroundColor: isMe ? '#013E37' : '#ffffff',
                  color: isMe ? '#ffffff' : '#0f172a',
                  border: isMe ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  fontSize: '0.875rem',
                  lineHeight: '1.45',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
                {!isSameAsNext && (
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 3, padding: '0 4px' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                
                {/* Actions: Edit / Delete */}
                {isMe && hoveredMessageId === msg.id && (
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    right: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    gap: 4,
                    zIndex: 10,
                    border: '1px solid #e2e8f0'
                  }}>
                    <button
                      onClick={() => {
                        setEditingMessageId(msg.id);
                        setInput(msg.content);
                      }}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: 4 }}
                      title="Modifier"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {editingMessageId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#047857', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #a7f3d0' }}>
            <Edit2 size={14} />
            <span>Modification en cours</span>
            <button 
              onClick={() => { setEditingMessageId(null); setInput(''); }} 
              style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Écrivez votre message..."
            className="form-input-mobile"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            style={{
              padding: '0 18px',
              backgroundColor: '#013E37',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(1, 62, 55, 0.25)',
              opacity: !input.trim() || sending ? 0.6 : 1
            }}
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
