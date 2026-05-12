const nodemailer = require('nodemailer');

// Crée le transporteur email une seule fois
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true pour le port 465, false pour 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Vérifie la connexion SMTP au démarrage (optionnel mais utile)
const testMailer = async () => {
  try {
    await transporter.verify();
    console.log('✅ Service email opérationnel');
  } catch (err) {
    console.warn('⚠️  Service email non disponible :', err.message);
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} to - Email du destinataire
 * @param {string} prenom - Prénom de l'utilisateur
 * @param {string} resetUrl - URL avec le token de réinitialisation
 */
const sendResetPasswordEmail = async (to, prenom, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 32px 16px;">
      <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: #1a1f3e; padding: 28px 32px; text-align: center;">
          <span style="font-family: monospace; font-size: 1.1rem; font-weight: 700; color: white; background: #2563eb; padding: 6px 14px; border-radius: 6px; letter-spacing: 0.5px;">
            StageTrack
          </span>
        </div>

        <!-- Corps -->
        <div style="padding: 32px;">
          <h2 style="font-size: 1.1rem; color: #0f172a; margin: 0 0 8px;">Bonjour ${prenom},</h2>
          <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6; margin: 0 0 24px;">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 700; font-size: 0.9rem;">
              Réinitialiser mon mot de passe
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 0.78rem; line-height: 1.5; margin: 0;">
            Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe ne sera pas modifié.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding: 16px 32px; background: #f8fafc;">
          <p style="margin: 0; font-size: 0.72rem; color: #94a3b8; text-align: center;">
            StageTrack — Application de suivi des stages
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to,
    subject: 'Réinitialisation de votre mot de passe — StageTrack',
    html,
  });
};

/**
 * Envoie un code OTP à l'admin
 * @param {string} to - Email de l'admin
 * @param {string} prenom - Prénom
 * @param {string} code - Code OTP 6 chiffres
 */
const sendOTPEmail = async (to, prenom, code) => {
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 32px 16px;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: #1a1f3e; padding: 24px 32px; text-align: center;">
          <span style="font-family: monospace; font-size: 1.1rem; font-weight: 700; color: white; background: #2563eb; padding: 6px 14px; border-radius: 6px;">
            StageTrack
          </span>
        </div>
        <div style="padding: 32px; text-align: center;">
          <h2 style="font-size: 1rem; color: #0f172a; margin: 0 0 8px;">Bonjour ${prenom},</h2>
          <p style="color: #64748b; font-size: 0.875rem; margin: 0 0 28px;">
            Voici votre code de vérification pour accéder à l'administration StageTrack.
          </p>
          <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <div style="font-family: monospace; font-size: 2.5rem; font-weight: 700; letter-spacing: 12px; color: #2563eb;">
              ${code}
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">
            Ce code est valable <strong>10 minutes</strong>.<br>
            Si vous n'avez pas demandé ce code, ignorez cet email.
          </p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding: 14px 32px; background: #f8fafc; text-align: center;">
          <p style="margin: 0; font-size: 0.72rem; color: #94a3b8;">StageTrack — Administration sécurisée</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to,
    subject: 'Votre code de connexion StageTrack — ' + code,
    html,
  });
};

module.exports = { transporter, testMailer, sendResetPasswordEmail, sendOTPEmail };