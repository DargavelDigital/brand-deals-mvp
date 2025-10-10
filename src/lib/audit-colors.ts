/**
 * Audit Color Utilities
 * Provides consistent color mappings for audit scores and categories
 */

export type ScoreGrade = 'excellent' | 'good' | 'fair' | 'poor';
export type CategoryType = 'content' | 'engagement' | 'growth' | 'authenticity';

/**
 * Get color classes based on numerical score
 */
export function getScoreColors(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (score >= 80) {
    return {
      text: 'text-[var(--ds-success)]',
      bg: 'bg-[var(--ds-success-light)]',
      border: 'border-[var(--ds-success)]'
    };
  }
  
  if (score >= 60) {
    return {
      text: 'text-[var(--ds-warning)]',
      bg: 'bg-[var(--ds-warning-light)]',
      border: 'border-[var(--ds-warning)]'
    };
  }
  
  return {
    text: 'text-[var(--ds-error)]',
    bg: 'bg-[var(--ds-error-light)]',
    border: 'border-[var(--ds-error)]'
  };
}

/**
 * Get color classes for grade labels
 */
export function getGradeColors(grade: ScoreGrade): {
  text: string;
  bg: string;
  border: string;
} {
  switch (grade) {
    case 'excellent':
      return {
        text: 'text-[var(--ds-success)]',
        bg: 'bg-[var(--ds-success-light)]',
        border: 'border-[var(--ds-success)]'
      };
    case 'good':
      return {
        text: 'text-[var(--ds-primary)]',
        bg: 'bg-[var(--ds-primary-light)]',
        border: 'border-[var(--ds-primary)]'
      };
    case 'fair':
      return {
        text: 'text-[var(--ds-warning)]',
        bg: 'bg-[var(--ds-warning-light)]',
        border: 'border-[var(--ds-warning)]'
      };
    case 'poor':
      return {
        text: 'text-[var(--ds-error)]',
        bg: 'bg-[var(--ds-error-light)]',
        border: 'border-[var(--ds-error)]'
      };
  }
}

/**
 * Get category-specific colors
 */
export function getCategoryColors(category: CategoryType): {
  text: string;
  bg: string;
  border: string;
  icon: string;
} {
  switch (category) {
    case 'content':
      return {
        text: 'text-[var(--ds-primary)]',
        bg: 'bg-[var(--ds-primary)]',
        border: 'border-[var(--ds-primary)]',
        icon: 'text-[var(--ds-primary)]'
      };
    case 'engagement':
      return {
        text: 'text-[var(--ds-success)]',
        bg: 'bg-[var(--ds-success)]',
        border: 'border-[var(--ds-success)]',
        icon: 'text-[var(--ds-success)]'
      };
    case 'growth':
      return {
        text: 'text-[var(--ds-warning)]',
        bg: 'bg-[var(--ds-warning)]',
        border: 'border-[var(--ds-warning)]',
        icon: 'text-[var(--ds-warning)]'
      };
    case 'authenticity':
      return {
        text: 'text-purple-600',
        bg: 'bg-purple-500',
        border: 'border-purple-500',
        icon: 'text-purple-600'
      };
  }
}

/**
 * Get gradient classes for progress bars
 */
export function getProgressGradient(category: CategoryType): string {
  switch (category) {
    case 'content':
      return 'from-[var(--ds-primary)] to-cyan-500';
    case 'engagement':
      return 'from-[var(--ds-success)] to-emerald-500';
    case 'growth':
      return 'from-[var(--ds-warning)] to-orange-500';
    case 'authenticity':
      return 'from-purple-500 to-pink-500';
  }
}

