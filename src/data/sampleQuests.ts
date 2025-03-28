import type { Quest, QuestType, QuestDifficulty } from '../types';

interface QuestTemplate {
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  experience: number;
  statBoosts: Quest['statBoosts'];
}

export const questTemplates: QuestTemplate[] = [
  // Physical Quests
  {
    title: 'Morning Exercise',
    description: 'Complete a 30-minute workout session',
    type: 'daily',
    difficulty: 'medium',
    experience: 100,
    statBoosts: {
      physical: 5,
      mental: 2
    }
  },
  {
    title: 'Take 10,000 Steps',
    description: 'Walk or run until you reach 10,000 steps',
    type: 'daily',
    difficulty: 'medium',
    experience: 150,
    statBoosts: {
      physical: 4,
      mental: 1
    }
  },

  // Mental Quests
  {
    title: 'Study Session',
    description: 'Complete a focused 1-hour study session',
    type: 'daily',
    difficulty: 'medium',
    experience: 120,
    statBoosts: {
      mental: 5,
      knowledge: 4
    }
  },
  {
    title: 'Meditation',
    description: 'Practice mindfulness meditation for 15 minutes',
    type: 'daily',
    difficulty: 'easy',
    experience: 80,
    statBoosts: {
      mental: 3,
      spiritual: 4
    }
  },

  // Social Quests
  {
    title: 'Social Connection',
    description: 'Have a meaningful conversation with someone',
    type: 'daily',
    difficulty: 'easy',
    experience: 100,
    statBoosts: {
      social: 4,
      mental: 2
    }
  },
  {
    title: 'Group Activity',
    description: 'Participate in a group activity or event',
    type: 'weekly',
    difficulty: 'medium',
    experience: 200,
    statBoosts: {
      social: 6,
      physical: 2,
      mental: 2
    }
  },

  // Creativity Quests
  {
    title: 'Creative Expression',
    description: 'Spend 30 minutes on a creative project',
    type: 'daily',
    difficulty: 'easy',
    experience: 100,
    statBoosts: {
      creativity: 4,
      mental: 2
    }
  },
  {
    title: 'Learn a New Skill',
    description: 'Practice a new skill for 1 hour',
    type: 'weekly',
    difficulty: 'hard',
    experience: 250,
    statBoosts: {
      creativity: 5,
      knowledge: 4,
      mental: 3
    }
  },

  // Knowledge Quests
  {
    title: 'Read a Book',
    description: 'Read for 30 minutes',
    type: 'daily',
    difficulty: 'easy',
    experience: 100,
    statBoosts: {
      knowledge: 4,
      mental: 2
    }
  },
  {
    title: 'Online Course Progress',
    description: 'Complete one module of an online course',
    type: 'weekly',
    difficulty: 'medium',
    experience: 200,
    statBoosts: {
      knowledge: 5,
      mental: 3,
      creativity: 2
    }
  },

  // Spiritual Quests
  {
    title: 'Mindful Morning',
    description: 'Start your day with meditation and gratitude',
    type: 'daily',
    difficulty: 'easy',
    experience: 100,
    statBoosts: {
      spiritual: 4,
      mental: 2
    }
  },
  {
    title: 'Nature Connection',
    description: 'Spend 1 hour in nature, practicing mindfulness',
    type: 'weekly',
    difficulty: 'medium',
    experience: 180,
    statBoosts: {
      spiritual: 5,
      physical: 2,
      mental: 3
    }
  }
];

export const createQuestFromTemplate = (
  template: QuestTemplate,
  userId: string
): Omit<Quest, 'id'> => {
  return {
    ...template,
    userId,
    completed: false,
    createdAt: new Date()
  };
}; 