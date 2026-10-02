import { Flashcard, ReviewRating, SubjectId } from '../types';

export const FLASHCARDS_STORAGE_KEY = 'kumhud_flashcards_v1';

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc_maths_1',
    subject: 'maths',
    front: 'What is the Quadratic Formula and Discriminant condition for real roots?',
    back: 'For $ax^2 + bx + c = 0$:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n• Discriminant $D = b^2 - 4ac$\n• If $D > 0$: Two distinct real roots\n• If $D = 0$: Two equal real roots\n• If $D < 0$: No real roots (complex roots)',
    createdAt: Date.now() - 86400000 * 2,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 1000, // Due now
    status: 'new',
  },
  {
    id: 'fc_physics_1',
    subject: 'physics',
    front: "What is Ohm's Law and the formula for parallel resistance?",
    back: "$$V = I \\cdot R$$\n\nVoltage is directly proportional to current at constant temperature.\n\nFor resistors in parallel:\n$$\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$$",
    createdAt: Date.now() - 86400000 * 3,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 1000, // Due now
    status: 'new',
  },
  {
    id: 'fc_chem_1',
    subject: 'chemistry',
    front: 'What is the formula for pH and what does pH < 7 indicate?',
    back: '$$\\text{pH} = -\\log_{10}[\\text{H}^+]$$\n\n• $\\text{pH} < 7$: Acidic solution\n• $\\text{pH} = 7$: Neutral (pure water at 25°C)\n• $\\text{pH} > 7$: Basic / Alkaline solution',
    createdAt: Date.now() - 86400000,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 1000, // Due now
    status: 'new',
  },
  {
    id: 'fc_bio_1',
    subject: 'biology',
    front: 'What are the 3 main stages of urine formation in a Nephron?',
    back: '1. **Glomerular Ultrafiltration**: Blood filtered under pressure in Bowman’s capsule.\n2. **Selective Reabsorption**: Glucose, amino acids, and water reabsorbed into blood capillaries.\n3. **Tubular Secretion**: Waste ions ($K^+, H^+$) actively secreted into renal tubule to form urine.',
    createdAt: Date.now() - 86400000,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 1000, // Due now
    status: 'new',
  },
  {
    id: 'fc_cs_1',
    subject: 'computerscience',
    front: 'What is the Time Complexity of Binary Search and its prerequisite?',
    back: '• **Prerequisite**: The array/list must already be **sorted**.\n• **Time Complexity**:\n  - Best case: $O(1)$ (element at middle)\n  - Worst & Average case: $O(\\log n)$\n• **Space Complexity**: $O(1)$ iterative, $O(\\log n)$ recursive.',
    createdAt: Date.now() - 86400000 * 4,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 1000, // Due now
    status: 'new',
  },
];

/**
 * Calculates updated spaced-repetition parameters based on student's recall rating.
 */
export function calculateNextReview(card: Flashcard, rating: ReviewRating): Flashcard {
  let interval = card.interval;
  let repetition = card.repetition;
  let easeFactor = card.easeFactor;
  let status: 'new' | 'learning' | 'mastered' = card.status;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  switch (rating) {
    case 'again':
      // Reset progression on lapse
      interval = 1;
      repetition = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      status = 'learning';
      break;

    case 'hard':
      interval = Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      status = 'learning';
      break;

    case 'good':
      repetition += 1;
      if (repetition === 1) {
        interval = 1;
      } else if (repetition === 2) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      status = repetition >= 3 ? 'mastered' : 'learning';
      break;

    case 'easy':
      repetition += 1;
      easeFactor = Math.min(2.8, easeFactor + 0.15);
      if (repetition === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      status = 'mastered';
      break;
  }

  const nextReviewDate = Date.now() + interval * ONE_DAY_MS;

  return {
    ...card,
    interval,
    repetition,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewDate,
    lastReviewedAt: Date.now(),
    status,
  };
}

export function loadFlashcards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    if (!raw) return INITIAL_FLASHCARDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FLASHCARDS;
  } catch (e) {
    console.warn('Failed to load flashcards:', e);
    return INITIAL_FLASHCARDS;
  }
}

export function saveFlashcards(cards: Flashcard[]): void {
  try {
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn('Failed to save flashcards:', e);
  }
}
