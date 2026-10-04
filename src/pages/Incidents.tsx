import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Plus, AlertCircle, CheckCircle2, Clock, X, Upload, Loader2 } from 'lucide-react';
import { fetchApi } from '../lib/api';

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('plumbing');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadIncidents = () => {
    setLoading(true);
    fetchApi('/tenant-portal/incidents')
      .then(res => setIncidents(Array.isArray(res) ? res : []))
      .catch(err => console.log('Erreur chargement incidents:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchApi('/tenant-portal/incidents', {
        method: 'POST',
        body: JSON.stringify({ title, type, description, priority }),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
        setTitle('');
        setDescription('');
        loadIncidents();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du signalement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={24} style={{ marginRight: 8, color: '#013E37' }} />
        <span>Chargement des réclamations & pannes...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: '#013E37', margin: 0 }}>
            Incidents & Travaux
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 3 }}>
            Signalez une anomalie technique ou suivez l'avancement des réparations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            backgroundColor: '#013E37',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '0.8rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 8px rgba(1, 62, 55, 0.25)'
          }}
        >
          <Plus size={16} /> Signaler
        </button>
      </div>

      {incidents.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <Wrench size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: 4 }}>
            Aucun incident signalé
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Tout est en ordre dans votre logement ! En cas de fuite, panne ou réparation, utilisez le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {incidents.map((inc, idx) => (
            <motion.div
              key={inc.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: inc.status === 'resolved' ? '#ecfdf5' : inc.priority === 'urgent' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${inc.status === 'resolved' ? '#a7f3d0' : inc.priority === 'urgent' ? '#fecaca' : '#fde68a'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: inc.status === 'resolved' ? '#059669' : inc.priority === 'urgent' ? '#dc2626' : '#d97706'
                  }}>
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#013E37', margin: 0 }}>
                      {inc.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      Catégorie : {inc.type} · Ref: {inc.incidentNumber || inc.id?.slice(0, 8)}
                    </p>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  backgroundColor: inc.status === 'resolved' ? '#ecfdf5' : inc.status === 'in_progress' ? '#eff6ff' : '#fffbeb',
                  color: inc.status === 'resolved' ? '#059669' : inc.status === 'in_progress' ? '#1d4ed8' : '#d97706',
                  border: `1px solid ${inc.status === 'resolved' ? '#a7f3d0' : inc.status === 'in_progress' ? '#bfdbfe' : '#fde68a'}`
                }}>
                  {inc.status === 'resolved' ? 'Résolu ✓' : inc.status === 'in_progress' ? 'En cours' : 'Ouvert'}
                </span>
              </div>

              {inc.description && (
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.4', margin: 0, padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  {inc.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                <span>Déclaré le {new Date(inc.createdAt).toLocaleDateString('fr-FR')}</span>
                <span style={{ fontWeight: '700', color: inc.priority === 'urgent' ? '#dc2626' : '#64748b' }}>
                  Priorité : {inc.priority?.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* REPORT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                width: '100%',
                maxWidth: 480,
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: '24px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#013E37', margin: 0 }}>Signaler un Incident</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {success ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#013E37' }}>Incident transmis !</h4>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: 4 }}>
                    Votre bailleur a été alerté immédiatement pour planification des réparations.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Intitulé de l'incident *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Fuite robinet salle de bain"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      className="form-input-mobile"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Catégorie de Panne
                    </label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="form-input-mobile"
                    >
                      <option value="plumbing">Plomberie & Fuite d'eau</option>
                      <option value="electricity">Électricité & Disjoncteur</option>
                      <option value="ac">Climatisation & Ventilation</option>
                      <option value="security">Serrure & Sécurité</option>
                      <option value="breakdown">Équipement ménager</option>
                      <option value="other">Autre demande</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Degré d'Urgence
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {[
                        { id: 'low', label: 'Faible', color: '#64748b' },
                        { id: 'medium', label: 'Moyen', color: '#d97706' },
                        { id: 'urgent', label: 'Urgent', color: '#dc2626' }
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPriority(p.id)}
                          style={{
                            padding: '10px',
                            borderRadius: 10,
                            border: `2px solid ${priority === p.id ? p.color : '#e2e8f0'}`,
                            backgroundColor: priority === p.id ? '#f8fafc' : '#ffffff',
                            color: priority === p.id ? p.color : '#64748b',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Description détaillée des constatations
                    </label>
                    <textarea
                      placeholder="Précisez la pièce, l'étendue du problème..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      className="form-input-mobile"
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary-mobile"
                    style={{ marginTop: 8 }}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Transmettre le signalement'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
