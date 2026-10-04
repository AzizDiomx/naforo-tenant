import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Criteria for password strength
  const criteria = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    };
  }, [newPassword]);

  const passwordScore = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (criteria.length) score += 1;
    if (criteria.uppercase && criteria.lowercase) score += 1;
    if (criteria.number) score += 1;
    if (criteria.special) score += 1;
    return score;
  }, [newPassword, criteria]);

  const strengthLabel = useMemo(() => {
    if (!newPassword) return { text: 'Non renseigné', color: '#64748B', width: '0%' };
    switch (passwordScore) {
      case 1:
        return { text: 'Très faible', color: '#EF4444', width: '25%' };
      case 2:
        return { text: 'Moyen', color: '#F59E0B', width: '50%' };
      case 3:
        return { text: 'Robuste', color: '#3B82F6', width: '75%' };
      case 4:
        return { text: 'Excellente sécurité', color: '#059669', width: '100%' };
      default:
        return { text: 'Insuffisant', color: '#EF4444', width: '15%' };
    }
  }, [newPassword, passwordScore]);

  // Request OTP token
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de la demande.");
      }

      setSuccess("Un code de vérification à 6 chiffres (OTP) vous a été envoyé par email. Ce code est valable 15 minutes.");
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Impossible de joindre le serveur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP token
  const handleResendOtp = async () => {
    if (!email.trim() || resending) return;
    setResending(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors du renvoi du code.');

      setSuccess('Un nouveau code de sécurité vous a été envoyé par email.');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code.');
    } finally {
      setResending(false);
    }
  };

  // Reset password with OTP token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token.trim() || token.trim().length !== 6) {
      setError('Veuillez renseigner le code de vérification à 6 chiffres reçu par email.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    if (passwordScore < 4) {
      setError('Le mot de passe doit respecter toutes les règles de sécurité (au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: token.trim(),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Code invalide ou expiré.');
      }

      setSuccess('Votre mot de passe a été réinitialisé avec succès ! Redirection vers la page de connexion...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Le code saisi est invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', backgroundColor: '#f8fafc' }}>
      
      {/* Brand Header */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: '#013E37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: '0 8px 24px rgba(1, 62, 55, 0.25)',
          padding: 8
        }}>
          <img
            src="/images/logo.png"
            alt="Naforo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#013E37', letterSpacing: '-0.02em', margin: 0 }}>
          {step === 'request' ? 'Mot de passe oublié ?' : 'Nouveau mot de passe'}
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>
          {step === 'request'
            ? 'Saisissez votre adresse email pour recevoir votre code de vérification à 6 chiffres.'
            : `Entrez le code reçu à l'adresse ${email} et votre nouveau mot de passe.`}
        </p>
      </motion.div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
            color: '#dc2626',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
            color: '#047857',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </motion.div>
      )}

      {/* STEP 1: DEMANDE DE CODE OTP */}
      {step === 'request' ? (
        <form onSubmit={handleRequestOtp} style={{
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
              ADRESSE EMAIL ENREGISTRÉE
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
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
            <p style={{ fontSize: '0.725rem', color: '#94A3B8', marginTop: 4, margin: '4px 0 0 0' }}>
              L'adresse associée à votre bail ou contrat de location.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-mobile"
            style={{ marginTop: 6 }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Envoyer le code de vérification <ArrowRight size={16} /></>}
          </button>

          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8125rem',
                color: '#013E37',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </div>
        </form>
      ) : (
        /* STEP 2: SAISIE CODE OTP & NOUVEAU MOT DE PASSE */
        <form onSubmit={handleResetPassword} style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 24
        }}>
          {/* OTP Code */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                CODE DE VÉRIFICATION (6 CHIFFRES) *
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  fontSize: '0.725rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {resending ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                Renvoyer le code
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <KeyRound size={18} />
              </div>
              <input
                type="text"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="form-input-mobile"
                style={{
                  paddingLeft: 42,
                  letterSpacing: '6px',
                  fontFamily: 'monospace',
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  textAlign: 'left',
                  color: '#013E37'
                }}
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              NOUVEAU MOT DE PASSE *
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 caractères"
                required
                className="form-input-mobile"
                style={{ paddingLeft: 42, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength Meter */}
            {newPassword && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#64748B' }}>Robustesse :</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: '800', color: strengthLabel.color }}>{strengthLabel.text}</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: strengthLabel.width, height: '100%', backgroundColor: strengthLabel.color, transition: 'all 0.2s ease' }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              CONFIRMER LE MOT DE PASSE *
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                className="form-input-mobile"
                style={{ paddingLeft: 42, paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: '0.725rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ color: criteria.length ? '#059669' : '#64748B', fontWeight: criteria.length ? '700' : '400' }}>
              {criteria.length ? '✓' : '•'} Au moins 8 caractères
            </div>
            <div style={{ color: (criteria.uppercase && criteria.lowercase) ? '#059669' : '#64748B', fontWeight: (criteria.uppercase && criteria.lowercase) ? '700' : '400' }}>
              {(criteria.uppercase && criteria.lowercase) ? '✓' : '•'} Une majuscule (A-Z) & une minuscule (a-z)
            </div>
            <div style={{ color: criteria.number ? '#059669' : '#64748B', fontWeight: criteria.number ? '700' : '400' }}>
              {criteria.number ? '✓' : '•'} Au moins un chiffre (0-9)
            </div>
            <div style={{ color: criteria.special ? '#059669' : '#64748B', fontWeight: criteria.special ? '700' : '400' }}>
              {criteria.special ? '✓' : '•'} Au moins un caractère spécial (@, $, !, %, *, ?)
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-mobile"
            style={{ marginTop: 4 }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Valider le nouveau mot de passe'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setStep('request')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <ArrowLeft size={14} /> Changer d'email
            </button>

            <Link
              to="/login"
              style={{
                fontSize: '0.78rem',
                color: '#013E37',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              Annuler
            </Link>
          </div>
        </form>
      )}

      {/* Security info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, fontSize: '0.75rem', color: '#64748b' }}>
        <ShieldCheck size={14} color="#059669" />
        <span>Protection contre les fraudes &bull; Chiffrement SSL 256 bits</span>
      </div>
    </div>
  );
}
