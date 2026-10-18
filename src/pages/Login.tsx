import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Identifiants incorrects.');
      }

      // Store JWT token for tenant API calls
      const { accessToken, refreshToken, user } = data.data;

      // Verify that the user has tenant or appropriate access
      if (user.role !== 'tenant' && user.role !== 'admin' && user.role !== 'manager' && user.role !== 'owner' && user.role !== 'super_admin') {
        throw new Error('Accès réservé aux locataires Naforo.');
      }

      localStorage.setItem('tenant_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('tenant_refresh_token', refreshToken);
      }
      localStorage.setItem('tenant_user', JSON.stringify(user));

      // Redirect to tenant mobile dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Impossible de se connecter au serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingTop: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', backgroundColor: '#f8fafc' }}>
      
      {/* Brand Header */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          backgroundColor: '#013E37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(1, 62, 55, 0.25)',
          padding: 8
        }}>
          <img
            src="/images/logo.png"
            alt="Naforo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.65rem', color: '#013E37', letterSpacing: '-0.02em', margin: 0 }}>
          Espace Locataire
        </h1>
        <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>
          Connectez-vous pour régler vos loyers, télécharger vos quittances et dialoguer avec votre propriétaire.
        </p>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 20,
            color: '#dc2626',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Login Card */}
      <form onSubmit={handleLogin} style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        padding: 24
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
            ADRESSE EMAIL DU LOCATAIRE
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.ci"
              required
              className="form-input-mobile"
              style={{ paddingLeft: 42 }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
            MOT DE PASSE
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="form-input-mobile"
              style={{ paddingLeft: 42, paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
          <Link
            to="/forgot-password"
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#059669',
              textDecoration: 'none'
            }}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary-mobile"
          style={{ marginTop: 4 }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <>Accéder à mon Espace <ArrowRight size={16} /></>}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem', color: '#64748b' }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Connexion sécurisée · Certificat SSL 256 bits</span>
        </div>
      </form>

      {/* Footer Support Info */}
      <div style={{ textAlign: 'center', marginTop: 28, fontSize: '0.75rem', color: '#94a3b8' }}>
        Naforo &bull; Plateforme intelligente de gestion locative
      </div>
    </div>
  );
}
