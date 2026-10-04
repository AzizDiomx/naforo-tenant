import { useState, useEffect } from 'react';
import { Bell, ShieldCheck, X, CreditCard, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../../lib/api';

export default function TopHeader({ title = 'Naforo' }: { title?: string }) {
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    fetchApi('/tenant-portal/notifications')
      .then(res => {
        const list = Array.isArray(res) ? res : [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.isRead).length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetchApi(`/tenant-portal/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <>
      <header className="top-header">
        {/* Brand & Property status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#013E37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(1, 62, 55, 0.2)',
              overflow: 'hidden',
              padding: 4
            }}
          >
            <img
              src="/images/logo.png"
              alt="Naforo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                // Fallback in case of image load delay
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#013E37', letterSpacing: '-0.02em' }}>
              {title === 'Naforo' ? 'Naforo Locataire' : title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', color: '#64748b' }}>
              <ShieldCheck size={12} color="#059669" />
              <span>Espace Certifié · Chiffrement AES-256</span>
            </div>
          </div>
        </div>

        {/* Notifications Bell */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowNotifModal(true)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#013E37',
            position: 'relative',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <Bell size={18} color="#013E37" />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '0.625rem',
                fontWeight: '800',
                borderRadius: '50%',
                width: 17,
                height: 17,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}
            >
              {unreadCount}
            </span>
          )}
        </motion.button>
      </header>

      {/* NOTIFICATIONS MODAL / POPUP */}
      <AnimatePresence>
        {showNotifModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 64, paddingLeft: 16, paddingRight: 16 }}>
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              style={{
                width: '100%',
                maxWidth: 440,
                backgroundColor: '#ffffff',
                borderRadius: 20,
                padding: '20px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#013E37' }}>Mes Notifications</h3>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '0.6875rem', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <button onClick={() => setShowNotifModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* List */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    <Bell size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '0.85rem' }}>Aucune notification reçue pour le moment.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        backgroundColor: n.isRead ? '#ffffff' : '#f0fdf4',
                        border: `1px solid ${n.isRead ? '#f1f5f9' : '#bbf7d0'}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        backgroundColor: n.isRead ? '#f8fafc' : '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {n.type?.includes('PAYMENT') ? <CreditCard size={17} color="#d97706" /> : <Info size={17} color="#059669" />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <h4 style={{ fontSize: '0.825rem', fontWeight: n.isRead ? '600' : '800', color: '#0f172a' }}>{n.title}</h4>
                          <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                            {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' }}>{n.message}</p>
                      </div>

                      {!n.isRead && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669', flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
