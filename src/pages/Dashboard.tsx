import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calendar, ShieldCheck, FileText, Wrench, CheckCircle2, ChevronRight, X, Upload, Loader2, AlertCircle, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchApi, uploadApi } from '../lib/api';

export default function Dashboard() {
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'mtn_money' | 'wave' | 'bank_transfer' | 'cash'>('wave');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [monthsCount, setMonthsCount] = useState<number>(1);
  const [amount, setAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = () => {
    setLoading(true);
    fetchApi('/tenant-portal/me')
      .then(res => {
        setData(res);
        if (res.activeContract) {
          const single = Number(res.activeContract.rentAmount || 0) + Number(res.activeContract.chargesAmount || 0);
          setAmount(String(single * monthsCount));
        }
      })
      .catch(err => {
        setError(err.message || 'Impossible de charger vos informations locataire.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleMonthsChange = (newMonths: number) => {
    setMonthsCount(newMonths);
    if (data?.activeContract) {
      const monthlyTotal = Number(data.activeContract.rentAmount || 0) + Number(data.activeContract.chargesAmount || 0);
      setAmount(String(monthlyTotal * newMonths));
    }
  };

  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('paymentMethod', paymentMethod);
      formData.append('transactionNumber', transactionNumber);
      formData.append('monthsCount', String(monthsCount));
      formData.append('amount', amount || String(data?.activeContract?.rentAmount || 0));
      if (data?.dueInvoice?.id) formData.append('invoiceId', data.dueInvoice.id);
      if (file) formData.append('proof', file);

      await uploadApi('/tenant-portal/payments/declare', formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowPayModal(false);
        loadOverview();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la déclaration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={24} style={{ marginRight: 8, color: '#013E37' }} />
        <span>Chargement de votre Espace Locataire...</span>
      </div>
    );
  }

  const activeContract = data?.activeContract;
  const profile = data?.profile;
  const dueInvoice = data?.dueInvoice;
  const recentPayments = data?.recentPayments || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Welcome Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: '#013E37', margin: 0 }}>
            Bonjour, {profile?.firstName || 'Locataire'} 👋
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 3 }}>
            {activeContract ? `${activeContract.propertyName} · ${activeContract.propertyAddress}` : 'Aucun contrat actif rattaché.'}
          </p>
        </div>

        {profile?.reliabilityScore !== undefined && (
          <div style={{
            backgroundColor: profile.reliabilityScore >= 90 ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${profile.reliabilityScore >= 90 ? '#a7f3d0' : '#fde68a'}`,
            padding: '6px 12px',
            borderRadius: '12px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Fiabilité</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: profile.reliabilityScore >= 90 ? '#059669' : '#d97706' }}>
              {profile.reliabilityScore}/100
            </div>
          </div>
        )}
      </div>

      {/* Main Rent Due Card with Naforo Emerald Gradient */}
      {activeContract ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #013E37 0%, #03594F 50%, #059669 100%)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(1, 62, 55, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.85)', fontWeight: '700' }}>
                Loyer Mensuel Dû
              </span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.9rem', marginTop: 4, letterSpacing: '-0.02em', color: '#ffffff' }}>
                {(Number(activeContract.rentAmount || 0) + Number(activeContract.chargesAmount || 0)).toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#ffffff'
            }}>
              <Calendar size={13} />
              <span>Échéance le {activeContract.paymentDay || 5} du mois</span>
            </div>
          </div>

          {dueInvoice && (
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#ffffff' }}>Facture N° {dueInvoice.invoiceNumber}</span>
              <span style={{ fontWeight: '800', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem' }}>
                En attente de paiement
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                if (!dueInvoice) {
                  alert("Le loyer du mois en cours est déjà réglé. Merci de votre ponctualité !");
                } else {
                  setShowPayModal(true);
                }
              }}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                color: '#013E37',
                fontWeight: '800',
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }}
            >
              <CreditCard size={18} color="#013E37" /> Déclarer un règlement
            </button>
          </div>
        </motion.div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <AlertCircle size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
            Aucun contrat de bail actif
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Aucun bail n'est actuellement rattaché à votre compte. Contactez votre bailleur.
          </p>
        </div>
      )}

      {/* Quick Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <Link to="/receipts" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>Quittances</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Reçus certifiés</div>
            </div>
          </div>
        </Link>

        <Link to="/chat" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #a7f3d0',
            borderRadius: '16px',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(1, 62, 55, 0.05)',
            background: 'linear-gradient(180deg, #ffffff, #f0fdf4)'
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#013E37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#013E37' }}>Mon Bailleur</div>
              <div style={{ fontSize: '0.68rem', color: '#059669' }}>Messagerie direct</div>
            </div>
          </div>
        </Link>

        <Link to="/incidents" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <Wrench size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>Pannes</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Signalement</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Payments Section */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#013E37', margin: 0 }}>Derniers Règlements</h2>
          <Link to="/payments" style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            Voir tout <ArrowRight size={13} />
          </Link>
        </div>

        {recentPayments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.825rem' }}>
            Aucun paiement enregistré pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentPayments.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: p.status === 'validated' ? '#ecfdf5' : '#fffbeb', border: `1px solid ${p.status === 'validated' ? '#a7f3d0' : '#fde68a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={16} color={p.status === 'validated' ? '#059669' : '#d97706'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                      {Number(p.amount).toLocaleString()} FCFA
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      {p.paymentMethod?.replace('_', ' ')} · {new Date(p.paymentDate || p.createdAt).toLocaleDateString('fr-FR')}
                    </div>
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
                  {p.status === 'validated' ? 'Validé ✓' : p.status === 'rejected' ? 'Rejeté' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAYMENT DECLARATION MODAL */}
      <AnimatePresence>
        {showPayModal && (
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#013E37', margin: 0 }}>Déclarer un Règlement</h3>
                <button onClick={() => setShowPayModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {success ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#013E37' }}>Paiement transmis !</h4>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: 4 }}>
                    Votre bailleur a été notifié pour vérification et émission de votre quittance certifiée.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDeclare} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {data?.recentPayments?.some((p: any) => p.status === 'pending' || p.status === 'complement_requested') && (
                    <div style={{ padding: '12px', borderRadius: 12, backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong>Déclaration en cours d'examen</strong>
                        <p style={{ margin: 0, marginTop: 2, fontSize: '0.75rem' }}>
                          Vous avez déjà un versement en attente de vérification par votre bailleur.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Période couverte (Règlement / Avance)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {[
                        { label: '1 Mois', val: 1 },
                        { label: '2 Mois', val: 2 },
                        { label: '3 Mois', val: 3 },
                        { label: '6 Mois', val: 6 },
                      ].map(item => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleMonthsChange(item.val)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: 8,
                            border: `2px solid ${monthsCount === item.val ? '#013E37' : '#e2e8f0'}`,
                            backgroundColor: monthsCount === item.val ? '#ecfdf5' : '#ffffff',
                            color: monthsCount === item.val ? '#013E37' : '#475569',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Montant Versé (FCFA)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="150000"
                      required
                      className="form-input-mobile"
                      style={{ fontSize: '0.95rem', fontWeight: '700', color: '#013E37' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Moyen de Paiement
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {(['wave', 'orange_money', 'mtn_money', 'bank_transfer', 'cash'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          style={{
                            padding: '10px',
                            borderRadius: 10,
                            border: `2px solid ${paymentMethod === method ? '#013E37' : '#e2e8f0'}`,
                            backgroundColor: paymentMethod === method ? '#ecfdf5' : '#ffffff',
                            color: paymentMethod === method ? '#013E37' : '#475569',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {method.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Numéro de transaction / Référence
                    </label>
                    <input
                      type="text"
                      placeholder="ex: WV-992019 ou Référence MoMo"
                      value={transactionNumber}
                      onChange={e => setTransactionNumber(e.target.value)}
                      required
                      className="form-input-mobile"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
                      Preuve de Paiement (Capture d'écran ou reçu)
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', color: '#475569' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || data?.recentPayments?.some((p: any) => p.status === 'pending' || p.status === 'complement_requested')}
                    className="btn-primary-mobile"
                    style={{ marginTop: 8 }}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirmer et envoyer au bailleur'}
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
