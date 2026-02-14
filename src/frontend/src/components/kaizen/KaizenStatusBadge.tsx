import { Badge } from '@/components/ui/badge';
import { KaizenStatus } from '../../backend';

const statusConfig = {
  [KaizenStatus.submitted]: { label: 'Submitted', variant: 'secondary' as const },
  [KaizenStatus.approved]: { label: 'Approved', variant: 'default' as const },
  [KaizenStatus.rejected]: { label: 'Rejected', variant: 'destructive' as const },
  [KaizenStatus.assigned]: { label: 'Assigned', variant: 'outline' as const },
  [KaizenStatus.inProgress]: { label: 'In Progress', variant: 'outline' as const },
  [KaizenStatus.implemented]: { label: 'Implemented', variant: 'default' as const },
  [KaizenStatus.closed]: { label: 'Closed', variant: 'secondary' as const },
};

export default function KaizenStatusBadge({ status }: { status: KaizenStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
