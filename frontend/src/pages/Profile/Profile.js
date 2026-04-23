import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

import usePasswordToggle from '../../hooks/usePasswordToggle';

import Layout from '../../components/Layout/Layout';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('infos'); // 'infos' | 'password'
  const [saving, setSaving] = useState(false);

  const [ancienType,  AncienToggle]  = usePasswordToggle();
  const [nouveauType, NouveauToggle] = usePasswordToggle();
  const [confirmType, ConfirmToggle] = usePasswordToggle();

  // ── Formulaire infos ──
  const { register: regInfo, handleSubmit: submitInfo, formState: { errors: errInfo } } = useForm({
    defaultValues: {
      prenom: user?.prenom || '',
      nom:    user?.nom    || '',
      bureau: user?.bureau || '',
      specialite: user?.specialite || '',
      telephone:  user?.telephone  || '',
    }
  });

  // ── Formulaire mot de passe ──
  const { register: regPwd, handleSubmit: submitPwd, formState: { errors: errPwd }, watch: watchPwd, reset: resetPwd } = useForm();

  const onSaveInfos = async (data) => {
    setSaving(true);
    try {
      await userAPI.updateProfile(data);
      toast.success('✅ Profil mis à jour !');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur.');
    } finally { setSaving(false); }
  };

  const onSavePassword = async (data) => {
    setSaving(true);
    try {
      await userAPI.changePassword({
        ancien_mot_de_passe: data.ancien,
        nouveau_mot_de_passe: data.nouveau,
      });
      toast.success('✅ Mot de passe modifié !');
      resetPwd();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ancien mot de passe incorrect.');
    } finally { setSaving(false); }
  };

  const roleLabel = {
    etudiant:   '🎓 Étudiant',
    enseignant: '👨‍🏫 Enseignant référent',
    tuteur:     '🏢 Tuteur entreprise',
    admin:      '⚙️ Administrateur',
  };

  const roleColor = {
    etudiant: '#1e40af', enseignant: '#065f46',
    tuteur: '#92400e',  admin:      '#5b21b6',
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">👤 Mon profil</h1>
      </div>

      {/* ── Carte identité ── */}
      <div className="profile-hero">
        <div className="profile-avatar">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.prenom}+${user?.nom}`}
            alt="avatar"
          />
        </div>
        <div className="profile-hero-info">
          <h2 className="profile-name">{user?.prenom} {user?.nom}</h2>
          <span className="profile-role-badge" style={{ background: roleColor[user?.role] + '20', color: roleColor[user?.role] }}>
            {roleLabel[user?.role]}
          </span>
          <p className="profile-email">📧 {user?.email}</p>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'infos' ? 'active' : ''}`} onClick={() => setTab('infos')}>
          ✏️ Mes informations
        </button>
        <button className={`profile-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
          🔒 Mot de passe
        </button>
      </div>

      {/* ── Onglet Infos ── */}
      {tab === 'infos' && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-header"><h3 className="card-title">Informations personnelles</h3></div>
          <div className="card-body">
            <form onSubmit={submitInfo(onSaveInfos)}>
              <div className="form-row" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Prénom <span className="req">*</span></label>
                  <input className={`form-control ${errInfo.prenom ? 'error' : ''}`}
                    {...regInfo('prenom', { required: 'Obligatoire.' })} />
                  {errInfo.prenom && <span className="form-error">⚠ {errInfo.prenom.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Nom <span className="req">*</span></label>
                  <input className={`form-control ${errInfo.nom ? 'error' : ''}`}
                    {...regInfo('nom', { required: 'Obligatoire.' })} />
                  {errInfo.nom && <span className="form-error">⚠ {errInfo.nom.message}</span>}
                </div>
              </div>

              {/* Champs selon le rôle */}
              {user?.role === 'etudiant' && (
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Téléphone</label>
                  <input className="form-control" placeholder="06 12 34 56 78"
                    {...regInfo('telephone')} />
                </div>
              )}
              {user?.role === 'enseignant' && (<>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Bureau</label>
                  <input className="form-control" placeholder="B204" {...regInfo('bureau')} />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Spécialité</label>
                  <input className="form-control" placeholder="Développement Web" {...regInfo('specialite')} />
                </div>
              </>)}

              {/* Email (non modifiable) */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Email (non modifiable)</label>
                <input className="form-control" value={user?.email} disabled style={{ background: '#f8fafc', color: 'var(--muted)' }} />
                <span className="form-hint">Contactez l'administration pour changer d'email.</span>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Enregistrement…' : '💾 Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Onglet Mot de passe ── */}
      {tab === 'password' && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-header"><h3 className="card-title">Changer le mot de passe</h3></div>
          <div className="card-body">
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
            </div>
            <form onSubmit={submitPwd(onSavePassword)}>
                {/* Ancien mot de passe */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Ancien mot de passe <span className="req">*</span></label>
                <div style={{ position: 'relative' }}>
                <input
                    type={ancienType}
                    className={`form-control ${errPwd.ancien ? 'error' : ''}`}
                    style={{ paddingRight: 40 }}
                    {...regPwd('ancien', { required: 'Obligatoire.' })}
                  />
                  <AncienToggle />
                </div>
                {errPwd.ancien && <span className="form-error">{errPwd.ancien.message}</span>}
              </div>
 
              {/* Nouveau mot de passe */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Nouveau mot de passe <span className="req">*</span></label>
                <div style={{ position: 'relative' }}>
                <input
                    type={nouveauType}
                    className={`form-control ${errPwd.nouveau ? 'error' : ''}`}
                    style={{ paddingRight: 40 }}
                    {...regPwd('nouveau', {
                      required: 'Obligatoire.',
                      minLength: { value: 12, message: '12 caractères minimum.' },
                      validate: {
                        hasUpper:   v => /[A-Z]/.test(v)        || 'Au moins une majuscule requise.',
                        hasLower:   v => /[a-z]/.test(v)        || 'Au moins une minuscule requise.',
                        hasNumber:  v => /[0-9]/.test(v)        || 'Au moins un chiffre requis.',
                        hasSpecial: v => /[^A-Za-z0-9]/.test(v) || 'Au moins un caractère spécial (ex: !@#$).',
                      }
                    })}
                  />
                  <NouveauToggle />
                </div>
                {errPwd.nouveau && <span className="form-error">{errPwd.nouveau.message}</span>}
              </div>
              
              {/* Confirmation */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Confirmer le nouveau mot de passe <span className="req">*</span></label>
                  <div style={{ position: 'relative' }}>
                  <input
                    type={confirmType}
                    className={`form-control ${errPwd.confirm ? 'error' : ''}`}
                    style={{ paddingRight: 40 }}
                    {...regPwd('confirm', {
                      required: 'Obligatoire.',
                      validate: v => v === watchPwd('nouveau') || 'Les mots de passe ne correspondent pas.'
                    })}
                  />
                  <ConfirmToggle />
                </div>
                {errPwd.confirm && <span className="form-error">{errPwd.confirm.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Modification…' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profile;