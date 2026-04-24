import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { stageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';
import { Briefcase, Calendar, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import './Stages.css';

const Badge = ({ statut }) => {
  const config = {
    en_attente: { label: 'En attente',  cls: 'badge-en_attente' },
    valide:     { label: 'Validé',      cls: 'badge-valide'     },
    refuse:     { label: 'Refusé',      cls: 'badge-refuse'     },
    en_cours:   { label: 'En cours',    cls: 'badge-en_cours'   },
    termine:    { label: 'Terminé',     cls: 'badge-termine'    },
    evalue:     { label: 'Évalué',      cls: 'badge-evalue'     },
  };
  const c = config[statut] || { label: statut, cls: '' };
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
};

const StageCard = ({ s, showEtudiant }) => (
  <Link to={`/stages/${s.id_stage}`} className="stage-card-link">
    <div className="stage-card-v2">
      <div className="stage-card-v2-top">
        <div className="stage-card-v2-title">{s.titre}</div>
        <Badge statut={s.statut} />
      </div>

      <div className="stage-card-v2-meta">
        {s.entreprise_nom && (
          <span className="stage-meta-item">
            <Briefcase size={13} />
            {s.entreprise_nom}
            {s.entreprise_ville ? ` — ${s.entreprise_ville}` : ''}
          </span>
        )}
        <span className="stage-meta-item">
          <Calendar size={13} />
          {s.date_debut ? new Date(s.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          {' → '}
          {s.date_fin ? new Date(s.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
        {showEtudiant && s.etudiant_nom && (
          <span className="stage-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {s.etudiant_nom}
          </span>
        )}
      </div>

      <div className="stage-card-v2-footer">
        {s.formation && <span className="stage-formation-tag">{s.formation}</span>}
        <span className="stage-card-v2-arrow">
          Voir le dossier <ChevronRight size={14} />
        </span>
      </div>
    </div>
  </Link>
);

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

  const title = { etudiant: 'Mes stages', enseignant: 'Dossiers à traiter', admin: 'Tous les stages', tuteur: 'Mes stagiaires' };

  const statuts = [
    { value: '', label: 'Tous' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'valide',     label: 'Validé' },
    { value: 'refuse',     label: 'Refusé' },
    { value: 'en_cours',   label: 'En cours' },
    { value: 'termine',    label: 'Terminé' },
    { value: 'evalue',     label: 'Évalué' },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="sl-header">
        <div>
          <h1 className="page-title">{title[user?.role] || 'Stages'}</h1>
          <p className="page-subtitle">
            {loading ? 'Chargement…' : `${stages.length} résultat${stages.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {user?.role === 'etudiant' && (
          <Link to="/stages/nouveau" className="btn btn-primary">Déclarer un stage</Link>
        )}
      </div>

      {/* Barre de recherche + filtres statut */}
      <div className="sl-filters">
        <form onSubmit={e => { e.preventDefault(); load(); }} className="sl-search">
          <Search size={16} className="sl-search-icon" />
          <input
            className="sl-search-input"
            placeholder="Rechercher un stage, une entreprise, un étudiant"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Rechercher</button>
        </form>

        <div className="sl-statut-tabs">
          <SlidersHorizontal size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          {statuts.map(s => (
            <button
              key={s.value}
              className={`sl-tab ${statut === s.value ? 'active' : ''}`}
              onClick={() => { setStatut(s.value); setSearchParams(s.value ? { statut: s.value } : {}); }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="sl-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="sl-skeleton-card">
              <div className="skeleton" style={{ width: '70%', height: 18, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '55%', height: 14 }} />
            </div>
          ))}
        </div>
      ) : stages.length === 0 ? (
        <div className="sl-empty">
          <div className="sl-empty-icon">
            <Briefcase size={32} strokeWidth={1.5} />
          </div>
          <h3>Aucun stage trouvé</h3>
          <p>Essayez de modifier vos filtres ou votre recherche.</p>
          {user?.role === 'etudiant' && (
            <Link to="/stages/nouveau" className="btn btn-primary" style={{ marginTop: 16 }}>
              Déclarer mon premier stage
            </Link>
          )}
        </div>
      ) : (
        <div className="sl-grid">
          {stages.map(s => (
            <StageCard key={s.id_stage} s={s} showEtudiant={user?.role !== 'etudiant'} />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default StageList;