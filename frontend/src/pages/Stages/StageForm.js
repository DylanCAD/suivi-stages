import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { stageAPI } from '../../services/api';
import Layout from '../../components/Layout/Layout';

const STEPS = ['Infos stage', 'Entreprise', 'Récapitulatif'];

const StageForm = () => {
  const { id }     = useParams(); // si présent = mode édition
  const navigate   = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState({});

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();

  // Mode édition : pré-remplit le formulaire
  useEffect(() => {
    if (id) {
      stageAPI.getById(id).then(res => {
        const s = res.data.stage;
        reset({
          titre: s.titre, description: s.description, missions: s.missions,
          date_debut: s.date_debut?.split('T')[0],
          date_fin: s.date_fin?.split('T')[0],
          raison_sociale: s.raison_sociale, siret: s.siret,
          secteur_activite: s.secteur_activite, ville: s.ville,
          code_postal: s.code_postal,
        });
      });
    }
  }, [id]);

  // Sauvegarde les données de l'étape courante et passe à la suivante
  const nextStep = handleSubmit((stepData) => {
    setData(prev => ({ ...prev, ...stepData }));
    if (step < STEPS.length - 1) setStep(s => s + 1);
  });

  const prevStep = () => setStep(s => s - 1);

  // Soumission finale
  const submitFinal = async () => {
    setLoading(true);
    try {
      if (id) {
        await stageAPI.update(id, data);
        toast.success('✅ Stage mis à jour !');
      } else {
        const res = await stageAPI.create(data);
        toast.success('✅ Stage déclaré avec succès !');
      }
      navigate('/stages');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  const dateDebut = watch('date_debut');

  return (
    <Layout>
      <div className="breadcrumb">
        <a href="/stages">Stages</a>
        <span className="breadcrumb-sep">›</span>
        <span>{id ? 'Modifier le stage' : 'Déclarer un stage'}</span>
      </div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>
        {id ? '✏️ Modifier le stage' : '+ Déclarer un stage'}
      </h1>

      {/* ── Stepper ── */}
      <div className="stepper" style={{ marginBottom: 32 }}>
        {STEPS.map((label, i) => (
          <div key={i} className={`stepper-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="stepper-circle">{i < step ? '✓' : i + 1}</div>
            <div className="stepper-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-body">

          {/* ════ ÉTAPE 0 : Informations du stage ════ */}
          {step === 0 && (
            <form onSubmit={nextStep}>
              <h3 style={{ marginBottom: 20 }}>📋 Informations du stage</h3>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Titre du stage <span className="req">*</span></label>
                <input
                  className={`form-control ${errors.titre ? 'error' : ''}`}
                  placeholder="Ex: Développeur Full-Stack"
                  {...register('titre', { required: 'Titre obligatoire.' })}
                />
                {errors.titre && <span className="form-error">⚠ {errors.titre.message}</span>}
              </div>

              <div className="form-row" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Date de début <span className="req">*</span></label>
                  <input
                    type="date"
                    className={`form-control ${errors.date_debut ? 'error' : ''}`}
                    {...register('date_debut', { required: 'Date de début obligatoire.' })}
                  />
                  {errors.date_debut && <span className="form-error">⚠ {errors.date_debut.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date de fin <span className="req">*</span></label>
                  <input
                    type="date"
                    className={`form-control ${errors.date_fin ? 'error' : ''}`}
                    {...register('date_fin', {
                      required: 'Date de fin obligatoire.',
                      validate: v => !dateDebut || v > dateDebut || 'La fin doit être après le début.'
                    })}
                  />
                  {errors.date_fin && <span className="form-error">⚠ {errors.date_fin.message}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Décrivez le contexte du stage…"
                  {...register('description')}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Missions</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Listez les missions principales…"
                  {...register('missions')}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">Suivant →</button>
              </div>
            </form>
          )}

          {/* ════ ÉTAPE 1 : Entreprise ════ */}
          {step === 1 && (
            <form onSubmit={nextStep}>
              <h3 style={{ marginBottom: 20 }}>🏢 Informations entreprise</h3>

              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                ℹ️ Renseignez les coordonnées de votre entreprise d'accueil.
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Raison sociale <span className="req">*</span></label>
                <input
                  className={`form-control ${errors.raison_sociale ? 'error' : ''}`}
                  placeholder="Ex: Capgemini France SAS"
                  {...register('raison_sociale', { required: 'Raison sociale obligatoire.' })}
                />
                {errors.raison_sociale && <span className="form-error">⚠ {errors.raison_sociale.message}</span>}
              </div>

              <div className="form-row" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">SIRET (14 chiffres)</label>
                  <input
                    className="form-control"
                    placeholder="44229342600031"
                    {...register('siret', {
                      pattern: { value: /^\d{14}$/, message: 'SIRET invalide (14 chiffres).' }
                    })}
                  />
                  {errors.siret && <span className="form-error">⚠ {errors.siret.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Secteur d'activité</label>
                  <select className="form-control" {...register('secteur_activite')}>
                    <option value="">— Choisir —</option>
                    <option>Services numériques</option>
                    <option>Télécommunications</option>
                    <option>Conseil IT</option>
                    <option>Finance & Banque</option>
                    <option>Industrie</option>
                    <option>Commerce</option>
                    <option>Santé</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 24 }}>
                <div className="form-group">
                  <label className="form-label">Ville</label>
                  <input className="form-control" placeholder="Bordeaux" {...register('ville')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Code postal</label>
                  <input className="form-control" placeholder="33000" {...register('code_postal')} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-ghost" onClick={prevStep}>← Précédent</button>
                <button type="submit" className="btn btn-primary">Suivant →</button>
              </div>
            </form>
          )}

          {/* ════ ÉTAPE 2 : Récapitulatif ════ */}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: 20 }}>✅ Récapitulatif</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Stage</div>
                  <div style={{ fontWeight: 700 }}>{data.titre}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                    {data.date_debut && new Date(data.date_debut).toLocaleDateString('fr-FR')} → {data.date_fin && new Date(data.date_fin).toLocaleDateString('fr-FR')}
                  </div>
                  {data.description && <div style={{ marginTop: 6, fontSize: '0.82rem' }}>{data.description}</div>}
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Entreprise</div>
                  <div style={{ fontWeight: 700 }}>{data.raison_sociale || '—'}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                    {data.secteur_activite && `${data.secteur_activite} · `}{data.ville} {data.code_postal}
                  </div>
                </div>
              </div>

              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                ℹ️ En soumettant, votre stage sera envoyé à votre enseignant référent pour validation.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={prevStep}>← Précédent</button>
                <button className="btn btn-success" onClick={submitFinal} disabled={loading}>
                  {loading ? '⏳ Envoi…' : '🚀 Soumettre le stage'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StageForm;