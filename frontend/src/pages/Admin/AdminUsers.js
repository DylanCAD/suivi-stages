import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/api';
import usePasswordToggle from '../../hooks/usePasswordToggle';
import Layout from '../../components/Layout/Layout';
import { Search, SlidersHorizontal } from 'lucide-react';

const ROLES = [
  { value: '',            label: 'Tous'        },
  { value: 'etudiant',   label: 'Étudiants'   },
  { value: 'enseignant', label: 'Enseignants' },
  { value: 'tuteur',     label: 'Tuteurs'     },
  { value: 'admin',      label: 'Admins'      },
];

const roleLabel = { etudiant: 'Étudiant', enseignant: 'Enseignant', tuteur: 'Tuteur', admin: 'Admin' };

const AdminUsers = () => {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [role,       setRole]       = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '',
    role: 'etudiant', formation: '', departement: ''
  });

  const [pwdType, PwdToggle] = usePasswordToggle();

  const load = async (searchVal = search, roleVal = role) => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({
        search: searchVal || undefined,
        role:   roleVal   || undefined,
      });
      setUsers(res.data.users);
    } catch {} finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const handleRoleTab = (val) => {
    setRole(val);
    load(search, val);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(search, role);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.prenom.trim()) errs.prenom = 'Prénom obligatoire.';
    if (!form.nom.trim())    errs.nom    = 'Nom obligatoire.';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Email invalide.';
    const mdp = form.mot_de_passe;
    if (mdp.length < 12)                errs.mot_de_passe = 'Minimum 12 caractères.';
    else if (!/[A-Z]/.test(mdp))        errs.mot_de_passe = 'Au moins une majuscule requise.';
    else if (!/[a-z]/.test(mdp))        errs.mot_de_passe = 'Au moins une minuscule requise.';
    else if (!/[0-9]/.test(mdp))        errs.mot_de_passe = 'Au moins un chiffre requis.';
    else if (!/[^A-Za-z0-9]/.test(mdp)) errs.mot_de_passe = 'Au moins un caractère spécial (ex: !@#$).';
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
      if (err.response?.data?.errors) {
        toast.error(err.response.data.errors[0]?.msg || 'Erreur de validation.');
      } else {
        toast.error(err.response?.data?.message || 'Erreur lors de la création.');
      }
    }
  };

  return (
    <Layout>

      {/* ── Header ── */}
      <div className="sl-header">
        <div>
          <h1 className="page-title">Gestion des utilisateurs</h1>
          <p className="page-subtitle">
            {loading ? 'Chargement…' : `${users.length} utilisateur${users.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(v => !v); setFormErrors({}); }}
        >
          {showForm ? 'Annuler' : 'Nouvel utilisateur'}
        </button>
      </div>

      {/* ── Formulaire création ── */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3 className="card-title">Créer un compte</h3></div>
          <div className="card-body">
            <form onSubmit={handleCreate} noValidate>

              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Prénom <span className="req">*</span></label>
                  <input className={`form-control ${formErrors.prenom ? 'error' : ''}`}
                    value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                  {formErrors.prenom && <span className="form-error">{formErrors.prenom}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Nom <span className="req">*</span></label>
                  <input className={`form-control ${formErrors.nom ? 'error' : ''}`}
                    value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                  {formErrors.nom && <span className="form-error">{formErrors.nom}</span>}
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input type="email" className={`form-control ${formErrors.email ? 'error' : ''}`}
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Mot de passe <span className="req">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={pwdType}
                      className={`form-control ${formErrors.mot_de_passe ? 'error' : ''}`}
                      style={{ paddingRight: 40 }}
                      value={form.mot_de_passe}
                      onChange={e => setForm(f => ({ ...f, mot_de_passe: e.target.value }))}
                    />
                    <PwdToggle />
                  </div>
                  {formErrors.mot_de_passe
                    ? <span className="form-error">{formErrors.mot_de_passe}</span>
                    : <span className="form-hint">12 car. min., majuscule, minuscule, chiffre, caractère spécial</span>
                  }
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">Rôle <span className="req">*</span></label>
                  <select className="form-control" value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="etudiant">Étudiant</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="tuteur">Tuteur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {form.role === 'etudiant' && (
                  <div className="form-group">
                    <label className="form-label">Formation</label>
                    <input className="form-control" placeholder="BTS SIO SLAM"
                      value={form.formation} onChange={e => setForm(f => ({ ...f, formation: e.target.value }))} />
                  </div>
                )}
                {form.role === 'enseignant' && (
                  <div className="form-group">
                    <label className="form-label">Département</label>
                    <input className="form-control" placeholder="Informatique"
                      value={form.departement} onChange={e => setForm(f => ({ ...f, departement: e.target.value }))} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary">Créer le compte</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Barre de recherche + onglets rôle ── */}
      <div className="sl-filters">
        <form onSubmit={handleSearch} className="sl-search">
          <Search size={16} className="sl-search-icon" />
          <input
            className="sl-search-input"
            placeholder="Rechercher par nom, prénom ou email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Rechercher</button>
        </form>

        <div className="sl-statut-tabs">
          <SlidersHorizontal size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          {ROLES.map(r => (
            <button
              key={r.value}
              className={`sl-tab ${role === r.value ? 'active' : ''}`}
              onClick={() => handleRoleTab(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : users.length === 0 ? (
            <div className="sl-empty" style={{ padding: '48px 24px' }}>
              <h3>Aucun utilisateur trouvé</h3>
              <p>Essayez de modifier votre recherche ou vos filtres.</p>
            </div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                        }}>
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.prenom} {u.nom}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
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