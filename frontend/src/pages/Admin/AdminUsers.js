import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { userAPI, entrepriseAPI } from '../../services/api';
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

const FORM_INIT = {
  nom: '', prenom: '', email: '', mot_de_passe: '',
  role: 'etudiant', formation: '', departement: '',
  poste: '', id_entreprise: '', id_enseignant_ref: '',  // ← nouveau
};

const AdminUsers = () => {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [role,         setRole]         = useState('');
  const [showForm,     setShowForm]     = useState(false);
  const [formErrors,   setFormErrors]   = useState({});
  const [entreprises,  setEntreprises]  = useState([]);
  const [enseignants,  setEnseignants]  = useState([]);   // ← nouveau

  // "existing" = choisir dans la liste | "new" = saisir une nouvelle
  const [entrepriseMode, setEntrepriseMode] = useState('existing');
  const [nouvelleEntreprise, setNouvelleEntreprise] = useState('');

  const [form, setForm] = useState(FORM_INIT);
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

  const loadEntreprises = async () => {
    try {
      const res = await entrepriseAPI.getAll();
      setEntreprises(res.data.entreprises ?? []);
    } catch {}
  };

  // ← nouveau : charge tous les enseignants actifs
  const loadEnseignants = async () => {
    try {
      const res = await userAPI.getAll({ role: 'enseignant', actif: 'true' });
      setEnseignants(res.data.users ?? []);
    } catch {}
  };

  React.useEffect(() => {
    load();
    loadEntreprises();
    loadEnseignants();  // ← nouveau
  }, []);

  const handleRoleTab = (val) => { setRole(val); load(search, val); };
  const handleSearch  = (e)   => { e.preventDefault(); load(search, role); };

  const resetForm = () => {
    setForm(FORM_INIT);
    setFormErrors({});
    setEntrepriseMode('existing');
    setNouvelleEntreprise('');
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

    // ← nouveau : enseignant référent obligatoire pour étudiant
    if (form.role === 'etudiant' && !form.id_enseignant_ref)
      errs.id_enseignant_ref = 'Veuillez sélectionner un enseignant référent.';

    if (form.role === 'tuteur') {
      if (entrepriseMode === 'existing' && !form.id_entreprise)
        errs.id_entreprise = 'Veuillez sélectionner une entreprise.';
      if (entrepriseMode === 'new' && !nouvelleEntreprise.trim())
        errs.id_entreprise = 'Veuillez saisir le nom de la nouvelle entreprise.';
    }

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
      let id_entreprise = form.id_entreprise;

      // Si nouvelle entreprise → la créer d'abord, récupérer son id
      if (form.role === 'tuteur' && entrepriseMode === 'new') {
        const res = await entrepriseAPI.create({ raison_sociale: nouvelleEntreprise.trim() });
        id_entreprise = res.data.id_entreprise;
        setEntreprises(prev => [...prev, { id_entreprise, raison_sociale: nouvelleEntreprise.trim() }]);
      }

      await userAPI.create({ ...form, id_entreprise });
      toast.success('Utilisateur créé avec succès.');
      setShowForm(false);
      resetForm();
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
          onClick={() => { setShowForm(v => !v); resetForm(); }}
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

              {/* Prénom / Nom */}
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

              {/* Email / Mot de passe */}
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

              {/* Rôle + champs conditionnels */}
              <div className="form-row" style={{ marginBottom: form.role === 'tuteur' ? 8 : 14 }}>
                <div className="form-group">
                  <label className="form-label">Rôle <span className="req">*</span></label>
                  <select
                    className="form-control"
                    value={form.role}
                    onChange={e => {
                      setForm(f => ({
                        ...f,
                        role: e.target.value,
                        formation: '', departement: '',
                        poste: '', id_entreprise: '',
                        id_enseignant_ref: '',  // ← reset
                      }));
                      setEntrepriseMode('existing');
                      setNouvelleEntreprise('');
                    }}
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
                    <input className="form-control" placeholder="BTS SIO SLAM"
                      value={form.formation}
                      onChange={e => setForm(f => ({ ...f, formation: e.target.value }))} />
                  </div>
                )}

                {form.role === 'enseignant' && (
                  <div className="form-group">
                    <label className="form-label">Département</label>
                    <input className="form-control" placeholder="Informatique"
                      value={form.departement}
                      onChange={e => setForm(f => ({ ...f, departement: e.target.value }))} />
                  </div>
                )}

                {form.role === 'tuteur' && (
                  <div className="form-group">
                    <label className="form-label">Poste</label>
                    <input className="form-control" placeholder="Ex : Responsable technique"
                      value={form.poste}
                      onChange={e => setForm(f => ({ ...f, poste: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* ── Étudiant → Enseignant référent ── */}
              {form.role === 'etudiant' && (
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">
                    Enseignant référent <span className="req">*</span>
                  </label>
                  <select
                    className={`form-control ${formErrors.id_enseignant_ref ? 'error' : ''}`}
                    value={form.id_enseignant_ref}
                    onChange={e => setForm(f => ({ ...f, id_enseignant_ref: e.target.value }))}
                  >
                    <option value="">-- Sélectionner un enseignant --</option>
                    {enseignants.map(ens => (
                      <option key={ens.id_utilisateur} value={ens.id_utilisateur}>
                        {ens.prenom} {ens.nom}{ens.departement ? ` — ${ens.departement}` : ''}
                      </option>
                    ))}
                  </select>
                  {formErrors.id_enseignant_ref &&
                    <span className="form-error">{formErrors.id_enseignant_ref}</span>}
                  {enseignants.length === 0 &&
                    <span className="form-hint">Aucun enseignant actif trouvé en base.</span>}
                </div>
              )}

              {/* Tuteur → Entreprise */}
              {form.role === 'tuteur' && (
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Entreprise <span className="req">*</span></label>

                  {/* Toggle existante / nouvelle */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${entrepriseMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => { setEntrepriseMode('existing'); setNouvelleEntreprise(''); }}
                    >
                      Entreprise existante
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${entrepriseMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => { setEntrepriseMode('new'); setForm(f => ({ ...f, id_entreprise: '' })); }}
                    >
                      + Nouvelle entreprise
                    </button>
                  </div>

                  {entrepriseMode === 'existing' && (
                    <select
                      className={`form-control ${formErrors.id_entreprise ? 'error' : ''}`}
                      value={form.id_entreprise}
                      onChange={e => setForm(f => ({ ...f, id_entreprise: e.target.value }))}
                    >
                      <option value="">-- Sélectionner une entreprise --</option>
                      {entreprises.map(e => (
                        <option key={e.id_entreprise} value={e.id_entreprise}>
                          {e.raison_sociale}{e.ville ? ` — ${e.ville}` : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  {entrepriseMode === 'new' && (
                    <input
                      className={`form-control ${formErrors.id_entreprise ? 'error' : ''}`}
                      placeholder="Nom de la nouvelle entreprise"
                      value={nouvelleEntreprise}
                      onChange={e => setNouvelleEntreprise(e.target.value)}
                    />
                  )}

                  {formErrors.id_entreprise &&
                    <span className="form-error">{formErrors.id_entreprise}</span>}
                </div>
              )}

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
