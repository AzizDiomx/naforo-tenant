import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ShieldCheck, Loader2 } from 'lucide-react';
import { fetchApi, getFileUrl } from '../lib/api';

export default function Receipts() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApi('/tenant-portal/receipts')
      .then(res => setReceipts(Array.isArray(res) ? res : []))
      .catch(err => setError(err.message || 'Impossible de charger vos quittances.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={24} style={{ marginRight: 8, color: '#013E37' }} />
        <span>Chargement de vos quittances officielles...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: '#013E37', margin: 0 }}>
          Quittances Certifiées
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 3 }}>
          Téléchargez vos reçus officiels avec horodatage probant et QR Code sécurisé.
        </p>
      </div>

      {receipts.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <FileText size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: 4 }}>
            Aucune quittance disponible
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Dès que vos règlements seront validés par votre propriétaire, vos quittances officielles au format PDF apparaîtront ici.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {receipts.map((r, idx) => (
            <motion.div
              key={r.id || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#013E37', margin: 0 }}>
                      Quittance N° {r.receiptNumber || r.receipt_number || 'N/A'}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
                      Période : {r.periodMonth || r.period_month}/{r.periodYear || r.period_year}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#059669' }}>
                    {Number(r.amount).toLocaleString('fr-FR')} FCFA
                  </div>
                  <span style={{ fontSize: '0.6875rem', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'inline-block', marginTop: 3 }}>
                    Certifié ✓
                  </span>
                </div>
              </div>

              {/* QR Code & Certification Line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 12, fontSize: '0.75rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} color="#059669" />
                  <span>Horodatage SHA-256</span>
                </div>

                {r.pdfUrl ? (
                  <a
                    href={getFileUrl(r.pdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 10,
                      backgroundColor: '#013E37',
                      color: '#ffffff',
                      fontWeight: '700',
                      textDecoration: 'none',
                      fontSize: '0.78rem',
                      boxShadow: '0 2px 6px rgba(1, 62, 55, 0.2)'
                    }}
                  >
                    <Download size={14} /> Télécharger PDF
                  </a>
                ) : (
                  <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>PDF en cours de génération</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
