const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// ─── Génère un access token (durée courte : 2h) ───
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id_utilisateur, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
};

// ─── Génère un refresh token (durée longue : 7 jours) ───
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id_utilisateur },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// ════════════════════════════════════════════════
// POST /api/auth/login
// ════════════════════════════════════════════════
const login = async (req, res, next) => {
  try {
    // 1. Valide les données envoyées
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Données invalides.', errors: errors.array() });
    }

    const { email, mot_de_passe } = req.body;

    // 2. Cherche l'utilisateur par email
    const [rows] = await pool.execute(
      `SELECT u.*, 
              CASE 
                WHEN u.role = 'etudiant'     THEN e.formation
                WHEN u.role = 'enseignant'   THEN en.departement
                WHEN u.role = 'tuteur'       THEN t.poste
                ELSE NULL
              END as info_role
       FROM utilisateurs u
       LEFT JOIN etudiants e  ON u.id_utilisateur = e.id_utilisateur
       LEFT JOIN enseignants en ON u.id_utilisateur = en.id_utilisateur
       LEFT JOIN tuteurs t    ON u.id_utilisateur = t.id_utilisateur
       WHERE u.email = ?`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const user = rows[0];

    // 3. Vérifie que le compte est actif
    if (!user.actif) {
      return res.status(403).json({ message: 'Compte désactivé. Contactez l\'administration.' });
    }

    // 4. Compare le mot de passe avec le hash bcrypt
    const motDePasseValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // 5. Génère les tokens
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 6. Sauvegarde le refresh token en base
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 jours
    await pool.execute(
      'UPDATE utilisateurs SET refresh_token = ?, token_expiry = ? WHERE id_utilisateur = ?',
      [refreshToken, expiry, user.id_utilisateur]
    );

    // 7. Répond avec les infos (sans le mot de passe !)
    res.json({
      message: 'Connexion réussie.',
      accessToken,
      refreshToken,
      user: {
        id:        user.id_utilisateur,
        nom:       user.nom,
        prenom:    user.prenom,
        email:     user.email,
        role:      user.role,
        info_role: user.info_role
      }
    });

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// POST /api/auth/refresh
// Renouvelle l'access token avec le refresh token
// ════════════════════════════════════════════════
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token manquant.' });
    }

    // Vérifie le refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Vérifie qu'il correspond bien à celui en base
    const [rows] = await pool.execute(
      'SELECT * FROM utilisateurs WHERE id_utilisateur = ? AND refresh_token = ? AND token_expiry > NOW()',
      [decoded.id, token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Refresh token invalide ou expiré.' });
    }

    const user = rows[0];
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token invalide.' });
    }
    next(error);
  }
};

