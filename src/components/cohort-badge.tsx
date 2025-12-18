import { CohortType } from '@shared/types';
import { cn } from '@/lib/utils';
import { Dna, Wrench } from 'lucide-react';

interface CohortBadgeProps {
  cohortId: CohortType | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const iconSizeClasses = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function CohortBadge({ cohortId, size = 'md', showLabel = false, className }: CohortBadgeProps) {
  if (!cohortId) return null;

  const isGroupA = cohortId === 'GROUP_A';
  const Icon = isGroupA ? Dna : Wrench;
  const label = isGroupA ? 'Protocol' : 'DIY';
  const colorClasses = isGroupA
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
    : 'bg-blue-500/20 text-blue-400 border-blue-500/50';

  if (showLabel) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border',
          colorClasses,
          labelSizeClasses[size],
          className
        )}
      >
        <Icon className={iconSizeClasses[size]} />
        <span className="font-medium">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border',
        sizeClasses[size],
        colorClasses,
        className
      )}
      title={isGroupA ? 'Group A: Protocol' : 'Group B: DIY'}
    >
      <Icon className={iconSizeClasses[size]} />
    </span>
  );
}

// Ring variant for wrapping around avatars
interface CohortRingProps {
  cohortId: CohortType | null | undefined;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ringSizeClasses = {
  sm: 'p-0.5',
  md: 'p-1',
  lg: 'p-1.5',
};

export function CohortRing({ cohortId, children, size = 'md', className }: CohortRingProps) {
  if (!cohortId) {
    return <>{children}</>;
  }

  const isGroupA = cohortId === 'GROUP_A';
  const ringColor = isGroupA
    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
    : 'bg-gradient-to-br from-blue-400 to-blue-600';

  return (
    <div className={cn('rounded-full', ringColor, ringSizeClasses[size], className)}>
      {children}
    </div>
  );
}

// Small indicator badge to show on corner of avatar
interface CohortIndicatorProps {
  cohortId: CohortType | null | undefined;
  className?: string;
}

export function CohortIndicator({ cohortId, className }: CohortIndicatorProps) {
  if (!cohortId) return null;

  const isGroupA = cohortId === 'GROUP_A';
  const Icon = isGroupA ? Dna : Wrench;
  const bgColor = isGroupA ? 'bg-emerald-500' : 'bg-blue-500';

  return (
    <span
      className={cn(
        'absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white shadow-md',
        bgColor,
        className
      )}
      title={isGroupA ? 'Group A: Protocol' : 'Group B: DIY'}
    >
      <Icon className="w-2.5 h-2.5" />
    </span>
  );
}
