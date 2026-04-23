import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { stageAPI } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import './Dashboard.css';

// Icônes SVG pour remplacer les emojis (compatibles dark mode)
const IconDossier = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconClock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// Composant carte statistique — compatible dark mode
const StatCard = ({ icon, value, label, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-val">{value ?? '—'}</div>
    <div className="stat-lbl">{label}</div>
  </div>
);

// Badge de statut
const Badge = ({ statut }) => {
  const labels = {
    en_attente: 'En attente',
    valide:     'Validé',
    refuse:     'Refusé',
    en_cours:   'En cours',
    termine:    'Terminé',
    evalue:     'Évalué',
  };
  return <span className={`badge badge-${statut}`}>{labels[statut] || statut}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [stages,  setStages]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, stagesRes] = await Promise.all([
          stageAPI.getStats(),
          stageAPI.getAll({ archive: false }),
        ]);
        setStats(statsRes.data.stats);
        setStages(stagesRes.data.stages.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatCards = () => {
    if (!stats) return [];
    if (user?.role === 'etudiant') return [
      { icon: <IconDossier />, value: stats.total,      label: 'Mes stages',  color: 'blue'   },
      { icon: <IconCheck />,   value: stats.valide,     label: 'Validés',     color: 'green'  },
      { icon: <IconClock />,   value: stats.en_attente, label: 'En attente',  color: 'amber'  },
      { icon: <IconStar />,    value: stats.evalue,     label: 'Évalués',     color: 'purple' },
    ];
    if (user?.role === 'enseignant') return [
      { icon: <IconDossier />, value: stats.total,      label: 'Dossiers',   color: 'blue'   },
      { icon: <IconClock />,   value: stats.en_attente, label: 'À valider',  color: 'amber'  },
      { icon: <IconCheck />,   value: stats.valide,     label: 'Validés',    color: 'green'  },
      { icon: <IconStar />,    value: stats.evalue,     label: 'Évalués',    color: 'purple' },
    ];
    if (user?.role === 'admin') return [
      { icon: <IconUsers />,   value: stats.nb_etudiants, label: 'Étudiants',  color: 'blue'   },
      { icon: <IconCheck />,   value: stats.valide,       label: 'Validés',    color: 'green'  },
      { icon: <IconClock />,   value: stats.en_attente,   label: 'En attente', color: 'amber'  },
      { icon: <IconStar />,    value: stats.evalue,       label: 'Évalués',    color: 'purple' },
    ];
    return [
      { icon: <IconDossier />, value: stats.total, label: 'Stages', color: 'blue' },
    ];
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 18 ? 'Bonjour' : 'Bonsoir';
  };

  if (loading) return (
    <Layout>
      <div className="loading-center"><div className="spinner"></div><p>Chargement…</p></div>
    </Layout>
  );

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{greeting()}, {user?.prenom}</h1>
          <p className="page-subtitle">
            {user?.role === 'etudiant'   && 'Voici un résumé de vos stages'}
            {user?.role === 'enseignant' && 'Tableau de bord de votre portefeuille étudiants'}
            {user?.role === 'admin'      && 'Vue globale — Année scolaire en cours'}
            {user?.role === 'tuteur'     && 'Vos stagiaires en cours'}
          </p>
        </div>
        {user?.role === 'etudiant' && (
          <Link to="/stages/nouveau" className="btn btn-primary">
            Déclarer un stage
          </Link>
        )}
      </div>

      <div className="stat-grid">
        {getStatCards().map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {user?.role === 'enseignant' && stats?.en_attente > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <strong>{stats.en_attente} dossier(s)</strong> en attente de votre validation.
          <Link to="/stages?statut=en_attente" style={{ marginLeft: 8, fontWeight: 700 }}>
            Voir →
          </Link>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {user?.role === 'enseignant' ? 'Dossiers récents' : 'Stages récents'}
          </h3>
          <Link to="/stages" className="btn btn-ghost btn-sm">Voir tout →</Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {stages.length === 0 ? (
            <div className="empty-state">
              <h3>Aucun stage pour l'instant</h3>
              {user?.role === 'etudiant' && (
                <p><Link to="/stages/nouveau">Déclarez votre premier stage →</Link></p>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Titre</th>
                    {user?.role !== 'etudiant' && <th>Étudiant</th>}
                    <th>Entreprise</th>
                    <th>Période</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map(s => (
                    <tr key={s.id_stage}>
                      <td style={{ fontWeight: 600 }}>{s.titre}</td>
                      {user?.role !== 'etudiant' && (
                        <td className="muted">{s.etudiant_nom}</td>
                      )}
                      <td className="muted">{s.entreprise_nom || '—'}</td>
                      <td className="muted">
                        {s.date_debut && new Date(s.date_debut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        {' → '}
                        {s.date_fin && new Date(s.date_fin).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                      </td>
                      <td><Badge statut={s.statut} /></td>
                      <td>
                        <Link to={`/stages/${s.id_stage}`} className="btn btn-ghost btn-sm">Voir</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;