import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './EvalTuteur.css';

const CRITERES = [
  { key: 'autonomie',     label: 'Autonomie & prise d\'initiative' },
  { key: 'competences',   label: 'Compétences techniques' },
  { key: 'communication', label: 'Communication & relationnel' },
  { key: 'ponctualite',   label: 'Ponctualité & sérieux' },
  { key: 'integration',   label: 'Intégration dans l\'équipe' },
];

const EvalTuteur = () => {
  const { id_stage, token } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [note, setNote]           = useState(10);
  const [commentaire, setCommentaire] = useState('');
  const [criteres, setCriteres]   = useState(
    Object.fromEntries(CRITERES.map(c => [c.key, 10]))
  );

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post(`/evaluations/${id_stage}/tuteur`, {
        token,
        note_tuteur: note,
        commentaire_tuteur: commentaire,
        criteres,
      });
      setSubmitted(true);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur. Le lien est peut-être expiré.');
    } finally { setSaving(false); }
  };

  const mention = (n) => {
    if (n >= 16) return { label: 'Très bien', color: '#059669' };
    if (n >= 14) return { label: 'Bien',      color: '#16a34a' };
    if (n >= 12) return { label: 'Assez bien',color: '#d97706' };
    if (n >= 10) return { label: 'Passable',  color: '#ca8a04' };
    return { label: 'Insuffisant', color: '#dc2626' };
  };
  const m = mention(note);

  // ── Page confirmation ──
  if (submitted) return (
    <div className="eval-page">
      <div className="eval-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--mono)', marginBottom: 8 }}>Merci pour votre évaluation !</h2>
        <p style={{ color: 'var(--muted)' }}>Votre note a été transmise à l'établissement avec succès.</p>
        <div style={{ marginTop: 20, padding: '16px', background: '#d1fae5', borderRadius: 8, border: '1px solid #6ee7b7' }}>
          <span style={{ color: '#065f46', fontWeight: 700 }}>✅ Évaluation soumise</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="eval-page">
      {/* Header */}
      <div className="eval-header">
        <div className="eval-logo">🎓 StageTrack</div>
        <p>Formulaire d'évaluation tuteur entreprise</p>
      </div>

      <div className="eval-card">
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          ℹ️ Vous êtes invité à évaluer un stagiaire. Ce formulaire est confidentiel et ne sera visible que par l'établissement.
        </div>

        {/* Note globale */}
        <div style={{ textAlign: 'center', marginBottom: 28, padding: '20px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 8 }}>NOTE GLOBALE DU STAGIAIRE</div>
          <div style={{ fontSize: '3.5rem', fontFamily: 'var(--mono)', fontWeight: 700, color: m.color, lineHeight: 1 }}>
            {note}<span style={{ fontSize: '1.8rem' }}>/20</span>
          </div>
          <div style={{ color: m.color, fontWeight: 700, marginTop: 6 }}>{m.label}</div>
          <input
            type="range" min={0} max={20} step={0.5}
            value={note}
            onChange={e => setNote(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: 16, accentColor: 'var(--accent)', height: 6, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--muted)', marginTop: 4 }}>
            <span>0</span><span>10</span><span>20</span>
          </div>
        </div>

        {/* Critères */}
        <h3 style={{ marginBottom: 16, fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>Grille de compétences</h3>
        {CRITERES.map(c => (
          <div key={c.key} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>{c.label}</label>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: mention(criteres[c.key]).color }}>
                {criteres[c.key]}/20
              </span>
            </div>
            <input
              type="range" min={0} max={20} step={0.5}
              value={criteres[c.key]}
              onChange={e => setCriteres(p => ({ ...p, [c.key]: parseFloat(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--accent)', height: 6, cursor: 'pointer' }}
            />
          </div>
        ))}

        {/* Commentaire */}
        <div className="form-group" style={{ marginTop: 24, marginBottom: 24 }}>
          <label className="form-label">Commentaire général</label>
          <textarea
            className="form-control"
            rows={5}
            placeholder="Points forts du stagiaire, axes d'amélioration, bilan général…"
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
          />
        </div>

        <button
          className="btn btn-success btn-full btn-lg"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? '⏳ Envoi en cours…' : '✅ Soumettre mon évaluation'}
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: '#94a3b8' }}>
        StageTrack — Ce formulaire est sécurisé et à usage unique.
      </p>
    </div>
  );
};

export default EvalTuteur;