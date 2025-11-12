
export const USER_ASSESSMENT_QUESTIONS = [
  {
    id: 'q1',
    question: 'When making a major life decision, what do you prioritize most?',
    options: [
      'My personal values and principles, even if they are unpopular.',
      'The advice and expectations of family and friends.',
      'Practical outcomes and achieving my goals.',
      'My gut feeling and intuition at the moment.',
    ],
  },
  {
    id: 'q2',
    question: 'How do you typically handle conflict or disagreement with someone you respect?',
    options: [
      'I state my position clearly and stand my ground.',
      'I look for common ground and compromise.',
      'I avoid direct confrontation if possible.',
      'I try to understand their perspective fully before responding.',
    ],
  },
  {
    id: 'q3',
    question: 'How do you feel about revealing your flaws or past mistakes to others?',
    options: [
      'I am open about them as they are part of who I am.',
      'I share them only with people I trust completely.',
      'I prefer to keep them private.',
      'I see them as learning experiences but don\'t dwell on them publicly.',
    ],
  },
  {
    id: 'q4',
    question: 'In a professional setting, how much do you adapt your behavior to fit the company culture?',
    options: [
      'Very little; I behave consistently regardless of the environment.',
      'I adapt my communication style but not my core values.',
      'Significantly; I believe it\'s important to conform to succeed.',
      'I try to influence the culture to be more aligned with my style.',
    ],
  },
   {
    id: 'q5',
    question: 'How consistent is your public persona (e.g., on social media) with your private self?',
    options: [
      'They are virtually identical.',
      'My public persona is a curated, more positive version of myself.',
      'They are quite different; I maintain a strong separation.',
      'I don\'t have a significant public persona.',
    ],
  },
];

export const DIMENSION_DESCRIPTIONS: { [key: string]: string } = {
    alignment: "Degree to which behavior reflects reported values or personal statements.",
    boundary_consistency: "How clearly the figure defines and maintains personal, professional, or social boundaries.",
    shadow_integration: "How observable impulses (anger, ambition) manifest and whether they are integrated vs. suppressed.",
    ethical_string_influence: "Degree to which social, cultural, or institutional pressures dictate behavior.",
    self_expression: "Clarity and coherence of communication, persona, and behavior."
};
