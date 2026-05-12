import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Login.css';

const VerifyOTP = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loginWithTokens } = useAuth();

  const userId = location.state?.userId;

  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [resent, setResent]   = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) navigate('/login', { replace: true });
  }, [userId, navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    if (value.length === 6) {
      const digits = value.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      return;
    }

    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Entrez les 6 chiffres du code.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyOTP({ userId, otp: code });
      loginWithTokens(null, null, res.data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect ou expiré.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2563eb"/>
            <path d="M8 22 L16 10 L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M11 18 L21 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="10" r="2" fill="white"/>
          </svg>
          <span className="login-logo-text">StageTrack</span>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--mono)' }}>
          Vérification en deux étapes
        </h2>
        <p className="login-subtitle">
          Un code à 6 chiffres a été envoyé à votre adresse email administrateur. Il est valable 10 minutes.
        </p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>
        )}

        {resent && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            Un nouveau code a été envoyé.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28, marginTop: 8 }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                style={{
                  width: 48,
                  height: 56,
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontFamily: 'var(--mono)',
                  fontWeight: 700,
                  border: `2px solid ${digit ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10,
                  outline: 'none',
                  background: digit ? '#eff6ff' : 'white',
                  color: 'var(--text)',
                  transition: 'all 0.15s',
                  cursor: 'text'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading
              ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Vérification…</>
              : 'Vérifier le code'
            }
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: 16 }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.78rem' }}
            onClick={() => navigate('/login')}
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;