import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { stageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';

const Badge = ({ statut }) => {
  const labels = { en_attente:'En attente', valide:'Validé', refuse:'Refusé', en_cours:'En cours', termine:'Terminé', evalue:'Évalué' };
  return <span className={`badge badge-${statut}`}>{labels[statut] || statut}</span>;
};

const StageList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stages,  setStages]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [statut,  setStatut]  = useState(searchParams.get('statut') || '');

  const load = async () => {
    setLoading(true);
    try {
      const res = await stageAPI.getAll({ statut: statut || undefined, search: search || undefined, archive: false });
      setStages(res.data.stages);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statut]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const title = {
    etudiant: 'Mes stages', enseignant: 'Dossiers à traiter',
    admin: 'Tous les stages', tuteur: 'Mes stagiaires'
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title[user?.role] || 'Stages'}</h1>
          <p className="page-subtitle">{stages.length} résultat(s)</p>
        </div>
        {user?.role === 'etudiant' && (
          <Link to="/stages/nouveau" className="btn btn-primary">+ Déclarer un stage</Link>
        )}
      </div>

      {/* ── Filtres ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: 14 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <input
              className="form-control"
              placeholder="🔍 Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-sm">Rechercher</button>
          </form>
          <select
            className="form-control"
            style={{ width: 160 }}
            value={statut}
            onChange={e => { setStatut(e.target.value); setSearchParams(e.target.value ? { statut: e.target.value } : {}); }}
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="valide">Validé</option>
            <option value="refuse">Refusé</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="evalue">Évalué</option>
          </select>
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : stages.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <h3>Aucun stage trouvé</h3>
              {user?.role === 'etudiant' && <p><Link to="/stages/nouveau">Déclarez votre premier stage →</Link></p>}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Titre</th>
                  {user?.role !== 'etudiant' && <th>Étudiant</th>}
                  <th>Entreprise</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stages.map(s => (
                  <tr key={s.id_stage}>
                    <td className="muted mono">#{s.id_stage}</td>
                    <td style={{ fontWeight: 600, maxWidth: 200 }}>{s.titre}</td>
                    {user?.role !== 'etudiant' && <td className="muted">{s.etudiant_nom}</td>}
                    <td className="muted">{s.entreprise_nom || '—'}</td>
                    <td className="muted">{s.date_debut ? new Date(s.date_debut).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="muted">{s.date_fin   ? new Date(s.date_fin).toLocaleDateString('fr-FR')   : '—'}</td>
                    <td><Badge statut={s.statut} /></td>
                    <td>
                      <Link to={`/stages/${s.id_stage}`} className="btn btn-ghost btn-sm">Voir →</Link>
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

export default StageList;