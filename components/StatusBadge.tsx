import type { PipelineStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/types';

const STYLES: Record<PipelineStatus, string> = {
  new: 'bg-cobalt-100 text-cobalt-600',
  contacted: 'bg-amber-100 text-amber-700',
  in_discussion: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-moss-100 text-moss-700',
  declined: 'bg-clay-100 text-clay-700',
  on_hold: 'bg-paper text-muted'
};

export default function StatusBadge({ status }: { status: PipelineStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
