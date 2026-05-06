import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { stageAPI, documentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';
import { useConfirm } from '../../hooks/useConfirm';
import {
  FileText, Download, Trash2, Upload, ChevronRight,
  Star, Clock, CheckCircle, XCircle, AlertCircle,
  PlayCircle, StopCircle
} from 'lucide-react';
import './Stages.css';

// ── Badge statut ──────────────────────────────────────────────────────────────
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

// ── Timeline horizontale ──────────────────────────────────────────────────────
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

// ── Bloc info générique ───────────────────────────────────────────────────────
const InfoBlock = ({ title, children }) => (
  <div className="sd-info-block">
    <div className="sd-info-block-title">{title}</div>
    <div className="sd-info-block-body">{children}</div>
  </div>
);

// ── Composant principal ───────────────────────────────────────────────────────
const StageDetail = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stage,      setStage]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [motif,      setMotif]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ← Hook modal de confirmation
  const { confirm, ConfirmDialog } = useConfirm();

  const reload = () => stageAPI.getById(id).then(res => setStage(res.data.stage));

  useEffect(() => {
    reload().catch(() => navigate('/stages')).finally(() => setLoading(false));
  }, [id]);

  // ── Validation / Refus ───────────────────────────────────────────────────────
  const handleValider = async (dec) => {
    if (dec === 'refuse' && !motif.trim()) {
      toast.error('Le motif de refus est obligatoire.');
      return;
    }
    setSubmitting(true);
    try {
      await stageAPI.valider(id, { decision: dec, motif_refus: motif });
      toast.success(dec === 'valide' ? 'Stage validé.' : 'Stage refusé.');
      reload();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur.');
    } finally { setSubmitting(false); }
  };

  // ── Changement de statut (Démarrer / Terminer) ───────────────────────────────
  const handleChangerStatut = async (nouveauStatut) => {
    const isDemarrer = nouveauStatut === 'en_cours';

    const ok = await confirm({
      variant:      isDemarrer ? 'info' : 'stop',
      title:        isDemarrer ? 'Démarrer le stage ?' : 'Terminer le stage ?',
      message:      isDemarrer
        ? "L'étudiant pourra commencer à déposer ses documents."
        : 'Cette action lancera la phase d\'évaluation.',
      confirmLabel: isDemarrer ? 'Démarrer' : 'Terminer',
    });

    if (!ok) return;

    setSubmitting(true);
    try {
      await stageAPI.changerStatut(id, { statut: nouveauStatut });
      toast.success(isDemarrer ? 'Stage démarré avec succès.' : 'Stage terminé avec succès.');
      reload();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur.');
    } finally { setSubmitting(false); }
  };

  // ── Upload document ──────────────────────────────────────────────────────────
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
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur upload.');
    }
    e.target.value = '';
  };

  // ── Téléchargement document ──────────────────────────────────────────────────
  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/${doc.id_document}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Erreur téléchargement');
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = doc.nom_original;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Impossible de télécharger le fichier.');
    }
  };

  // ── Suppression document ─────────────────────────────────────────────────────
  const handleDeleteDoc = async (docId, nomFichier) => {
    const ok = await confirm({
      variant:      'danger',
      title:        'Supprimer ce document ?',
      message:      nomFichier
        ? `« ${nomFichier} » sera définitivement supprimé.`
        : 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
    });

    if (!ok) return;

    try {
      await documentAPI.delete(docId);
      toast.success('Document supprimé.');
      reload();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur suppression.');
    }
  };

  // ── Export PDF ───────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/export/stage/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const html = await response.text();
      const win  = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
    } catch {
      toast.error('Erreur lors de la génération du PDF.');
    }
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) return (
    <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>
  );
  if (!stage) return (
    <Layout><div className="empty-state"><h3>Stage introuvable</h3></div></Layout>
  );

  const isEnseignantOuAdmin = user?.role === 'enseignant' || user?.role === 'admin';
  const canValider  = isEnseignantOuAdmin && stage.statut === 'en_attente';
  const canDemarrer = isEnseignantOuAdmin && stage.statut === 'valide';
  const canTerminer = isEnseignantOuAdmin && stage.statut === 'en_cours';
  const canEvaluer = isEnseignantOuAdmin && stage.statut === 'termine';
  const canUpload   = user?.role === 'etudiant' && stage.statut === 'en_cours';
  const canDownload = true;
  const canDelete   = user?.role === 'etudiant' && stage.statut === 'en_cours';

  return (
    <Layout>
      {/* ← Modal injecté ici, rendu uniquement si confirm() est en attente */}
      {ConfirmDialog}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/stages">Stages</Link>
        <ChevronRight size={14} />
        <span>{stage.titre}</span>
      </div>

      {/* ── Header ── */}
      <div className="sd-header">
        <div className="sd-header-left">
          <div className="sd-header-top">
            <h1 className="sd-title">{stage.titre}</h1>
            <Badge statut={stage.statut} />
          </div>
          {stage.raison_sociale && (
            <p className="sd-subtitle">
              {stage.raison_sociale}{stage.ville ? ` — ${stage.ville}` : ''}
            </p>
          )}
        </div>

        <div className="sd-header-actions">
          <button className="btn btn-ghost" onClick={handleExportPDF}>
            <FileText size={15} /> Fiche PDF
          </button>

          {user?.role === 'etudiant' && stage.statut === 'en_attente' && (
            <Link to={`/stages/${id}/modifier`} className="btn btn-ghost">Modifier</Link>
          )}

          {canDemarrer && (
            <button
              className="btn btn-primary"
              disabled={submitting}
              onClick={() => handleChangerStatut('en_cours')}
            >
              <PlayCircle size={15} /> Démarrer le stage
            </button>
          )}

          {canTerminer && (
            <button
              className="btn btn-warning"
              disabled={submitting}
              onClick={() => handleChangerStatut('termine')}
            >
              <StopCircle size={15} /> Terminer le stage
            </button>
          )}

        {canEvaluer && (
          <Link to={`/stages/${id}/evaluer`} className="btn-evaluer">
            <span className="btn-evaluer-inner">
              <Star size={15} fill="currentColor" />
              Évaluer le stage
            </span>
          </Link>
        )}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="sd-timeline-wrapper">
        <Timeline statut={stage.statut} />
      </div>

      {/* ── Alertes contextuelles ── */}
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
      {canDemarrer && (
        <div className="alert alert-info sd-alert">
          <PlayCircle size={16} />
          <div>
            Le stage est validé. Cliquez sur <strong>Démarrer le stage</strong> pour permettre
            à l'étudiant de déposer ses documents.
          </div>
        </div>
      )}
      {canTerminer && (
        <div className="alert alert-info sd-alert">
          <StopCircle size={16} />
          <div>
            Le stage est en cours. Cliquez sur <strong>Terminer le stage</strong> quand
            la période est terminée pour lancer l'évaluation.
          </div>
        </div>
      )}

      {/* ── Note finale ── */}
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

      {/* ── Grille d'infos ── */}
      <div className="sd-grid">
        <div className="sd-col-main">
          <div className="sd-row-2">
            <InfoBlock title="Étudiant">
              <p className="sd-info-name">{stage.etudiant_prenom} {stage.etudiant_nom}</p>
              <p className="sd-info-sub">{stage.etudiant_email}</p>
              {stage.formation && (
                <p className="sd-info-sub">
                  {stage.formation}{stage.annee_promotion ? ` · Promo ${stage.annee_promotion}` : ''}
                </p>
              )}
            </InfoBlock>

            <InfoBlock title="Période de stage">
              <p className="sd-info-name">{fmt(stage.date_debut)}</p>
              <p className="sd-info-sub">au {fmt(stage.date_fin)}</p>
              {stage.enseignant_nom && (
                <p className="sd-info-sub" style={{ marginTop: 8 }}>
                  Référent : {stage.enseignant_prenom} {stage.enseignant_nom}
                </p>
              )}
            </InfoBlock>
          </div>

          <InfoBlock title="Entreprise d'accueil">
            <div className="sd-row-2">
              <div>
                <p className="sd-info-name">{stage.raison_sociale || '—'}</p>
                {stage.secteur_activite && <p className="sd-info-sub">{stage.secteur_activite}</p>}
                {stage.ville && (
                  <p className="sd-info-sub">
                    {stage.adresse ? `${stage.adresse}, ` : ''}{stage.ville} {stage.code_postal}
                  </p>
                )}
                {stage.siret && <p className="sd-info-sub">SIRET : {stage.siret}</p>}
              </div>
              <div>
                <p className="sd-info-label">Tuteur entreprise</p>
                <p className="sd-info-name">
                  {stage.tuteur_prenom || '—'} {stage.tuteur_nom || ''}
                </p>
                {stage.tuteur_telephone && <p className="sd-info-sub">{stage.tuteur_telephone}</p>}
                {stage.tuteur_email && <p className="sd-info-sub">{stage.tuteur_email}</p>}
                {stage.tuteur_poste && <p className="sd-info-sub">{stage.tuteur_poste}</p>}
              </div>
            </div>
          </InfoBlock>

          {(stage.description || stage.missions) && (
            <InfoBlock title="Description & Missions">
              {stage.description && <p className="sd-description">{stage.description}</p>}
              {stage.missions    && <p className="sd-missions">{stage.missions}</p>}
            </InfoBlock>
          )}

          {['en_cours', 'termine', 'evalue'].includes(stage.statut) && (
          <InfoBlock title={`Rapport de stage pour la notation de l'enseignant (${stage.documents?.length || 0})`}>
            {user?.role === 'etudiant' && stage.statut === 'valide' && (
              <div className="alert alert-info" style={{ marginBottom: 12 }}>
                <Clock size={14} />
                <span>
                  Le stage doit être <strong>démarré par votre enseignant</strong> avant
                  que vous puissiez déposer des documents.
                </span>
              </div>
            )}

            {canUpload && (
              <label className="sd-upload-btn">
                <Upload size={14} /> Déposer un document
                <input
                  type="file"
                  hidden
                  accept=".pdf,.docx,.doc,.zip"
                  onChange={handleUpload}
                />
              </label>
            )}

            {!stage.documents?.length ? (
              <p className="sd-info-sub" style={{ marginTop: canUpload ? 12 : 0 }}>
                Aucun document déposé.
              </p>
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
                    <div className="sd-doc-actions">
                      {canDownload && (
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Télécharger"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-ghost btn-sm btn-danger-ghost"
                          title="Supprimer"
                          // ← on passe le nom du fichier pour l'afficher dans le modal
                          onClick={() => handleDeleteDoc(doc.id_document, doc.nom_original)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoBlock>
          )}
        </div>

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
                <button
                  className="btn btn-success"
                  disabled={submitting}
                  onClick={() => handleValider('valide')}
                >
                  <CheckCircle size={15} /> Valider le stage
                </button>
                <button
                  className="btn btn-danger"
                  disabled={submitting}
                  onClick={() => handleValider('refuse')}
                >
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
