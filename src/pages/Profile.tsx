import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Award, LogOut, ShieldCheck, FileText, Loader2, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/tenant-portal/me')
      .then(res => {
        setProfile(res.profile);
        setContract(res.activeContract);
      })
      .catch(err => console.log('Erreur profil:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={24} style={{ marginRight: 8, color: '#013E37' }} />
        <span>Chargement de votre carnet numérique...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: '#013E37', margin: 0 }}>
          Carnet Numérique
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 3 }}>
          Profil, contrat en vigueur et score de réputation certifié.
        </p>
      </div>

      {/* Main Profile Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          backgroundColor: '#013E37',
          border: '2px solid #059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          marginBottom: 12,
          boxShadow: '0 4px 14px rgba(1, 62, 55, 0.25)',
          fontSize: '1.5rem',
          fontWeight: '800'
        }}>
          {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : <User size={34} />}
        </div>

        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#013E37', margin: 0 }}>
          {profile?.firstName} {profile?.lastName}
        </h2>
        <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
          Locataire Certifié Naforo &bull; ID : {profile?.id?.slice(0, 8)}
        </span>

        {/* Reliability badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          padding: '6px 14px',
          borderRadius: 20,
          marginTop: 14,
          fontSize: '0.8rem',
          fontWeight: '700',
          color: '#047857'
        }}>
          <Award size={16} color="#059669" />
          <span>Score de Fiabilité : {profile?.reliabilityScore ?? 100}/100</span>
        </div>
      </div>

      {/* Contact Details Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#013E37', margin: 0 }}>
          Coordonnées de Contact
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.825rem', color: '#475569' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#013E37' }}>
            <Mail size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Email</div>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>{profile?.email || 'Non renseigné'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.825rem', color: '#475569' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#013E37' }}>
            <Phone size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Téléphone</div>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>{profile?.phone || 'Non renseigné'}</div>
          </div>
        </div>
      </div>

      {/* Active Lease Contract Summary */}
      {contract && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#013E37', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={16} color="#059669" /> Bail en Vigueur
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Logement</span>
              <p style={{ fontWeight: '700', color: '#0f172a', margin: '2px 0 0 0' }}>{contract.propertyName}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Échéance</span>
              <p style={{ fontWeight: '700', color: '#0f172a', margin: '2px 0 0 0' }}>Le {contract.paymentDay || 5} du mois</p>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Loyer mensuel</span>
              <p style={{ fontWeight: '800', color: '#059669', margin: '2px 0 0 0' }}>{Number(contract.rentAmount).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Statut</span>
              <p style={{ fontWeight: '700', color: '#059669', margin: '2px 0 0 0' }}>Actif ✓</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Action Button */}
      <button
        onClick={handleLogout}
        className="btn-secondary-mobile"
        style={{
          color: '#dc2626',
          border: '1px solid #fecaca',
          backgroundColor: '#fff',
          marginTop: 6
        }}
      >
        <LogOut size={16} color="#dc2626" />
        Déconnexion de mon compte
      </button>
    </div>
  );
}
