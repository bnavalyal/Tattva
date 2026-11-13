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
    badgeClasses: 'border-[#d4af37]/30 bg-[#d4af37]/12 text-[#d4af37]',
    dotClasses: 'bg-[#d4af37]',
  },
  {
    id: 'deep-research',
    label: 'Deep research',
    shortLabel: 'Deep Research',
    tagline: 'Edge cases, papers & trade-offs',
    description:
      'Explore technical failure modes, competing architectures, empirical bottlenecks, and open research questions.',
    badgeClasses: 'border-[#c87d55]/30 bg-[#c87d55]/14 text-[#c87d55]',
    dotClasses: 'bg-[#c87d55]',
  },
  {
    id: 'topic-backstory',
    label: 'Topic backstory',
    shortLabel: 'Backstory',
    tagline: 'How and why the idea emerged',
    description:
      'Trace the historical bottlenecks, watershed debates, and pioneers whose constraints shaped modern practice.',
    badgeClasses: 'border-[#eab308]/30 bg-[#eab308]/14 text-[#eab308]',
    dotClasses: 'bg-[#eab308]',
  },
  {
    id: 'cross-topic',
    label: 'Cross-topic connections',
    shortLabel: 'Cross-Topic',
    tagline: 'Bridge concepts across fields',
    description:
      'Discover surprising mathematical or structural parallels linking computer science, biology, physics, and economics.',
    badgeClasses: 'border-[#b4693e]/30 bg-[#b4693e]/14 text-[#b4693e]',
    dotClasses: 'bg-[#b4693e]',
  },
  {
    id: 'exam-prep',
    label: 'Exam preparation',
    shortLabel: 'Exam Prep',
    tagline: 'Crisp definitions, traps & recall',
    description:
      'Focus on high-yield distinctions, worked examples, subtle counterexamples, and concise revision summaries.',
    badgeClasses: 'border-[#f59e0b]/30 bg-[#f59e0b]/14 text-[#f59e0b]',
    dotClasses: 'bg-[#f59e0b]',
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
        topBar: 'bg-[#d4af37]',
        pill: 'border-[#d4af37]/30 bg-[#d4af37]/12 text-[#d4af37]',
      };
    case 'emerald':
      return {
        topBar: 'bg-[#f59e0b]',
        pill: 'border-[#f59e0b]/30 bg-[#f59e0b]/14 text-[#f59e0b]',
      };
    case 'amber':
      return {
        topBar: 'bg-[#eab308]',
        pill: 'border-[#eab308]/30 bg-[#eab308]/14 text-[#eab308]',
      };
    case 'monograph':
      return {
        topBar: 'bg-[#c87d55]',
        pill: 'border-[#c87d55]/30 bg-[#c87d55]/14 text-[#c87d55]',
      };
    case 'journal':
    default:
      return {
        topBar: 'bg-[#73685d]',
        pill: 'border-[#2e2822] bg-[#181512] text-[#a3988c]',
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
