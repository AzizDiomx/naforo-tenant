import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, CreditCard, Loader2, AlertCircle, Upload, Eye, FileText, ArrowRight } from 'lucide-react';
import { fetchApi, uploadApi, getFileUrl } from '../lib/api';

export default function Payments() {
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadPayments = () => {
    setLoading(true);
    fetchApi('/tenant-portal/payments')
      .then(res => setPayments(Array.isArray(res) ? res : []))
      .catch(err => console.log('Erreur chargement paiements:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleUploadProof = async (paymentId: string, file: File) => {
    setUploadingId(paymentId);
    try {
      const formData = new FormData();
      formData.append('proof', file);

      await uploadApi(`/tenant-portal/payments/${paymentId}/proof`, formData);
      alert('Justificatif transmis avec succès au propriétaire !');
      loadPayments();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du téléversement du justificatif.');
    } finally {
      setUploadingId(null);
    }
  };

  const filtered = tab === 'all' ? payments : payments.filter(p => p.status === 'pending');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={24} style={{ marginRight: 8, color: '#013E37' }} />
        <span>Chargement de vos règlements...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: '#013E37', margin: 0 }}>
          Historique & Règlements
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 3 }}>
          Transmettez et suivez vos preuves de paiement certifiées (Wave, Orange, MTN, Moov).
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: '#ffffff', padding: 4, borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setTab('all')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: tab === 'all' ? '#013E37' : 'transparent',
            color: tab === 'all' ? '#ffffff' : '#64748b',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Tous ({payments.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: tab === 'pending' ? '#013E37' : 'transparent',
            color: tab === 'pending' ? '#ffffff' : '#64748b',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          En attente ({payments.filter(p => p.status === 'pending').length})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '36px 20px',
          textAlign: 'center'
        }}>
          <CreditCard size={36} color="#cbd5e1" style={{ marginBottom: 10 }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
            Aucun paiement trouvé
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {tab === 'pending' ? 'Vous n\'avez aucun règlement en cours de vérification.' : 'Vos règlements déclarés s\'afficheront ici.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((p, idx) => (
            <motion.div
              key={p.id || idx}
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
                gap: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: p.status === 'validated' ? '#ecfdf5' : '#fffbeb',
                    border: `1px solid ${p.status === 'validated' ? '#a7f3d0' : '#fde68a'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: p.status === 'validated' ? '#059669' : '#d97706'
                  }}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#013E37', margin: 0 }}>
                      {Number(p.amount).toLocaleString('fr-FR')} FCFA
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      {p.paymentMethod?.replace('_', ' ')} · Ref: {p.transactionNumber || p.paymentReference || 'N/A'}
                    </p>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  backgroundColor: p.status === 'validated' ? '#ecfdf5' : p.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                  color: p.status === 'validated' ? '#059669' : p.status === 'rejected' ? '#dc2626' : '#d97706',
                  border: `1px solid ${p.status === 'validated' ? '#a7f3d0' : p.status === 'rejected' ? '#fecaca' : '#fde68a'}`
                }}>
                  {p.status === 'validated' ? 'Validé ✓' : p.status === 'rejected' ? 'Rejeté' : 'En examen'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10, fontSize: '0.75rem', color: '#64748b' }}>
                <span>Date : {new Date(p.paymentDate || p.createdAt).toLocaleDateString('fr-FR')}</span>

                {p.proofUrl ? (
                  <a
                    href={getFileUrl(p.proofUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#059669',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    <Eye size={13} /> Justificatif joint
                  </a>
                ) : (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#013E37',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}>
                    <Upload size={13} />
                    <span>{uploadingId === p.id ? 'Envoi...' : 'Ajouter un reçu'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && handleUploadProof(p.id, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
