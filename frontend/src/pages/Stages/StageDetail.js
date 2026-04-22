import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { stageAPI, documentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';

const Badge = ({ statut }) => {
  const labels = { en_attente:'En attente', valide:'Validé', refuse:'Refusé', en_cours:'En cours', termine:'Terminé', evalue:'Évalué' };
  return <span className={`badge badge-${statut}`}>{labels[statut] || statut}</span>;
};

const StageDetail = () => {
  const { id }     = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [stage,    setStage]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [motif,    setMotif]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reload = () => stageAPI.getById(id).then(res => setStage(res.data.stage));

  useEffect(() => {
    reload().catch(() => navigate('/stages')).finally(() => setLoading(false));
  }, [id]);

  const handleValider = async (dec) => {
    if (dec === 'refuse' && !motif.trim()) { toast.error('Le motif de refus est obligatoire.'); return; }
    setSubmitting(true);
    try {
      await stageAPI.valider(id, { decision: dec, motif_refus: motif });
      toast.success(dec === 'valide' ? '✅ Stage validé !' : '❌ Stage refusé.');
      reload();
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur.'); }
    finally { setSubmitting(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('fichier', file);
    form.append('type_document', 'rapport');
    try {
      await documentAPI.upload(id, form);
      toast.success('📄 Document déposé !');
      reload();
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur upload.'); }
  };

 const handleExportPDF = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:5000/api/export/stage/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const html = await response.text();
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  } catch {
    toast.error('Erreur lors de la génération du PDF.');
  }
};

  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;
  if (!stage)  return <Layout><div className="empty-state"><h3>Stage introuvable</h3></div></Layout>;

  const canValider = (user?.role === 'enseignant' || user?.role === 'admin') && stage.statut === 'en_attente';
  const canEvaluer = (user?.role === 'enseignant' || user?.role === 'admin') && ['valide','en_cours','termine'].includes(stage.statut);
  const canUpload  = user?.role === 'etudiant' && ['valide','en_cours'].includes(stage.statut);

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/stages">Stages</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{stage.titre}</span>
      </div>

      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <h1 className="page-title" style={{ marginBottom:0 }}>{stage.titre}</h1>
          <Badge statut={stage.statut} />
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={handleExportPDF}>🖨️ Fiche PDF</button>
          {user?.role === 'etudiant' && stage.statut === 'en_attente' && (
            <Link to={`/stages/${id}/modifier`} className="btn btn-ghost">✏️ Modifier</Link>
          )}
          {canEvaluer && (
            <Link to={`/stages/${id}/evaluer`} className="btn btn-primary">⭐ Évaluer</Link>
          )}
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div className="stage-timeline">
        <div className={`step ${stage.statut === 'en_attente' ? 'active' : ''}`}>
          🟢 Créé
        </div>
        <div className={`step ${stage.statut === 'valide' ? 'active' : ''}`}>
          🟡 Validé
        </div>
        <div className={`step ${stage.statut === 'en_cours' ? 'active' : ''}`}>
          🔵 En cours
        </div>
        <div className={`step ${stage.statut === 'termine' ? 'active' : ''}`}>
          🟣 Terminé
        </div>
      </div>

      {stage.statut === 'refuse' && stage.motif_refus && (
        <div className="alert alert-danger" style={{ marginBottom:20 }}>
          ❌ <strong>Stage refusé :</strong> {stage.motif_refus}
        </div>
      )}
      {canValider && (
        <div className="alert alert-warning" style={{ marginBottom:20 }}>⚠️ Ce dossier attend votre décision.</div>
      )}

      {stage.note_finale !== null && stage.note_finale !== undefined && (
        <div style={{ background:'linear-gradient(135deg,#1a1f3e,#1e3a8a)', borderRadius:8, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'2rem', fontWeight:700, color:'#34d399', lineHeight:1 }}>
              {stage.note_finale}<span style={{ fontSize:'1rem' }}>/20</span>
            </div>
            <div style={{ color:'#94a3b8', fontSize:'0.72rem', marginTop:2 }}>Note finale</div>
          </div>
          <div style={{ color:'#94a3b8', fontSize:'0.82rem' }}>
            <div>Note tuteur : <strong style={{ color:'white' }}>{stage.note_tuteur ?? '—'}/20</strong> (40%)</div>
            <div>Note enseignant : <strong style={{ color:'white' }}>{stage.note_enseignant ?? '—'}/20</strong> (60%)</div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">👤 Étudiant</h3></div>
          <div className="card-body">
            <p><strong>{stage.etudiant_prenom} {stage.etudiant_nom}</strong></p>
            <p className="text-muted">{stage.etudiant_email}</p>
            <p className="text-muted">{stage.formation} · {stage.annee_promotion}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">📅 Période</h3></div>
          <div className="card-body">
            <p><strong>{fmt(stage.date_debut)} → {fmt(stage.date_fin)}</strong></p>
            <p className="text-muted">{stage.raison_sociale || '—'}</p>
            <p className="text-muted">{stage.ville} {stage.code_postal}</p>
          </div>
        </div>

        {(stage.description || stage.missions) && (
          <div className="card" style={{ gridColumn:'1 / -1' }}>
            <div className="card-header"><h3 className="card-title">📝 Description & Missions</h3></div>
            <div className="card-body">
              {stage.description && <p style={{ color:'var(--text)', marginBottom:8 }}>{stage.description}</p>}
              {stage.missions    && <p className="text-muted">{stage.missions}</p>}
            </div>
          </div>
        )}

        <div className="card" style={{ gridColumn:'1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">📁 Documents ({stage.documents?.length || 0})</h3>
            {canUpload && (
              <label className="btn btn-primary btn-sm" style={{ cursor:'pointer' }}>
                + Déposer
                <input type="file" hidden accept=".pdf,.docx,.doc" onChange={handleUpload} />
              </label>
            )}
          </div>
          <div className="card-body">
            {!stage.documents?.length ? (
              <p className="text-muted">Aucun document déposé.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {stage.documents.map(doc => (
                  <div key={doc.id_document} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#f8fafc', border:'1px solid var(--border)', borderRadius:6 }}>
                    <span>📄</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{doc.nom_original}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                        {doc.type_document} · {(doc.taille_octets/1024).toFixed(0)} Ko · {fmt(doc.date_depot)}
                      </div>
                    </div>
                    <span className="badge badge-valide">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {canValider && (
        <div className="card" style={{ marginTop:20 }}>
          <div className="card-header"><h3 className="card-title">⚖️ Décision</h3></div>
          <div className="card-body">
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">Motif de refus (obligatoire si refus)</label>
              <textarea className="form-control" rows={3}
                placeholder="Expliquez pourquoi ce stage est refusé…"
                value={motif} onChange={e => setMotif(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-danger" style={{ flex:1 }} disabled={submitting} onClick={() => handleValider('refuse')}>✗ Refuser</button>
              <button className="btn btn-success" style={{ flex:1 }} disabled={submitting} onClick={() => handleValider('valide')}>✓ Valider</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StageDetail;