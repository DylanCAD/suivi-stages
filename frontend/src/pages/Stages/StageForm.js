import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { stageAPI } from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { ChevronRight, Check, Building2, FileText, ClipboardCheck } from 'lucide-react';
import './Stages.css';

const STEPS = [
  { label: 'Informations',  icon: FileText      },
  { label: 'Entreprise',    icon: Building2     },
  { label: 'Récapitulatif', icon: ClipboardCheck },
];

const StageForm = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState({});

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();

  useEffect(() => {
    if (id) {
      stageAPI.getById(id).then(res => {
        const s = res.data.stage;
        reset({
          titre: s.titre, description: s.description, missions: s.missions,
          date_debut: s.date_debut?.split('T')[0],
          date_fin:   s.date_fin?.split('T')[0],
          raison_sociale: s.raison_sociale, siret: s.siret,
          secteur_activite: s.secteur_activite, ville: s.ville,
          code_postal: s.code_postal,
        });
      });
    }
  }, [id]);

  const nextStep = handleSubmit((stepData) => {
    setData(prev => ({ ...prev, ...stepData }));
    if (step < STEPS.length - 1) setStep(s => s + 1);
  });

  const prevStep = () => setStep(s => s - 1);

  const submitFinal = async () => {
    setLoading(true);
    try {
      if (id) {
        await stageAPI.update(id, data);
        toast.success('Stage mis à jour.');
      } else {
        await stageAPI.create(data);
        toast.success('Stage déclaré avec succès.');
      }
      navigate('/stages');
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de l'envoi.");
    } finally { setLoading(false); }
  };

  const dateDebut = watch('date_debut');

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/stages">Stages</Link>
        <ChevronRight size={14} />
        <span>{id ? 'Modifier le stage' : 'Déclarer un stage'}</span>
      </div>

      <h1 className="page-title" style={{ marginBottom: 32 }}>
        {id ? 'Modifier le stage' : 'Déclarer un stage'}
      </h1>

      {/* Stepper */}
      <div className="sf-stepper">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done    = i < step;
          const current = i === step;
          return (
            <React.Fragment key={i}>
              <div className={`sf-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                <div className="sf-step-dot">
                  {done ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span className="sf-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`sf-step-line ${done ? 'done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Barre de progression */}
      <div className="sf-progress">
        <div className="sf-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div className="sf-card">

        {/* ── ÉTAPE 0 : Infos stage ── */}
        {step === 0 && (
          <form onSubmit={nextStep}>
            <div className="sf-section-title">Informations du stage</div>

            <div className="form-group sf-field">
              <label className="form-label">Titre du poste <span className="req">*</span></label>
              <input
                className={`form-control ${errors.titre ? 'error' : ''}`}
                placeholder="Ex : Développeur Full-Stack"
                {...register('titre', { required: 'Titre obligatoire.' })}
              />
              {errors.titre && <span className="form-error">{errors.titre.message}</span>}
            </div>

            <div className="form-row sf-field">
              <div className="form-group">
                <label className="form-label">Date de début <span className="req">*</span></label>
                <input type="date" className={`form-control ${errors.date_debut ? 'error' : ''}`}
                  {...register('date_debut', { required: 'Date de début obligatoire.' })} />
                {errors.date_debut && <span className="form-error">{errors.date_debut.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Date de fin <span className="req">*</span></label>
                <input type="date" className={`form-control ${errors.date_fin ? 'error' : ''}`}
                  {...register('date_fin', {
                    required: 'Date de fin obligatoire.',
                    validate: v => !dateDebut || v > dateDebut || 'La fin doit être après le début.'
                  })} />
                {errors.date_fin && <span className="form-error">{errors.date_fin.message}</span>}
              </div>
            </div>

            <div className="form-group sf-field">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={4}
                placeholder="Décrivez le contexte et les objectifs du stage…"
                {...register('description')} />
            </div>

            <div className="form-group sf-field">
              <label className="form-label">Missions principales</label>
              <textarea className="form-control" rows={4}
                placeholder="Listez les missions que vous allez réaliser…"
                {...register('missions')} />
            </div>

            <div className="sf-actions">
              <div />
              <button type="submit" className="btn btn-primary">
                Suivant <ChevronRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* ── ÉTAPE 1 : Entreprise ── */}
        {step === 1 && (
          <form onSubmit={nextStep}>
            <div className="sf-section-title">Entreprise d'accueil</div>

            <div className="form-group sf-field">
              <label className="form-label">Raison sociale <span className="req">*</span></label>
              <input className={`form-control ${errors.raison_sociale ? 'error' : ''}`}
                placeholder="Ex : Capgemini France SAS"
                {...register('raison_sociale', { required: 'Raison sociale obligatoire.' })} />
              {errors.raison_sociale && <span className="form-error">{errors.raison_sociale.message}</span>}
            </div>

            <div className="form-row sf-field">
              <div className="form-group">
                <label className="form-label">SIRET (14 chiffres)</label>
                <input className="form-control" placeholder="44229342600031"
                  {...register('siret', {
                    pattern: { value: /^\d{14}$/, message: 'SIRET invalide (14 chiffres).' }
                  })} />
                {errors.siret && <span className="form-error">{errors.siret.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Secteur d'activité</label>
                <select className="form-control" {...register('secteur_activite')}>
                  <option value="">— Sélectionner —</option>
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

            <div className="form-row sf-field">
              <div className="form-group">
                <label className="form-label">Ville</label>
                <input className="form-control" placeholder="Bordeaux" {...register('ville')} />
              </div>
              <div className="form-group">
                <label className="form-label">Code postal</label>
                <input className="form-control" placeholder="33000" {...register('code_postal')} />
              </div>
            </div>

            <div className="sf-actions">
              <button type="button" className="btn btn-ghost" onClick={prevStep}>← Précédent</button>
              <button type="submit" className="btn btn-primary">Suivant <ChevronRight size={15} /></button>
            </div>
          </form>
        )}

        {/* ── ÉTAPE 2 : Récapitulatif ── */}
        {step === 2 && (
          <div>
            <div className="sf-section-title">Récapitulatif</div>

            <div className="sf-recap-grid">
              <div className="sf-recap-block">
                <div className="sf-recap-label">Stage</div>
                <div className="sf-recap-value">{data.titre}</div>
                <div className="sf-recap-sub">
                  {data.date_debut && new Date(data.date_debut).toLocaleDateString('fr-FR')}
                  {' → '}
                  {data.date_fin && new Date(data.date_fin).toLocaleDateString('fr-FR')}
                </div>
                {data.description && <div className="sf-recap-desc">{data.description}</div>}
              </div>

              <div className="sf-recap-block">
                <div className="sf-recap-label">Entreprise</div>
                <div className="sf-recap-value">{data.raison_sociale || '—'}</div>
                {data.secteur_activite && <div className="sf-recap-sub">{data.secteur_activite}</div>}
                {data.ville && <div className="sf-recap-sub">{data.ville} {data.code_postal}</div>}
              </div>
            </div>

            <div className="alert alert-info sf-field">
              En soumettant ce formulaire, votre stage sera transmis à votre enseignant référent pour validation.
            </div>

            <div className="sf-actions">
              <button className="btn btn-ghost" onClick={prevStep}>← Précédent</button>
              <button className="btn btn-success" onClick={submitFinal} disabled={loading}>
                {loading
                  ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Envoi…</>
                  : <><Check size={15} /> Soumettre le stage</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StageForm;