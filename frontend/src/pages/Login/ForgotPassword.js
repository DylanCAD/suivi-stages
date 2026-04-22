import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Login.css';
import logo from '../../assets/logo2.png';

const ForgotPassword = () => {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Veuillez saisir votre adresse email.'); return; }
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email.trim());
      setSubmitted(true);
    } catch {
      // On affiche toujours le message de succès (sécurité)
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-circle login-circle-1"></div>
      <div className="login-circle login-circle-2"></div>

      <div className="login-card">
        <div className="login-logo">
            <img src={logo} alt="Logo" className="login-logo-img" />
        </div>

        {!submitted ? (
          <>
            <h2 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--mono)' }}>
              Mot de passe oublié
            </h2>
            <p className="login-subtitle">
              Entrez votre email, vous recevrez un lien pour créer un nouveau mot de passe.
            </p>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Adresse email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="votre.email@domaine.fr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading
                  ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Envoi…</>
                  : 'Envoyer le lien de réinitialisation'
                }
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#d1fae5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px', fontSize: 24
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1rem', marginBottom: 8, fontFamily: 'var(--mono)' }}>Email envoyé</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
              Si votre adresse est enregistrée, vous recevrez un email avec un lien valable <strong>1 heure</strong>.
              Pensez à vérifier vos spams.
            </p>
          </div>
        )}

        <div className="login-footer">
          <Link to="/login" className="login-contact-link">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;