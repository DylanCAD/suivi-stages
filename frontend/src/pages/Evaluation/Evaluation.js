import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { stageAPI } from '../../services/api';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';

const CRITERES = [
  { key: 'autonomie',       label: 'Autonomie',             max: 20 },
  { key: 'competences',     label: 'Compétences techniques', max: 20 },
  { key: 'communication',   label: 'Communication',          max: 20 },
  { key: 'ponctualite',     label: 'Ponctualité & sérieux',  max: 20 },
  { key: 'integration',     label: 'Intégration équipe',     max: 20 },
];

const NoteSlider = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
      <span style={{
        fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1rem',
        color: value >= 14 ? 'var(--success)' : value >= 10 ? 'var(--warn)' : 'var(--danger)',
        minWidth: 48, textAlign: 'right'
      }}>
        {value}/20
      </span>
    </div>
    <input
      type="range" min={0} max={20} step={0.5}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ width: '100%', accentColor: 'var(--accent)', height: 6, cursor: 'pointer' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--muted)', marginTop: 2 }}>
      <span>0 — Insuffisant</span>
      <span>10 — Passable</span>
      <span>20 — Excellent</span>
    </div>
  </div>
);

const Evaluation = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [stage,   setStage]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tokenUrl, setTokenUrl] = useState('');

  // Notes
  const [note,       setNote]       = useState(10);
  const [commentaire, setCommentaire] = useState('');
  const [criteres,   setCriteres]   = useState(
    Object.fromEntries(CRITERES.map(c => [c.key, 10]))
  );

  useEffect(() => {
    stageAPI.getById(id)
      .then(res => setStage(res.data.stage))
      .catch(() => navigate('/stages'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post(`/evaluations/${id}/enseignant`, {
        note_enseignant: note,
        commentaire_enseignant: commentaire,
        criteres,
      });
      toast.success('✅ Évaluation enregistrée !');
      navigate(`/stages/${id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur.');
    } finally { setSaving(false); }
  };

  const genererToken = async () => {
    try {
      const res = await api.post(`/evaluations/${id}/generer-token`);
      setTokenUrl(res.data.evalUrl);
      toast.success('🔗 Lien généré ! Envoyez-le au tuteur.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur.');
    }
  };

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;
  if (!stage)  return <Layout><div className="empty-state"><h3>Stage introuvable</h3></div></Layout>;

  const mention = (n) => {
    if (n >= 16) return { label: 'Très bien', color: 'var(--success)' };
    if (n >= 14) return { label: 'Bien',      color: '#16a34a' };
    if (n >= 12) return { label: 'Assez bien',color: 'var(--warn)' };
    if (n >= 10) return { label: 'Passable',  color: '#ca8a04' };
    return { label: 'Insuffisant', color: 'var(--danger)' };
  };
  const m = mention(note);

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/stages">Stages</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/stages/${id}`}>{stage.titre}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Évaluation</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">⭐ Évaluer le stage</h1>
          <p className="page-subtitle">{stage.etudiant_prenom} {stage.etudiant_nom} — {stage.titre}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

        {/* ── Formulaire principal ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Note globale */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">📊 Note globale (60% de la note finale)</h3></div>
            <div className="card-body">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  fontSize: '3rem', fontFamily: 'var(--mono)', fontWeight: 700,
                  color: m.color, lineHeight: 1
                }}>{note}<span style={{ fontSize: '1.5rem' }}>/20</span></div>
                <div style={{ color: m.color, fontWeight: 700, marginTop: 6 }}>{m.label}</div>
              </div>
              <NoteSlider label="Note finale" value={note} onChange={setNote} />
            </div>
          </div>

          {/* Critères détaillés */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">📋 Grille de compétences</h3></div>
            <div className="card-body">
              {CRITERES.map(c => (
                <NoteSlider
                  key={c.key}
                  label={c.label}
                  value={criteres[c.key]}
                  onChange={v => setCriteres(prev => ({ ...prev, [c.key]: v }))}
                />
              ))}
            </div>
          </div>

          {/* Commentaire */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">💬 Commentaire</h3></div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={5}
                placeholder="Appréciations générales sur le déroulement du stage, les compétences démontrées, les points forts et axes d'amélioration…"
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
              />
            </div>
          </div>

          {/* Bouton soumettre */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to={`/stages/${id}`} className="btn btn-ghost">← Annuler</Link>
            <button className="btn btn-success" style={{ flex: 1 }} onClick={handleSubmit} disabled={saving}>
              {saving ? '⏳ Enregistrement…' : '✅ Soumettre l\'évaluation'}
            </button>
          </div>
        </div>

        {/* ── Panneau latéral ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Récap étudiant */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">👤 Étudiant</h3></div>
            <div className="card-body">
              <p style={{ fontWeight: 700 }}>{stage.etudiant_prenom} {stage.etudiant_nom}</p>
              <p className="text-muted">{stage.formation}</p>
              <p className="text-muted" style={{ marginTop: 6, fontSize: '0.8rem' }}>{stage.etudiant_email}</p>
            </div>
          </div>

          {/* Récap stage */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">📋 Stage</h3></div>
            <div className="card-body">
              <p style={{ fontWeight: 700 }}>{stage.titre}</p>
              <p className="text-muted">{stage.raison_sociale || '—'}</p>
              <p className="text-muted" style={{ marginTop: 6, fontSize: '0.8rem' }}>
                {stage.date_debut && new Date(stage.date_debut).toLocaleDateString('fr-FR')} →{' '}
                {stage.date_fin   && new Date(stage.date_fin).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Générer lien tuteur */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">🔗 Lien tuteur</h3></div>
            <div className="card-body">
              <p className="text-muted" style={{ marginBottom: 12, fontSize: '0.82rem' }}>
                Générez un lien sécurisé à envoyer au tuteur pour qu'il puisse noter le stage sans se connecter.
              </p>
              <button className="btn btn-primary btn-full" onClick={genererToken}>
                🔗 Générer le lien
              </button>
              {tokenUrl && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, padding: 10, wordBreak: 'break-all', fontSize: '0.75rem', color: 'var(--accent)' }}>
                    {tokenUrl}
                  </div>
                  <button
                    className="btn btn-ghost btn-sm btn-full"
                    style={{ marginTop: 8 }}
                    onClick={() => { navigator.clipboard.writeText(tokenUrl); toast.success('Lien copié !'); }}
                  >
                    📋 Copier le lien
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Evaluation;