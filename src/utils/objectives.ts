import type { CardVariant, LearningObjectiveId } from '../types/thinkforge';

export interface ObjectiveDisplayMeta {
  id: LearningObjectiveId;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  badgeClasses: string;
  dotClasses: string;
}

export const OBJECTIVE_LIST: ObjectiveDisplayMeta[] = [
  {
    id: 'first-principles',
    label: 'First-principles understanding',
    shortLabel: 'First-Principles',
    tagline: 'Strip away jargon to core axioms',
    description:
      'Break a concept down to its non-negotiable mechanisms, invariants, and why standard approaches work or fail.',
    badgeClasses: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    dotClasses: 'bg-indigo-500',
  },
  {
    id: 'deep-research',
    label: 'Deep research',
    shortLabel: 'Deep Research',
    tagline: 'Edge cases, papers & trade-offs',
    description:
      'Explore technical failure modes, competing architectures, empirical bottlenecks, and open research questions.',
    badgeClasses: 'border-blue-200 bg-blue-50 text-blue-700',
    dotClasses: 'bg-blue-500',
  },
  {
    id: 'topic-backstory',
    label: 'Topic backstory',
    shortLabel: 'Backstory',
    tagline: 'How and why the idea emerged',
    description:
      'Trace the historical bottlenecks, watershed debates, and pioneers whose constraints shaped modern practice.',
    badgeClasses: 'border-amber-200 bg-amber-50 text-amber-800',
    dotClasses: 'bg-amber-500',
  },
  {
    id: 'cross-topic',
    label: 'Cross-topic connections',
    shortLabel: 'Cross-Topic',
    tagline: 'Bridge concepts across fields',
    description:
      'Discover surprising mathematical or structural parallels linking computer science, biology, physics, and economics.',
    badgeClasses: 'border-teal-200 bg-teal-50 text-teal-800',
    dotClasses: 'bg-teal-500',
  },
  {
    id: 'exam-prep',
    label: 'Exam preparation',
    shortLabel: 'Exam Prep',
    tagline: 'Crisp definitions, traps & recall',
    description:
      'Focus on high-yield distinctions, worked examples, subtle counterexamples, and concise revision summaries.',
    badgeClasses: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dotClasses: 'bg-emerald-500',
  },
];

export function getObjectiveDisplay(id: LearningObjectiveId): ObjectiveDisplayMeta {
  return OBJECTIVE_LIST.find((item) => item.id === id) ?? OBJECTIVE_LIST[0];
}

export function getCardAccentClasses(variant: CardVariant): {
  topBar: string;
  pill: string;
} {
  switch (variant) {
    case 'indigo':
      return {
        topBar: 'bg-indigo-600',
        pill: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      };
    case 'emerald':
      return {
        topBar: 'bg-emerald-600',
        pill: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      };
    case 'amber':
      return {
        topBar: 'bg-amber-500',
        pill: 'border-amber-200 bg-amber-50 text-amber-800',
      };
    case 'monograph':
      return {
        topBar: 'bg-teal-600',
        pill: 'border-teal-200 bg-teal-50 text-teal-700',
      };
    case 'journal':
    default:
      return {
        topBar: 'bg-slate-700',
        pill: 'border-slate-200 bg-slate-100 text-slate-700',
      };
  }
}

export function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
