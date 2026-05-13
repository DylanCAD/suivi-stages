import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

import logo from '../assets/logo.png';

import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const annee = new Date().getFullYear();
  const [modalOpen, setModalOpen] = useState(null);
  const { user } = useAuth();

  const modals = {
    mentions: {
      titre: 'Mentions légales',
      contenu: (
        <>
          <p><strong>Éditeur de l'application :</strong> StageTrack — Application de suivi de stages développée dans le cadre d'un projet pédagogique.</p>
          <p><strong>Responsable de la publication :</strong> L'équipe de développement StageTrack.</p>
          <p><strong>Hébergement :</strong> Serveur local / infrastructure de l'établissement.</p>
          <p><strong>Utilisation des cookies :</strong> StageTrack utilise uniquement des cookies fonctionnels nécessaires au bon fonctionnement de l'application (authentification, session utilisateur). Ces cookies ne nécessitent pas votre consentement préalable et ne sont jamais partagés avec des tiers.</p>
          <p><strong>Accessibilité :</strong> Nous nous efforçons de rendre StageTrack accessible à tous les utilisateurs. Pour signaler un problème d'accessibilité, contactez votre référent pédagogique.</p>
        </>
      ),
    },
    confidentialite: {
      titre: 'Politique de confidentialité',
      contenu: (
        <>
          <p><strong>Données collectées :</strong> StageTrack collecte uniquement les données nécessaires au suivi des stages : nom, prénom, email, informations de stage, documents associés et échanges dans le cadre du suivi pédagogique.</p>
          <p><strong>Finalité :</strong> Ces données sont utilisées exclusivement pour la gestion et le suivi des stages au sein de l'établissement.</p>
          <p><strong>Conservation :</strong> Les données sont conservées pour la durée de votre scolarité et archivées conformément à la réglementation en vigueur.</p>
          <p><strong>Vos droits :</strong> Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez votre établissement pour exercer ces droits.</p>
          <p><strong>Partage des données :</strong> Aucune donnée personnelle n'est vendue ni partagée avec des tiers extérieurs à l'établissement.</p>
        </>
      ),
    },
    cgu: {
      titre: "Conditions générales d'utilisation",
      contenu: (
        <>
          <p><strong>Accès à l'application :</strong> StageTrack est réservé aux étudiants, enseignants, tuteurs et administrateurs de l'établissement disposant d'un compte valide.</p>
          <p><strong>Utilisation :</strong> L'application est mise à disposition pour la gestion pédagogique des stages. Toute utilisation à des fins autres que l'usage pédagogique est interdite.</p>
          <p><strong>Responsabilités :</strong> L'utilisateur est responsable de la confidentialité de ses identifiants et de l'exactitude des informations qu'il renseigne.</p>
          <p><strong>Contenu :</strong> Les documents et informations déposés dans StageTrack doivent être conformes à la réglementation en vigueur. Tout contenu illicite est interdit.</p>
          <p><strong>Disponibilité :</strong> L'établissement s'efforce d'assurer la disponibilité de l'application mais ne peut garantir un accès ininterrompu.</p>
        </>
      ),
    },
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-inner">

          {/* Colonne marque */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="StageTrack" className="footer-logo-img" />
              <span>StageTrack</span>
            </div>
            <p className="footer-tagline">Suivi pédagogique des stages, simplifié pour tous.</p>
          </div>

          {/* Colonne navigation */}
          <div className="footer-col">
            <div className="footer-col-title">Navigation</div>
            <Link to="/dashboard" className="footer-link">Tableau de bord</Link>
            <Link to="/stages"    className="footer-link">Stages</Link>
            <Link to="/profile"   className="footer-link">Mon profil</Link>
            {user?.role === 'admin' && (
              <Link to="/admin/users" className="footer-link">Administration</Link>
            )}
          </div>

          {/* Colonne légal */}
          <div className="footer-col">
            <div className="footer-col-title">Légal</div>
            <button className="footer-link footer-link-btn" onClick={() => setModalOpen('mentions')}>
              Mentions légales
            </button>
            <button className="footer-link footer-link-btn" onClick={() => setModalOpen('confidentialite')}>
              Politique de confidentialité
            </button>
            <button className="footer-link footer-link-btn" onClick={() => setModalOpen('cgu')}>
              CGU
            </button>
          </div>

        </div>

        <div className="footer-bottom">
          <span>© {annee} StageTrack — Tous droits réservés</span>
          <span className="footer-sep">·</span>
          <span>Application de suivi de stages</span>
        </div>
      </footer>

      {/* Modal */}
      {modalOpen && (
      <div
        className="footer-modal-overlay"
        onClick={() => setModalOpen(null)}
        onKeyDown={(e) => e.key === 'Escape' && setModalOpen(null)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titre"
        tabIndex={-1}
      >
        <div
          className="footer-modal"
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
          role="document"
        >
          <div className="footer-modal-header">
            <h2 id="modal-titre">{modals[modalOpen].titre}</h2>
            <button className="footer-modal-close" onClick={() => setModalOpen(null)} aria-label="Fermer">✕</button>
          </div>
          <div className="footer-modal-body">
            {modals[modalOpen].contenu}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Footer;