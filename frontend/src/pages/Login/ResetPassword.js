import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Login.css';
import logo from '../../assets/logo2.png';

import usePasswordToggle from '../../hooks/usePasswordToggle';

const ResetPassword = () => {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ nouveau: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const [pwdType,     PwdToggle]     = usePasswordToggle();
  const [confirmType, ConfirmToggle] = usePasswordToggle();

  const validate = () => {
    if (form.nouveau.length < 12)
      return 'Le mot de passe doit contenir au moins 12 caractères.';
    if (!/[A-Z]/.test(form.nouveau))
      return 'Au moins une majuscule requise.';
    if (!/[a-z]/.test(form.nouveau))
      return 'Au moins une minuscule requise.';
    if (!/[0-9]/.test(form.nouveau))
      return 'Au moins un chiffre requis.';
    if (!/[^A-Za-z0-9]/.test(form.nouveau))
      return 'Au moins un caractère spécial requis (ex : !@#$).';
    if (form.nouveau !== form.confirm)
      return 'Les deux mots de passe ne correspondent pas.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword({ token, nouveau_mot_de_passe: form.nouveau });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Lien invalide ou expiré. Faites une nouvelle demande.');
    } finally {
      setLoading(false);
    }
  };

  // 5 critères → 5 barres
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 12)           score++;
    if (/[A-Z]/.test(pwd))          score++;
    if (/[a-z]/.test(pwd))          score++;
    if (/[0-9]/.test(pwd))          score++;
    if (/[^A-Za-z0-9]/.test(pwd))   score++;
    return score;
  };
  const strength = getStrength(form.nouveau);
  const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Bon', 'Fort'];
  const strengthColor = ['', '#dc2626', '#dc2626', '#d97706', '#059669', '#059669'];
 
  return (
    <div className="login-page">
      <div className="login-circle login-circle-1"></div>
      <div className="login-circle login-circle-2"></div>

      <div className="login-card">
      <div className="login-logo">
          <img src={logo} alt="Logo" className="login-logo-img" />
      </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1rem', marginBottom: 8, fontFamily: 'var(--mono)' }}>Mot de passe modifié</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Redirection vers la page de connexion dans quelques secondes…
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--mono)' }}>
              Nouveau mot de passe
            </h2>
            <p className="login-subtitle">Choisissez un mot de passe sécurisé pour votre compte.</p>
 
            {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
 
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                <input
                  type={pwdType}
                  className="form-control"
                  placeholder="••••••••••••"
                  value={form.nouveau}
                  onChange={e => setForm(f => ({ ...f, nouveau: e.target.value }))}
                  autoFocus
                />
                  <PwdToggle />
                </div>

                {form.nouveau && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength ? strengthColor[strength] : '#e2e8f0',
                          transition: 'background 0.2s'
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: strengthColor[strength] }}>
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
                <span className="form-hint" style={{ marginTop: 4, display: 'block' }}>
                  12 caractères min., majuscule, minuscule, chiffre, caractère spécial
                </span>
              </div>
 
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Confirmer le mot de passe</label>
                <div style={{ position: 'relative' }}>
                <input
                  type={confirmType}
                  className="form-control"
                  placeholder="••••••••••••"
                  style={{ paddingRight: 40 }}
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                />
                <ConfirmToggle />
                </div>
                {form.confirm && form.nouveau !== form.confirm && (
                  <span className="form-error">Les mots de passe ne correspondent pas.</span>
                )}
              </div>
 
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading
                  ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Enregistrement…</>
                  : 'Enregistrer le nouveau mot de passe'
                }
              </button>
            </form>
          </>
        )}
 
        <div className="login-footer">
          <Link to="/login" className="login-contact-link">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
};
 
export default ResetPassword;
 