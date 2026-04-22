# StageTrack — Application de suivi des stages

> Projet réalisé par **Dylan Cadot** dans le cadre du M2-DI
> Application web full-stack de gestion et suivi des stages étudiants

---

## Présentation

StageTrack est une application web permettant de gérer le cycle complet d'un stage :  
déclaration -> validation -> suivi -> évaluation -> archivage.

### Rôles utilisateurs
| Rôle | Accès |
|---|---|
| Étudiant | Déclare ses stages, dépose des documents |
| Enseignant | Valide les dossiers, évalue les stages |
| Tuteur | Évalue le stagiaire via un lien sécurisé |
| Admin | Gère tous les utilisateurs et toutes les données |

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, React Router v6, React Hook Form |
| Backend | Node.js, Express.js |
| Base de données | MySQL 8.0 |
| Authentification | JWT (access + refresh tokens) |
| Styles | CSS custom (variables CSS) |

---

## Installation

### Prérequis
- Node.js 18+
- MySQL 8.0+
- Git

### 1. Cloner le projet
```bash
git clone https://github.com/DylanCAD/suivi-stages.git
cd suivi-stages
```

### 2. Base de données
Ouvrir MySQL Workbench et exécuter le script :
```
database.sql
```

### 3. Backend
```bash
cd backend
npm install
```

Créer le fichier `.env` :
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ton_mot_de_passe
DB_NAME=suivi_stages
JWT_SECRET=une_cle_secrete_longue_et_aleatoire
JWT_REFRESH_SECRET=une_autre_cle_secrete
FRONTEND_URL=http://localhost:3000
```

Lancer le serveur :
```bash
npm run dev
```

### 4. Frontend
```bash
cd ../frontend
npm install
npm start
```

L'application s'ouvre sur **http://localhost:3000**

---

## Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@suivi-stages.fr | Password123! |
| Enseignant | j.perrin@suivi-stages.fr | Password123! |
| Étudiant | marie.dupont@etudiant.fr | Password123! |
| Tuteur | p.moreau@capgemini.com | Password123! |

---

## Structure du projet

```
suivi-stages/
├── backend/
│   ├── src/
│   │   ├── config/        # Connexion MySQL
│   │   ├── controllers/   # Logique métier
│   │   ├── middleware/    # Auth JWT, upload
│   │   ├── routes/        # Endpoints API
│   │   └── server.js      # Point d'entrée
│   └── .env
├── frontend/
│   └── src/
│       ├── components/    # Layout, Navbar, Sidebar
│       ├── context/       # AuthContext
│       ├── pages/         # Login, Dashboard, Stages...
│       └── services/      # Appels API (axios)
└── database.sql           # Schéma + données de test
```

---

## API — Principaux endpoints

| Méthode | Route | Description |
|---|---|---|
| POST | /api/auth/login | Connexion |
| GET | /api/stages | Liste des stages |
| POST | /api/stages | Créer un stage |
| PUT | /api/stages/:id/valider | Valider/Refuser |
| POST | /api/evaluations/:id/enseignant | Noter |
| GET | /api/export/stage/:id | Fiche PDF |
| GET | /api/export/stages-csv | Export CSV (admin) |

---

## Licence
Projet scolaire — M2-DI

##
Teste Unitaire Jest :
“J’ai mis en place des tests unitaires automatisés avec Jest, exécutés automatiquement à chaque push via un pipeline CI/CD.”
Tu codes
   ↓
Tu push GitHub
   ↓
CI (tests automatiques)
   ↓
OK → CD (déploiement)

cd C:\suivi-stages\backend
npm test
