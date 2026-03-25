import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(data.email, data.mot_de_passe);
      navigate('/dashboard'); // Redirige vers le dashboard après connexion
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Cercles décoratifs en arrière-plan */}
      <div className="login-circle login-circle-1"></div>
      <div className="login-circle login-circle-2"></div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🎓</span>
          <span className="login-logo-text">StageTrack</span>
        </div>
        <p className="login-subtitle">Connectez-vous à votre espace</p>

        {/* Message d'erreur */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Adresse email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="votre.email@domaine.fr"
              {...register('email', {
                required: 'Email obligatoire.',
                pattern: { value: /^\S+@\S+$/i, message: 'Email invalide.' }
              })}
            />
            {errors.email && <span className="form-error">⚠ {errors.email.message}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 8 }}>
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className={`form-control ${errors.mot_de_passe ? 'error' : ''}`}
              placeholder="••••••••"
              {...register('mot_de_passe', { required: 'Mot de passe obligatoire.' })}
            />
            {errors.mot_de_passe && <span className="form-error">⚠ {errors.mot_de_passe.message}</span>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <a href="#!" className="login-forgot">Mot de passe oublié ?</a>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Connexion…</>
            ) : (
              '🔐 Se connecter'
            )}
          </button>
        </form>

        <div className="login-footer">
          Premier accès ? Contactez l'administration
        </div>

        {/* Comptes de test en dev */}
        {process.env.NODE_ENV === 'development' && (
          <div className="login-test-accounts">
            <div className="login-test-title">Comptes de test :</div>
            <div className="login-test-grid">
              <div><strong>Admin</strong><br/>admin@suivi-stages.fr</div>
              <div><strong>Enseignant</strong><br/>j.perrin@suivi-stages.fr</div>
              <div><strong>Étudiant</strong><br/>marie.dupont@etudiant.fr</div>
              <div><strong>Tuteur</strong><br/>p.moreau@capgemini.com</div>
            </div>
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', marginTop: 6 }}>
              Mot de passe : <strong>Password123!</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;