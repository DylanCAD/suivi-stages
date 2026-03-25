const { pool } = require('../config/database');

// ════════════════════════════════════════════════
// GET /api/export/stage/:id
// Génère un HTML que le navigateur peut imprimer en PDF
// ════════════════════════════════════════════════
const exportStagePDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_utilisateur, role } = req.user;

    const [rows] = await pool.execute(`
      SELECT s.*,
        ue.nom AS et_nom, ue.prenom AS et_prenom, ue.email AS et_email,
        et.formation, et.numero_etudiant, et.annee_promotion,
        uen.nom AS en_nom, uen.prenom AS en_prenom, uen.email AS en_email,
        en_ref.departement, en_ref.specialite, en_ref.bureau,
        ut.nom AS tu_nom, ut.prenom AS tu_prenom, ut.email AS tu_email,
        tut.poste,
        ent.raison_sociale, ent.siret, ent.secteur_activite,
        ent.adresse, ent.ville, ent.code_postal,
        ev.note_finale, ev.note_tuteur, ev.note_enseignant,
        ev.commentaire_tuteur, ev.commentaire_enseignant
      FROM stages s
      LEFT JOIN etudiants    et   ON s.id_etudiant   = et.id_utilisateur
      LEFT JOIN utilisateurs ue   ON et.id_utilisateur = ue.id_utilisateur
      LEFT JOIN enseignants  en_ref ON s.id_enseignant = en_ref.id_utilisateur
      LEFT JOIN utilisateurs uen  ON en_ref.id_utilisateur = uen.id_utilisateur
      LEFT JOIN tuteurs      tut  ON s.id_tuteur      = tut.id_utilisateur
      LEFT JOIN utilisateurs ut   ON tut.id_utilisateur = ut.id_utilisateur
      LEFT JOIN entreprises  ent  ON s.id_entreprise  = ent.id_entreprise
      LEFT JOIN evaluations  ev   ON s.id_stage       = ev.id_stage
      WHERE s.id_stage = ?`, [id]);

    if (!rows.length) return res.status(404).json({ message: 'Stage introuvable.' });

    const s = rows[0];

    // Vérifie les droits
    if (role === 'etudiant' && s.id_etudiant !== id_utilisateur) return res.status(403).json({ message: 'Accès refusé.' });

    const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const statuts = { en_attente:'En attente', valide:'Validé', refuse:'Refusé', en_cours:'En cours', termine:'Terminé', evalue:'Évalué' };
    const statusColors = { en_attente:'#d97706', valide:'#059669', refuse:'#dc2626', en_cours:'#2563eb', termine:'#64748b', evalue:'#7c3aed' };

    // ── HTML de la fiche PDF ──
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Fiche de stage — ${s.titre}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a; background: white; padding: 40px; }
  .header { background: #1a1f3e; color: white; padding: 24px 28px; border-radius: 8px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
  .header-logo { font-family: 'Space Mono', monospace; font-size: 1rem; font-weight: 700; color: white; background: #2563eb; padding: 4px 10px; border-radius: 4px; }
  .header-info h1 { font-family: 'Space Mono', monospace; font-size: 1rem; color: white; margin-top: 8px; }
  .header-info p  { font-size: 0.78rem; color: #94a3b8; margin-top: 3px; }
  .header-right { text-align: right; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: ${statusColors[s.statut]}20; color: ${statusColors[s.statut]}; }
  .section { margin-bottom: 20px; }
  .section-title { font-family: 'Space Mono', monospace; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #e2e8f0; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; }
  .info-block h4 { font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .info-block p  { font-size: 0.875rem; color: #0f172a; line-height: 1.5; }
  .info-block .main { font-weight: 700; font-size: 0.95rem; }
  .note-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .note-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center; }
  .note-card .val { font-family: 'Space Mono', monospace; font-size: 1.8rem; font-weight: 700; color: #2563eb; }
  .note-card .lbl { font-size: 0.72rem; color: #64748b; margin-top: 3px; }
  .note-card.final .val { color: #059669; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 0.72rem; color: #94a3b8; }
  .sign-zone { border: 1px dashed #cbd5e1; border-radius: 6px; padding: 20px 28px; text-align: center; }
  .sign-zone p { font-size: 0.72rem; color: #94a3b8; }
  @media print { body { padding: 20px; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>

<!-- En-tête -->
<div class="header">
  <div>
    <div class="header-logo">StageTrack</div>
    <h1 class="header-info" style="margin-top:8px">${s.titre}</h1>
    <p style="color:#94a3b8;font-size:0.78rem;margin-top:3px">Fiche de stage — Générée le ${fmt(new Date())}</p>
  </div>
  <div style="text-align:right">
    <div class="status-badge">${statuts[s.statut] || s.statut}</div>
    <p style="color:#94a3b8;font-size:0.72rem;margin-top:8px">Année ${s.annee_scolaire || '—'}</p>
    <p style="color:#94a3b8;font-size:0.72rem">Stage #${s.id_stage}</p>
  </div>
</div>

<!-- Étudiant & Période -->
<div class="section">
  <div class="section-title">Informations générales</div>
  <div class="grid-2">
    <div class="info-block">
      <h4>Étudiant</h4>
      <p class="main">${s.et_prenom} ${s.et_nom}</p>
      <p>${s.et_email}</p>
      <p>${s.formation || '—'} · Promo ${s.annee_promotion || '—'}</p>
      ${s.numero_etudiant ? `<p>N° étudiant : ${s.numero_etudiant}</p>` : ''}
    </div>
    <div class="info-block">
      <h4>Période de stage</h4>
      <p class="main">${fmt(s.date_debut)} → ${fmt(s.date_fin)}</p>
      <p>Enseignant référent : ${s.en_prenom || '—'} ${s.en_nom || ''}</p>
      ${s.departement ? `<p>Département : ${s.departement}</p>` : ''}
    </div>
  </div>
</div>

<!-- Entreprise -->
<div class="section">
  <div class="section-title">Entreprise d'accueil</div>
  <div class="grid-2">
    <div class="info-block">
      <h4>Entreprise</h4>
      <p class="main">${s.raison_sociale || '—'}</p>
      ${s.siret ? `<p>SIRET : ${s.siret}</p>` : ''}
      ${s.secteur_activite ? `<p>${s.secteur_activite}</p>` : ''}
      ${s.ville ? `<p>${s.adresse || ''} ${s.ville} ${s.code_postal || ''}</p>` : ''}
    </div>
    <div class="info-block">
      <h4>Tuteur entreprise</h4>
      <p class="main">${s.tu_prenom || '—'} ${s.tu_nom || ''}</p>
      ${s.tu_email  ? `<p>${s.tu_email}</p>` : ''}
      ${s.poste     ? `<p>${s.poste}</p>`   : ''}
    </div>
  </div>
</div>

<!-- Description & Missions -->
${s.description || s.missions ? `
<div class="section">
  <div class="section-title">Description & Missions</div>
  <div class="info-block">
    ${s.description ? `<p style="margin-bottom:8px">${s.description}</p>` : ''}
    ${s.missions    ? `<p style="color:#64748b">${s.missions}</p>` : ''}
  </div>
</div>` : ''}

<!-- Évaluation -->
${s.note_finale !== null ? `
<div class="section">
  <div class="section-title">Évaluation</div>
  <div class="note-grid">
    <div class="note-card">
      <div class="val">${s.note_tuteur ?? '—'}<span style="font-size:1rem">/20</span></div>
      <div class="lbl">Note tuteur (40%)</div>
    </div>
    <div class="note-card">
      <div class="val">${s.note_enseignant ?? '—'}<span style="font-size:1rem">/20</span></div>
      <div class="lbl">Note enseignant (60%)</div>
    </div>
    <div class="note-card final">
      <div class="val">${s.note_finale ?? '—'}<span style="font-size:1rem">/20</span></div>
      <div class="lbl">Note finale</div>
    </div>
  </div>
  ${s.commentaire_enseignant ? `<div class="info-block" style="margin-top:12px"><h4>Commentaire enseignant</h4><p>${s.commentaire_enseignant}</p></div>` : ''}
</div>` : ''}

<!-- Signatures -->
<div class="section" style="margin-top:32px">
  <div class="section-title">Signatures</div>
  <div class="grid-2" style="gap:20px">
    <div class="sign-zone">
      <p>Signature de l'étudiant</p>
      <div style="height:50px"></div>
      <p>${s.et_prenom} ${s.et_nom}</p>
    </div>
    <div class="sign-zone">
      <p>Signature de l'enseignant référent</p>
      <div style="height:50px"></div>
      <p>${s.en_prenom || '—'} ${s.en_nom || ''}</p>
    </div>
  </div>
</div>

<div class="footer">
  <p>StageTrack — Application de suivi des stages</p>
  <p>Document généré le ${fmt(new Date())} — Stage #${s.id_stage}</p>
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  } catch (e) { next(e); }
};

// ════════════════════════════════════════════════
// GET /api/export/stages-csv
// Export CSV de tous les stages (admin)
// ════════════════════════════════════════════════
const exportStagesCSV = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.id_stage, s.titre, s.statut, s.date_debut, s.date_fin, s.annee_scolaire,
        CONCAT(ue.prenom,' ',ue.nom) AS etudiant,
        et.formation,
        CONCAT(uen.prenom,' ',uen.nom) AS enseignant,
        ent.raison_sociale AS entreprise, ent.ville,
        ev.note_finale
      FROM stages s
      LEFT JOIN etudiants    et  ON s.id_etudiant   = et.id_utilisateur
      LEFT JOIN utilisateurs ue  ON et.id_utilisateur = ue.id_utilisateur
      LEFT JOIN utilisateurs uen ON s.id_enseignant  = uen.id_utilisateur
      LEFT JOIN entreprises  ent ON s.id_entreprise  = ent.id_entreprise
      LEFT JOIN evaluations  ev  ON s.id_stage       = ev.id_stage
      ORDER BY s.annee_scolaire DESC, s.created_at DESC`);

    const headers = ['ID','Titre','Statut','Étudiant','Formation','Enseignant','Entreprise','Ville','Date début','Date fin','Année scolaire','Note finale'];
    const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '';

    const lines = [
      headers.join(';'),
      ...rows.map(r => [
        r.id_stage, `"${r.titre}"`, r.statut, `"${r.etudiant}"`, `"${r.formation || ''}"`,
        `"${r.enseignant || ''}"`, `"${r.entreprise || ''}"`, r.ville || '',
        fmt(r.date_debut), fmt(r.date_fin), r.annee_scolaire || '', r.note_finale ?? ''
      ].join(';'))
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="stages_export_${Date.now()}.csv"`);
    res.send('\uFEFF' + lines.join('\n')); // BOM pour Excel

  } catch (e) { next(e); }
};

module.exports = { exportStagePDF, exportStagesCSV };