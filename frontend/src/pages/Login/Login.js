import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import logo from '../../assets/logo2.png';

import { Link } from 'react-router-dom';

import usePasswordToggle from '../../hooks/usePasswordToggle';

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdType, PwdToggle]  = usePasswordToggle();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await login(data.email, data.mot_de_passe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Vérifiez votre email et mot de passe.');
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
        <p className="login-subtitle">Connectez-vous à votre espace</p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Adresse email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="votre.email@domaine.fr"
              {...register('email', {
                required: 'Email obligatoire.',
                pattern: { value: /^\S+@\S+$/i, message: 'Format email invalide.' }
              })}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 8 }}>
            <label className="form-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
            <input
              type={pwdType}
              className={`form-control ${errors.mot_de_passe ? 'error' : ''}`}
              placeholder="••••••••"
              style={{ paddingRight: 40 }}
              {...register('mot_de_passe', { required: 'Mot de passe obligatoire.' })}
            />
              <PwdToggle />
            </div>
            {errors.mot_de_passe && <span className="form-error">{errors.mot_de_passe.message}</span>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/forgot-password" className="login-forgot">Mot de passe oublié ?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Connexion…</>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="login-footer">
          Premier accès ?{' '}
          <Link to="/contact-admin" className="login-contact-link">
            Contacter l'administrateur
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;