// ════════════════════════════════════════════════
// POST /api/auth/logout
// ════════════════════════════════════════════════
const logout = async (req, res, next) => {
  try {
    // Efface le refresh token en base
    await pool.execute(
      'UPDATE utilisateurs SET refresh_token = NULL, token_expiry = NULL WHERE id_utilisateur = ?',
      [req.user.id_utilisateur]
    );
    res.json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// GET /api/auth/me
// Renvoie les infos de l'utilisateur connecté
// ════════════════════════════════════════════════
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.role, u.created_at,
              e.formation, e.numero_etudiant, e.annee_promotion, e.photo_url,
              en.departement, en.specialite, en.bureau,
              t.poste, t.id_entreprise,
              a.niveau_acces
       FROM utilisateurs u
       LEFT JOIN etudiants e   ON u.id_utilisateur = e.id_utilisateur AND u.role = 'etudiant'
       LEFT JOIN enseignants en ON u.id_utilisateur = en.id_utilisateur AND u.role = 'enseignant'
       LEFT JOIN tuteurs t     ON u.id_utilisateur = t.id_utilisateur AND u.role = 'tuteur'
       LEFT JOIN administrateurs a ON u.id_utilisateur = a.id_utilisateur AND u.role = 'admin'
       WHERE u.id_utilisateur = ?`,
      [req.user.id_utilisateur]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};


// ════════════════════════════════════════════════
// POST /api/auth/forgot-password
// ════════════════════════════════════════════════
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email obligatoire.' });
    }

    const [rows] = await pool.execute(
      'SELECT id_utilisateur, prenom, actif FROM utilisateurs WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length > 0 && rows[0].actif) {
      const user = rows[0];

      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await pool.execute(
        'UPDATE utilisateurs SET reset_token = ?, reset_token_expiry = ? WHERE id_utilisateur = ?',
        [resetToken, expiry, user.id_utilisateur]
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const { sendResetPasswordEmail } = require('../config/mailer');
      await sendResetPasswordEmail(email.toLowerCase(), user.prenom, resetUrl);
    }

    res.json({
      message: 'Si cet email est enregistré, vous recevrez un lien de réinitialisation.'
    });

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// POST /api/auth/reset-password
// ════════════════════════════════════════════════
const resetPassword = async (req, res, next) => {
  try {
    const { token, nouveau_mot_de_passe } = req.body;

    if (!token || !nouveau_mot_de_passe) {
      return res.status(400).json({ message: 'Token et nouveau mot de passe obligatoires.' });
    }

if (nouveau_mot_de_passe.length < 12)
  return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 12 caractères.' });
if (!/[A-Z]/.test(nouveau_mot_de_passe))
  return res.status(400).json({ message: 'Le mot de passe doit contenir au moins une majuscule.' });
if (!/[a-z]/.test(nouveau_mot_de_passe))
  return res.status(400).json({ message: 'Le mot de passe doit contenir au moins une minuscule.' });
if (!/[0-9]/.test(nouveau_mot_de_passe))
  return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un chiffre.' });
if (!/[^A-Za-z0-9]/.test(nouveau_mot_de_passe))
  return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un caractère spécial (ex: !@#$).' });

    const [rows] = await pool.execute(
      'SELECT id_utilisateur FROM utilisateurs WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Lien invalide ou expiré. Faites une nouvelle demande.' });
    }

    const userId = rows[0].id_utilisateur;

    const hash = await bcrypt.hash(nouveau_mot_de_passe, 12);

    await pool.execute(
      'UPDATE utilisateurs SET mot_de_passe = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id_utilisateur = ?',
      [hash, userId]
    );

    res.json({ message: 'Mot de passe modifié avec succès. Vous pouvez vous connecter.' });

  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════
// POST /api/auth/contact-admin
// Envoie un email à l'admin depuis la page login
// ════════════════════════════════════════════════
const contactAdmin = async (req, res, next) => {
  try {
    const { nom, email, message } = req.body;

    if (!nom?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    // Validation email basique
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Adresse email invalide.' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return res.status(500).json({ message: 'Configuration admin manquante.' });
    }

    const { transporter } = require('../config/mailer');

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 32px 16px;">
        <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: #1a1f3e; padding: 28px 32px; text-align: center;">
            <span style="font-family: monospace; font-size: 1.1rem; font-weight: 700; color: white; background: #2563eb; padding: 6px 14px; border-radius: 6px;">
              StageTrack
            </span>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size: 1rem; color: #0f172a; margin: 0 0 20px; font-family: monospace;">
              Nouvelle demande de premier accès
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
              <tr>
                <td style="padding: 10px 0; color: #64748b; width: 100px; vertical-align: top;">Nom</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${nom}</td>
              </tr>
              <tr style="border-top: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; vertical-align: top;">Email</td>
                <td style="padding: 10px 0;">
                  <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
                </td>
              </tr>
              <tr style="border-top: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; color: #0f172a; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 14px 16px; background: #dbeafe; border-radius: 8px; font-size: 0.8rem; color: #1e40af;">
              Répondez directement à cet email ou créez un compte pour cette personne via l'interface d'administration.
            </div>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding: 16px 32px; background: #f8fafc; text-align: center;">
            <p style="margin: 0; font-size: 0.72rem; color: #94a3b8;">StageTrack — Application de suivi des stages</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from:     process.env.SMTP_FROM,
      to:       adminEmail,
      replyTo:  email,          // Répondre directement à l'utilisateur
      subject:  `Demande de premier accès — ${nom}`,
      html,
    });

    res.json({ message: 'Votre message a été envoyé. L\'administrateur vous contactera.' });

  } catch (error) {
    next(error);
  }
};

module.exports = { login, refreshToken, logout, getMe, forgotPassword, resetPassword, contactAdmin };