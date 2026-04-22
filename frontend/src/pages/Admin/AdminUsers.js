import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/api';
import Layout from '../../components/Layout/Layout';

const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '',
    role: 'etudiant', formation: '', departement: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ search: search || undefined, role: role || undefined });
      setUsers(res.data.users);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [role]);

const validateForm = () => {
  const errs = {};
  if (!form.prenom.trim()) errs.prenom = 'Prénom obligatoire.';
  if (!form.nom.trim()) errs.nom = 'Nom obligatoire.';
  if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
    errs.email = 'Email invalide.';

  const mdp = form.mot_de_passe;
  if (mdp.length < 12)
    errs.mot_de_passe = 'Minimum 12 caractères.';
  else if (!/[A-Z]/.test(mdp))
    errs.mot_de_passe = 'Au moins une majuscule requise.';
  else if (!/[a-z]/.test(mdp))
    errs.mot_de_passe = 'Au moins une minuscule requise.';
  else if (!/[0-9]/.test(mdp))
    errs.mot_de_passe = 'Au moins un chiffre requis.';
  else if (!/[^A-Za-z0-9]/.test(mdp))
    errs.mot_de_passe = 'Au moins un caractère spécial requis (ex: !@#$).';

  setFormErrors(errs);
  return Object.keys(errs).length === 0;
};

  const handleToggle = async (id, actif) => {
    try {
      await userAPI.toggle(id);
      toast.success(actif ? 'Compte désactivé.' : 'Compte activé.');
      load();
    } catch { toast.error('Erreur.'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await userAPI.create(form);
      toast.success('Utilisateur créé avec succès.');
      setShowForm(false);
      setForm({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'etudiant', formation: '', departement: '' });
      setFormErrors({});
      load();
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (err.response?.data?.errors) {
        toast.error(err.response.data.errors[0]?.msg || 'Erreur de validation.');
      } else {
        toast.error(msg || 'Erreur lors de la création.');
      }
    }
  };

  const roleLabel = { etudiant: 'Étudiant', enseignant: 'Enseignant', tuteur: 'Tuteur', admin: 'Admin' };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des utilisateurs</h1>
          <p className="page-subtitle">{users.length} utilisateur(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(v => !v); setFormErrors({}); }}>
          {showForm ? 'Annuler' : 'Nouvel utilisateur'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3 className="card-title">Créer un compte</h3></div>
          <div className="card-body">
            <form onSubmit={handleCreate} noValidate>
              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Prénom <span className="req">*</span></label>
                  <input
                    className={`form-control ${formErrors.prenom ? 'error' : ''}`}
                    value={form.prenom}
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                  />
                  {formErrors.prenom && <span className="form-error">{formErrors.prenom}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Nom <span className="req">*</span></label>
                  <input
                    className={`form-control ${formErrors.nom ? 'error' : ''}`}
                    value={form.nom}
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  />
                  {formErrors.nom && <span className="form-error">{formErrors.nom}</span>}
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? 'error' : ''}`}
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                  {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Mot de passe <span className="req">*</span></label>
                  <input
                    type="password"
                    className={`form-control ${formErrors.mot_de_passe ? 'error' : ''}`}
                    value={form.mot_de_passe}
                    onChange={e => setForm(f => ({ ...f, mot_de_passe: e.target.value }))}
                  />
                  {formErrors.mot_de_passe
                    ? <span className="form-error">{formErrors.mot_de_passe}</span>
                    : <span className="form-hint">Minimum 12 caractères, avec majuscule, minuscule, chiffre et caractère spécial.</span>}
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">Rôle <span className="req">*</span></label>
                  <select
                    className="form-control"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  >
                    <option value="etudiant">Étudiant</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="tuteur">Tuteur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {form.role === 'etudiant' && (
                  <div className="form-group">
                    <label className="form-label">Formation</label>
                    <input
                      className="form-control"
                      placeholder="BTS SIO SLAM"
                      value={form.formation}
                      onChange={e => setForm(f => ({ ...f, formation: e.target.value }))}
                    />
                  </div>
                )}
                {form.role === 'enseignant' && (
                  <div className="form-group">
                    <label className="form-label">Département</label>
                    <input
                      className="form-control"
                      placeholder="Informatique"
                      value={form.departement}
                      onChange={e => setForm(f => ({ ...f, departement: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary">Créer le compte</button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, padding: 14, flexWrap: 'wrap' }}>
          <form onSubmit={e => { e.preventDefault(); load(); }} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <input
              className="form-control"
              placeholder="Rechercher par nom ou email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-sm">Rechercher</button>
          </form>
          <select className="form-control" style={{ width: 160 }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="">Tous les rôles</option>
            <option value="etudiant">Étudiants</option>
            <option value="enseignant">Enseignants</option>
            <option value="tuteur">Tuteurs</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Détail</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id_utilisateur}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.prenom} {u.nom}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            Créé le {new Date(u.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{u.email}</td>
                    <td><span className="badge badge-en_cours">{roleLabel[u.role]}</span></td>
                    <td className="muted" style={{ fontSize: '0.8rem' }}>
                      {u.formation || u.departement || u.poste || '—'}
                    </td>
                    <td>
                      <span className={`badge ${u.actif ? 'badge-valide' : 'badge-refuse'}`}>
                        {u.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.actif ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggle(u.id_utilisateur, u.actif)}
                      >
                        {u.actif ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;