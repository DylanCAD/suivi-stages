/**
 * Tests unitaires — StageTrack
 * Couvrent la logique métier sans dépendance à la base de données
 */

// ════════════════════════════════════════
// Fonctions utilitaires (à tester)
// ════════════════════════════════════════

// Calcule l'année scolaire depuis une date
const getAnneeScolaire = (date) => {
  const d = new Date(date);
  const mois = d.getMonth() + 1; // 1-12
  const annee = d.getFullYear();
  if (mois >= 9) return `${annee}-${annee + 1}`;
  return `${annee - 1}-${annee}`;
};

// Calcule la note finale (40% tuteur + 60% enseignant)
const calculerNoteFinale = (noteTuteur, noteEnseignant) => {
  if (noteTuteur === null || noteEnseignant === null) return null;
  return Math.round((noteTuteur * 0.4 + noteEnseignant * 0.6) * 100) / 100;
};

// Valide un email
const isEmailValide = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Valide un SIRET (14 chiffres)
const isSiretValide = (siret) => /^\d{14}$/.test(siret);

// Valide la force d'un mot de passe
const isMotDePasseValide = (mdp) => mdp.length >= 8;

// Vérifie qu'une date de fin est après la date de début
const isDatesValides = (debut, fin) => new Date(fin) > new Date(debut);

// Retourne les transitions de statut autorisées
const getTransitionsAutorisees = (statut) => ({
  en_attente: ['valide', 'refuse'],
  valide:     ['en_cours', 'refuse'],
  en_cours:   ['termine'],
  termine:    ['evalue'],
  refuse:     [],
  evalue:     [],
}[statut] || []);

// ════════════════════════════════════════
// TESTS
// ════════════════════════════════════════

describe('📅 Année scolaire', () => {
  test('septembre 2024 → 2024-2025', () => {
    expect(getAnneeScolaire('2024-09-01')).toBe('2024-2025');
  });
  test('janvier 2025 → 2024-2025', () => {
    expect(getAnneeScolaire('2025-01-15')).toBe('2024-2025');
  });
  test('juillet 2025 → 2024-2025', () => {
    expect(getAnneeScolaire('2025-07-01')).toBe('2024-2025');
  });
  test('octobre 2025 → 2025-2026', () => {
    expect(getAnneeScolaire('2025-10-01')).toBe('2025-2026');
  });
});

describe('⭐ Calcul note finale', () => {
  test('note tuteur 14 + enseignant 16 → 15.2', () => {
    expect(calculerNoteFinale(14, 16)).toBe(15.2);
  });
  test('note tuteur 10 + enseignant 10 → 10', () => {
    expect(calculerNoteFinale(10, 10)).toBe(10);
  });
  test('note tuteur 20 + enseignant 20 → 20', () => {
    expect(calculerNoteFinale(20, 20)).toBe(20);
  });
  test('note tuteur 0 + enseignant 0 → 0', () => {
    expect(calculerNoteFinale(0, 0)).toBe(0);
  });
  test('note manquante → null', () => {
    expect(calculerNoteFinale(null, 16)).toBeNull();
    expect(calculerNoteFinale(14, null)).toBeNull();
  });
});

describe('📧 Validation email', () => {
  test('email valide', () => {
    expect(isEmailValide('marie.dupont@etudiant.fr')).toBe(true);
    expect(isEmailValide('admin@suivi-stages.fr')).toBe(true);
  });
  test('email invalide', () => {
    expect(isEmailValide('pas-un-email')).toBe(false);
    expect(isEmailValide('manque@')).toBe(false);
    expect(isEmailValide('')).toBe(false);
  });
});

describe('🏢 Validation SIRET', () => {
  test('SIRET valide (14 chiffres)', () => {
    expect(isSiretValide('44229342600031')).toBe(true);
  });
  test('SIRET invalide', () => {
    expect(isSiretValide('1234')).toBe(false);
    expect(isSiretValide('ABCDEFGHIJKLMN')).toBe(false);
    expect(isSiretValide('')).toBe(false);
  });
});

describe('🔒 Validation mot de passe', () => {
  test('mot de passe valide (8+ caractères)', () => {
    expect(isMotDePasseValide('Password123!')).toBe(true);
    expect(isMotDePasseValide('12345678')).toBe(true);
  });
  test('mot de passe trop court', () => {
    expect(isMotDePasseValide('abc')).toBe(false);
    expect(isMotDePasseValide('')).toBe(false);
  });
});

describe('📅 Validation des dates', () => {
  test('dates valides : fin après début', () => {
    expect(isDatesValides('2025-04-01', '2025-06-30')).toBe(true);
  });
  test('dates invalides : fin avant début', () => {
    expect(isDatesValides('2025-06-30', '2025-04-01')).toBe(false);
  });
  test('dates invalides : même jour', () => {
    expect(isDatesValides('2025-04-01', '2025-04-01')).toBe(false);
  });
});

describe('🔄 Transitions de statut', () => {
  test('en_attente peut aller vers valide ou refuse', () => {
    const t = getTransitionsAutorisees('en_attente');
    expect(t).toContain('valide');
    expect(t).toContain('refuse');
  });
  test('valide peut aller vers en_cours', () => {
    expect(getTransitionsAutorisees('valide')).toContain('en_cours');
  });
  test('evalue ne peut plus changer', () => {
    expect(getTransitionsAutorisees('evalue')).toHaveLength(0);
  });
  test('refuse ne peut plus changer', () => {
    expect(getTransitionsAutorisees('refuse')).toHaveLength(0);
  });
});