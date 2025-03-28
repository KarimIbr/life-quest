import { BasicQuest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const basicQuests: BasicQuest[] = [
  // Physical Quests
  {
    id: uuidv4(),
    title: "Take a 30-minute walk",
    description: "Go for a refreshing 30-minute walk outside.",
    difficulty: "easy",
    timeToAccept: 60, // 1 hour to accept
    timeToComplete: 24,
    type: "physical",
    rewards: {
      experience: 50,
      stats: { physical: 2, mental: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Do 20 Push-ups",
    description: "Complete 20 push-ups (can be done in sets).",
    difficulty: "medium",
    timeToAccept: 30,
    timeToComplete: 24,
    type: "physical",
    rewards: {
      experience: 75,
      stats: { physical: 3 }
    }
  },
  {
    id: uuidv4(),
    title: "Morning Stretching Routine",
    description: "Complete a 15-minute morning stretching routine.",
    difficulty: "easy",
    timeToAccept: 120,
    timeToComplete: 24,
    type: "physical",
    rewards: {
      experience: 40,
      stats: { physical: 2, spiritual: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Run 2km",
    description: "Go for a 2km run at your own pace.",
    difficulty: "medium",
    timeToAccept: 90,
    timeToComplete: 24,
    type: "physical",
    rewards: {
      experience: 85,
      stats: { physical: 4, mental: 2 }
    }
  },
  {
    id: uuidv4(),
    title: "Yoga Session",
    description: "Complete a 20-minute yoga session.",
    difficulty: "medium",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "physical",
    rewards: {
      experience: 65,
      stats: { physical: 3, spiritual: 2 }
    }
  },

  // Mental Quests
  {
    id: uuidv4(),
    title: "Meditation Session",
    description: "Complete a 10-minute meditation session.",
    difficulty: "easy",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "mental",
    rewards: {
      experience: 45,
      stats: { mental: 2, spiritual: 2 }
    }
  },
  {
    id: uuidv4(),
    title: "Solve a Puzzle",
    description: "Complete a crossword, sudoku, or similar puzzle.",
    difficulty: "medium",
    timeToAccept: 45,
    timeToComplete: 24,
    type: "mental",
    rewards: {
      experience: 60,
      stats: { mental: 3, knowledge: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Memory Exercise",
    description: "Practice a memory exercise for 15 minutes.",
    difficulty: "medium",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "mental",
    rewards: {
      experience: 55,
      stats: { mental: 3, knowledge: 2 }
    }
  },
  {
    id: uuidv4(),
    title: "Focus Time",
    description: "Spend 25 minutes in focused work without distractions.",
    difficulty: "hard",
    timeToAccept: 30,
    timeToComplete: 24,
    type: "mental",
    rewards: {
      experience: 80,
      stats: { mental: 4, knowledge: 2 }
    }
  },

  // Social Quests
  {
    id: uuidv4(),
    title: "Call a Friend",
    description: "Call a friend or family member you haven't spoken to in a while.",
    difficulty: "easy",
    timeToAccept: 180,
    timeToComplete: 24,
    type: "social",
    rewards: {
      experience: 55,
      stats: { social: 3, mental: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Group Activity",
    description: "Participate in a group activity or meeting.",
    difficulty: "medium",
    timeToAccept: 120,
    timeToComplete: 24,
    type: "social",
    rewards: {
      experience: 80,
      stats: { social: 4 }
    }
  },
  {
    id: uuidv4(),
    title: "Help Someone",
    description: "Offer help to someone in need.",
    difficulty: "medium",
    timeToAccept: 180,
    timeToComplete: 24,
    type: "social",
    rewards: {
      experience: 70,
      stats: { social: 3, spiritual: 2 }
    }
  },
  {
    id: uuidv4(),
    title: "Team Project",
    description: "Work on a project with others.",
    difficulty: "hard",
    timeToAccept: 240,
    timeToComplete: 24,
    type: "social",
    rewards: {
      experience: 100,
      stats: { social: 5, knowledge: 2 }
    }
  },

  // Creative Quests
  {
    id: uuidv4(),
    title: "Draw Something",
    description: "Spend 20 minutes drawing or sketching anything.",
    difficulty: "easy",
    timeToAccept: 90,
    timeToComplete: 24,
    type: "creative",
    rewards: {
      experience: 45,
      stats: { creativity: 3 }
    }
  },
  {
    id: uuidv4(),
    title: "Write a Short Story",
    description: "Write a short story or creative piece (minimum 500 words).",
    difficulty: "hard",
    timeToAccept: 120,
    timeToComplete: 24,
    type: "creative",
    rewards: {
      experience: 100,
      stats: { creativity: 4, knowledge: 2 }
    }
  },
  {
    id: uuidv4(),
    title: "Photography Challenge",
    description: "Take 5 creative photos of everyday objects.",
    difficulty: "medium",
    timeToAccept: 120,
    timeToComplete: 24,
    type: "creative",
    rewards: {
      experience: 65,
      stats: { creativity: 3, knowledge: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Music Creation",
    description: "Create a simple melody or rhythm.",
    difficulty: "medium",
    timeToAccept: 90,
    timeToComplete: 24,
    type: "creative",
    rewards: {
      experience: 70,
      stats: { creativity: 3, mental: 2 }
    }
  },

  // Knowledge Quests
  {
    id: uuidv4(),
    title: "Read an Article",
    description: "Read an educational article about a topic you're interested in.",
    difficulty: "easy",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "knowledge",
    rewards: {
      experience: 40,
      stats: { knowledge: 2, mental: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Learn Something New",
    description: "Watch an educational video or tutorial about a new topic.",
    difficulty: "medium",
    timeToAccept: 90,
    timeToComplete: 24,
    type: "knowledge",
    rewards: {
      experience: 70,
      stats: { knowledge: 3, creativity: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Research Project",
    description: "Research a topic you're curious about for 30 minutes.",
    difficulty: "hard",
    timeToAccept: 120,
    timeToComplete: 24,
    type: "knowledge",
    rewards: {
      experience: 90,
      stats: { knowledge: 4, mental: 2 }
    }
  },
  {
    id: uuidv4(),
    title: "Language Practice",
    description: "Practice a language you're learning for 20 minutes.",
    difficulty: "medium",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "knowledge",
    rewards: {
      experience: 60,
      stats: { knowledge: 3, social: 1 }
    }
  },

  // Spiritual Quests
  {
    id: uuidv4(),
    title: "Gratitude Journal",
    description: "Write down 3 things you're grateful for today.",
    difficulty: "easy",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "spiritual",
    rewards: {
      experience: 45,
      stats: { spiritual: 2, mental: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Nature Walk",
    description: "Take a mindful walk in nature for 20 minutes.",
    difficulty: "easy",
    timeToAccept: 120,
    timeToComplete: 24,
    type: "spiritual",
    rewards: {
      experience: 50,
      stats: { spiritual: 2, physical: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Mindful Eating",
    description: "Practice mindful eating during one meal.",
    difficulty: "medium",
    timeToAccept: 90,
    timeToComplete: 24,
    type: "spiritual",
    rewards: {
      experience: 55,
      stats: { spiritual: 3, physical: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Reflection Time",
    description: "Spend 15 minutes in quiet reflection.",
    difficulty: "medium",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "spiritual",
    rewards: {
      experience: 50,
      stats: { spiritual: 3, mental: 2 }
    }
  },

  // Mixed Quests
  {
    id: uuidv4(),
    title: "Cook a New Recipe",
    description: "Try cooking a recipe you've never made before.",
    difficulty: "medium",
    timeToAccept: 180,
    timeToComplete: 24,
    type: "creative",
    rewards: {
      experience: 75,
      stats: { creativity: 3, knowledge: 2 }
    }
  },
  {
    id: uuidv4(),
    title: "Dance Session",
    description: "Dance to your favorite music for 15 minutes.",
    difficulty: "easy",
    timeToAccept: 30,
    timeToComplete: 24,
    type: "physical",
    rewards: {
      experience: 45,
      stats: { physical: 2, mental: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Plant Care",
    description: "Take care of your plants or start a new one.",
    difficulty: "easy",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "spiritual",
    rewards: {
      experience: 40,
      stats: { spiritual: 2, knowledge: 1 }
    }
  },
  {
    id: uuidv4(),
    title: "Digital Detox",
    description: "Spend 1 hour without using any digital devices.",
    difficulty: "hard",
    timeToAccept: 60,
    timeToComplete: 24,
    type: "mental",
    rewards: {
      experience: 85,
      stats: { mental: 3, spiritual: 2 }
    }
  }
]; 