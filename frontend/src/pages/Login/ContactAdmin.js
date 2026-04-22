import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Login.css';
import logo from '../../assets/logo2.png';

const ContactAdmin = () => {
  const [form, setForm]       = useState({ nom: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState('');

  const validate = () => {
    if (!form.nom.trim())     return 'Le nom est obligatoire.';
    if (!form.email.trim())   return 'L\'email est obligatoire.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Adresse email invalide.';
    if (!form.message.trim()) return 'Le message est obligatoire.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    try {
      await authAPI.contactAdmin(form);
      setSubmitted(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de l\'envoi. Réessayez plus tard.');
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
              Premier accès
            </h2>
            <p className="login-subtitle">
              Vous n'avez pas encore de compte ? Envoyez un message à l'administrateur qui créera votre accès.
            </p>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Votre nom complet <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Marie Dupont"
                  value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Votre adresse email <span className="req">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="marie.dupont@exemple.fr"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Message <span className="req">*</span></label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Expliquez qui vous êtes et pourquoi vous avez besoin d'un accès (étudiant, enseignant, promotion…)"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading
                  ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Envoi…</>
                  : 'Envoyer la demande'
                }
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#d1fae5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1rem', marginBottom: 8, fontFamily: 'var(--mono)' }}>
              Demande envoyée
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 0 }}>
              L'administrateur a reçu votre message et vous contactera à l'adresse <strong>{form.email}</strong> pour créer votre compte.
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

export default ContactAdmin;