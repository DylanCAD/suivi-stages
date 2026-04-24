import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { stageAPI, documentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';
import { FileText, Download, Trash2, Upload, ChevronRight, Star, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './Stages.css';

const Badge = ({ statut }) => {
  const config = {
    en_attente: { label: 'En attente', cls: 'badge-en_attente' },
    valide:     { label: 'Validé',     cls: 'badge-valide'     },
    refuse:     { label: 'Refusé',     cls: 'badge-refuse'     },
    en_cours:   { label: 'En cours',   cls: 'badge-en_cours'   },
    termine:    { label: 'Terminé',    cls: 'badge-termine'    },
    evalue:     { label: 'Évalué',     cls: 'badge-evalue'     },
  };
  const c = config[statut] || { label: statut, cls: '' };
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
};

// Timeline horizontale
const Timeline = ({ statut }) => {
  const steps = [
    { key: 'en_attente', label: 'Soumis'   },
    { key: 'valide',     label: 'Validé'   },
    { key: 'en_cours',   label: 'En cours' },
    { key: 'termine',    label: 'Terminé'  },
    { key: 'evalue',     label: 'Évalué'   },
  ];
  const order = { en_attente: 0, valide: 1, en_cours: 2, termine: 3, evalue: 4, refuse: -1 };
  const current = order[statut] ?? 0;

  if (statut === 'refuse') {
    return (
      <div className="sd-timeline-refused">
        <XCircle size={16} /> Stage refusé
      </div>
    );
  }

  return (
    <div className="sd-timeline">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className={`sd-timeline-step ${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`}>
            <div className="sd-timeline-dot">
              {i < current ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
            </div>
            <span className="sd-timeline-label">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`sd-timeline-line ${i < current ? 'done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Bloc info générique
const InfoBlock = ({ title, children }) => (
  <div className="sd-info-block">
    <div className="sd-info-block-title">{title}</div>
    <div className="sd-info-block-body">{children}</div>
  </div>
);

const StageDetail = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stage,      setStage]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [motif,      setMotif]      = useState('');
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
      toast.success(dec === 'valide' ? 'Stage validé.' : 'Stage refusé.');
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
      toast.success('Document déposé.');
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
    } catch { toast.error('Erreur lors de la génération du PDF.'); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;
  if (!stage)  return <Layout><div className="empty-state"><h3>Stage introuvable</h3></div></Layout>;

  const canValider = (user?.role === 'enseignant' || user?.role === 'admin') && stage.statut === 'en_attente';
  const canEvaluer = (user?.role === 'enseignant' || user?.role === 'admin') && ['valide', 'en_cours', 'termine'].includes(stage.statut);
  const canUpload  = user?.role === 'etudiant' && ['valide', 'en_cours'].includes(stage.statut);

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/stages">Stages</Link>
        <ChevronRight size={14} />
        <span>{stage.titre}</span>
      </div>

      {/* Header */}
      <div className="sd-header">
        <div className="sd-header-left">
          <div className="sd-header-top">
            <h1 className="sd-title">{stage.titre}</h1>
            <Badge statut={stage.statut} />
          </div>
          {stage.raison_sociale && (
            <p className="sd-subtitle">{stage.raison_sociale}{stage.ville ? ` — ${stage.ville}` : ''}</p>
          )}
        </div>
        <div className="sd-header-actions">
          <button className="btn btn-ghost" onClick={handleExportPDF}>
            <FileText size={15} /> Fiche PDF
          </button>
          {user?.role === 'etudiant' && stage.statut === 'en_attente' && (
            <Link to={`/stages/${id}/modifier`} className="btn btn-ghost">Modifier</Link>
          )}
          {canEvaluer && (
            <Link to={`/stages/${id}/evaluer`} className="btn btn-primary">
              <Star size={15} /> Évaluer
            </Link>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="sd-timeline-wrapper">
        <Timeline statut={stage.statut} />
      </div>

      {/* Alertes */}
      {stage.statut === 'refuse' && stage.motif_refus && (
        <div className="alert alert-danger sd-alert">
          <XCircle size={16} />
          <div><strong>Stage refusé :</strong> {stage.motif_refus}</div>
        </div>
      )}
      {canValider && (
        <div className="alert alert-warning sd-alert">
          <AlertCircle size={16} />
          <div>Ce dossier est en attente de votre décision.</div>
        </div>
      )}

      {/* Note finale */}
      {stage.note_finale !== null && stage.note_finale !== undefined && (
        <div className="sd-note-banner">
          <div className="sd-note-main">
            <span className="sd-note-value">{stage.note_finale}</span>
            <span className="sd-note-sur">/20</span>
          </div>
          <div className="sd-note-details">
            <div className="sd-note-line">
              Note tuteur <strong>{stage.note_tuteur ?? '—'}/20</strong>
              <span className="sd-note-pct">40%</span>
            </div>
            <div className="sd-note-line">
              Note enseignant <strong>{stage.note_enseignant ?? '—'}/20</strong>
              <span className="sd-note-pct">60%</span>
            </div>
          </div>
        </div>
      )}

      {/* Grille d'infos */}
      <div className="sd-grid">

        {/* Colonne gauche */}
        <div className="sd-col-main">

          {/* Infos étudiant + période */}
          <div className="sd-row-2">
            <InfoBlock title="Étudiant">
              <p className="sd-info-name">{stage.etudiant_prenom} {stage.etudiant_nom}</p>
              <p className="sd-info-sub">{stage.etudiant_email}</p>
              {stage.formation && <p className="sd-info-sub">{stage.formation}{stage.annee_promotion ? ` · Promo ${stage.annee_promotion}` : ''}</p>}
            </InfoBlock>

            <InfoBlock title="Période de stage">
              <p className="sd-info-name">{fmt(stage.date_debut)}</p>
              <p className="sd-info-sub">au {fmt(stage.date_fin)}</p>
              {stage.enseignant_nom && <p className="sd-info-sub" style={{ marginTop: 8 }}>Référent : {stage.enseignant_prenom} {stage.enseignant_nom}</p>}
            </InfoBlock>
          </div>

          {/* Entreprise */}
          <InfoBlock title="Entreprise d'accueil">
            <div className="sd-row-2">
              <div>
                <p className="sd-info-name">{stage.raison_sociale || '—'}</p>
                {stage.secteur_activite && <p className="sd-info-sub">{stage.secteur_activite}</p>}
                {stage.ville && <p className="sd-info-sub">{stage.adresse ? `${stage.adresse}, ` : ''}{stage.ville} {stage.code_postal}</p>}
                {stage.siret && <p className="sd-info-sub">SIRET : {stage.siret}</p>}
              </div>
              <div>
                <p className="sd-info-label">Tuteur entreprise</p>
                <p className="sd-info-name">{stage.tuteur_prenom || '—'} {stage.tuteur_nom || ''}</p>
                {stage.tuteur_email && <p className="sd-info-sub">{stage.tuteur_email}</p>}
                {stage.tuteur_poste && <p className="sd-info-sub">{stage.tuteur_poste}</p>}
              </div>
            </div>
          </InfoBlock>

          {/* Description & Missions */}
          {(stage.description || stage.missions) && (
            <InfoBlock title="Description & Missions">
              {stage.description && <p className="sd-description">{stage.description}</p>}
              {stage.missions && <p className="sd-missions">{stage.missions}</p>}
            </InfoBlock>
          )}

          {/* Documents */}
          <InfoBlock title={`Documents (${stage.documents?.length || 0})`}>
            {canUpload && (
              <label className="sd-upload-btn">
                <Upload size={14} /> Déposer un document
                <input type="file" hidden accept=".pdf,.docx,.doc" onChange={handleUpload} />
              </label>
            )}
            {!stage.documents?.length ? (
              <p className="sd-info-sub" style={{ marginTop: canUpload ? 12 : 0 }}>Aucun document déposé.</p>
            ) : (
              <div className="sd-docs-list">
                {stage.documents.map(doc => (
                  <div key={doc.id_document} className="sd-doc-item">
                    <FileText size={16} className="sd-doc-icon" />
                    <div className="sd-doc-info">
                      <span className="sd-doc-name">{doc.nom_original}</span>
                      <span className="sd-doc-meta">
                        {doc.type_document} · {(doc.taille_octets / 1024).toFixed(0)} Ko · {fmt(doc.date_depot)}
                      </span>
                    </div>
                    <span className="badge badge-valide">Validé</span>
                  </div>
                ))}
              </div>
            )}
          </InfoBlock>
        </div>

        {/* Colonne droite : décision */}
        {canValider && (
          <div className="sd-col-side">
            <InfoBlock title="Décision de validation">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Motif de refus</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Obligatoire en cas de refus…"
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                />
                <span className="form-hint">Laissez vide si vous validez le stage.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-success" disabled={submitting} onClick={() => handleValider('valide')}>
                  <CheckCircle size={15} /> Valider le stage
                </button>
                <button className="btn btn-danger" disabled={submitting} onClick={() => handleValider('refuse')}>
                  <XCircle size={15} /> Refuser le stage
                </button>
              </div>
            </InfoBlock>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StageDetail;