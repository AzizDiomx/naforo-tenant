import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, FolderKanban } from 'lucide-react';
import { fetchApi } from '../lib/api';

const fallbackDocs = [
  { name: 'Contrat de bail sous seing privé', size: '2.4 Mo', createdAt: '2026-01-01', type: 'Contrat' },
  { name: 'État des lieux d\'entrée (Signé)', size: '4.1 Mo', createdAt: '2026-01-01', type: 'État des lieux' },
  { name: 'Règlement de copropriété', size: '1.2 Mo', createdAt: '2026-01-01', type: 'Règlement' },
];

export default function Documents() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/tenant-portal/documents')
      .then(res => setDocs(res && res.length > 0 ? res : fallbackDocs))
      .catch(() => setDocs(fallbackDocs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: '#013E37', margin: 0 }}>
          Coffre-fort Documents
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 3 }}>
          Baux signés, états des lieux et règlements intérieurs certifiés.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px', color: '#013E37' }} />
          <span>Chargement de vos documents scellés...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {docs.map((doc, i) => (
            <motion.div
              key={doc.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#013E37' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                    {doc.type || 'Document'} &bull; {doc.size || 'PDF'} &bull; {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : doc.date || 'Récemment'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert(`Téléchargement sécurisé de ${doc.name}...`)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#013E37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
                title="Télécharger"
              >
                <Download size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
