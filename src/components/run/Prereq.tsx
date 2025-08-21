'use client';

import { PrerequisiteCheck } from '@/services/orchestrator/brandRun';
import Link from 'next/link';

interface PrereqProps {
  check: PrerequisiteCheck;
  className?: string;
}

export function Prereq({ check, className = '' }: PrereqProps) {
  if (check.met) {
    return null;
  }

  return (
    <div className={`bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-5 h-5 bg-[var(--warning)] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[var(--warning)] mb-2">
            Prerequisites not met
          </h3>
          <div className="space-y-2">
            {check.missing.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[var(--warning)] rounded-full"></span>
                <span className="text-sm text-[var(--text)]">{item}</span>
              </div>
            ))}
          </div>
          {check.quickActions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--warning)]/20">
              <p className="text-xs text-[var(--muted)] mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {check.quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href || '#'}
                    className="inline-flex items-center px-3 py-1 bg-[var(--warning)]/20 text-[var(--warning)] text-xs font-medium rounded-md hover:bg-[var(--warning)]/30 transition-colors"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
