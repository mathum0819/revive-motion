import { BarrierType } from '../types/index.js';

export interface InterventionTemplate {
  barrier_type: BarrierType;
  intervention_type: string;
  title: string;
  duration_minutes: number;
  description: string;
  alternatives?: { title: string; duration_minutes: number; description: string }[];
}

export const INTERVENTION_CATALOG: Record<BarrierType, InterventionTemplate> = {
  lack_of_time: {
    barrier_type: 'lack_of_time',
    intervention_type: 'movement_reset',
    title: '2-minute movement reset',
    duration_minutes: 2,
    description: 'Try a short, manageable movement break.',
    alternatives: [
      {
        title: '60-second standing spinal stretch',
        duration_minutes: 1,
        description: 'Stand up and reach overhead to release back tension.'
      }
    ]
  },
  fatigue: {
    barrier_type: 'fatigue',
    intervention_type: 'gentle_mobility',
    title: 'Gentle recovery movement',
    duration_minutes: 5,
    description: 'Try light mobility without intense effort.',
    alternatives: [
      {
        title: '3-minute seated neck & shoulder release',
        duration_minutes: 3,
        description: 'Slow neck rolls and gentle shoulder shrugs.'
      }
    ]
  },
  stress: {
    barrier_type: 'stress',
    intervention_type: 'breath_and_mobility',
    title: 'Breathing and light mobility',
    duration_minutes: 4,
    description: 'Use slow breathing followed by gentle movement.',
    alternatives: [
      {
        title: '4-7-8 relaxation breath break',
        duration_minutes: 3,
        description: 'Inhale for 4 seconds, hold for 7, exhale slowly for 8.'
      }
    ]
  },
  boredom: {
    barrier_type: 'boredom',
    intervention_type: 'activity_switch',
    title: 'Try something different',
    duration_minutes: 5,
    description: 'Choose between walking, dance, mobility, or a beginner challenge.',
    alternatives: [
      {
        title: 'Upbeat walking to favorite song',
        duration_minutes: 4,
        description: 'Put on an energizing song and take a brisk stroll.'
      },
      {
        title: 'Playful balance challenge',
        duration_minutes: 3,
        description: 'Simple single-leg stands and reaches.'
      }
    ]
  },
  difficulty: {
    barrier_type: 'difficulty',
    intervention_type: 'simpler_version',
    title: 'Beginner-friendly version',
    duration_minutes: 5,
    description: 'Complete a simpler version of today’s activity.',
    alternatives: [
      {
        title: 'Supported chair movement',
        duration_minutes: 4,
        description: 'Perform gentle movement using a sturdy chair for balance.'
      }
    ]
  },
  forgetfulness: {
    barrier_type: 'forgetfulness',
    intervention_type: 'schedule_adjustment',
    title: 'Choose a better reminder time',
    duration_minutes: 1,
    description: 'Move your reminder to a time that fits your schedule.',
    alternatives: [
      {
        title: 'Habit-stacking check',
        duration_minutes: 1,
        description: 'Anchor movement directly after morning tea or finishing work.'
      }
    ]
  },
  routine_disruption: {
    barrier_type: 'routine_disruption',
    intervention_type: 'flexible_substitute',
    title: 'Flexible routine reset',
    duration_minutes: 5,
    description: 'Choose a temporary activity that fits today.',
    alternatives: [
      {
        title: 'Anywhere hotel/office stretch',
        duration_minutes: 3,
        description: 'Low-profile movements that need zero equipment or floor space.'
      }
    ]
  },
  low_motivation: {
    barrier_type: 'low_motivation',
    intervention_type: 'micro_starter',
    title: 'One-minute starter',
    duration_minutes: 1,
    description: 'Start for one minute; continuing is optional.',
    alternatives: [
      {
        title: 'Put on sneakers and 30-sec stretch',
        duration_minutes: 1,
        description: 'Just put your shoes on and step outside for fresh air.'
      }
    ]
  },
  pain: {
    barrier_type: 'pain',
    intervention_type: 'safety_pause',
    title: 'Safety pause',
    duration_minutes: 0,
    description: 'Pause exercise. Do not exercise through pain. Consider qualified advice when appropriate.'
  },
  other: {
    barrier_type: 'other',
    intervention_type: 'micro_starter',
    title: 'One-minute starter',
    duration_minutes: 1,
    description: 'Start for one minute; continuing is optional.'
  }
};

export function getInterventionForBarrier(barrier: BarrierType): InterventionTemplate {
  return INTERVENTION_CATALOG[barrier] || INTERVENTION_CATALOG.other;
}
