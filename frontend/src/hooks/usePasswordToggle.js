import { useState } from 'react';

/**
 * Hook réutilisable pour afficher/masquer un mot de passe
 * Retourne [type, ToggleIcon] :
 *   - type : 'password' ou 'text' à mettre sur l'input
 *   - ToggleIcon : composant bouton à placer à droite du champ
 */
const usePasswordToggle = () => {
  const [visible, setVisible] = useState(false);

  const ToggleIcon = () => (
    <button
      type="button"
      onClick={() => setVisible(v => !v)}
      style={{
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        color: 'var(--muted)',
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1,
      }}
      aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      tabIndex={-1}
    >
      {visible ? (
        // Œil barré
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        // Œil ouvert
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return [visible ? 'text' : 'password', ToggleIcon];
};

export default usePasswordToggle;