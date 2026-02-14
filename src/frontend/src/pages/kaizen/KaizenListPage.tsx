import { useState, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllKaizens } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useCurrentUser';
import { format } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import KaizenStatusBadge from '../../components/kaizen/KaizenStatusBadge';
import EmptyState from '../../components/empty/EmptyState';
import { KaizenStatus } from '../../backend';

export default function KaizenListPage() {
  const { data: kaizens = [], isLoading } = useGetAllKaizens();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKaizens = useMemo(() => {
    let filtered = kaizens;

    // Filter by submitter (operators see only their own)
    if (!isAdmin && identity) {
      filtered = filtered.filter((k) => k.submitter.toString() === identity.getPrincipal().toString());
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((k) => k.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (k) =>
          k.title.toLowerCase().includes(query) ||
          k.problemStatement.toLowerCase().includes(query) ||
          k.improvement.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [kaizens, statusFilter, searchQuery, isAdmin, identity]);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: KaizenStatus.submitted, label: 'Submitted' },
    { value: KaizenStatus.approved, label: 'Approved' },
    { value: KaizenStatus.rejected, label: 'Rejected' },
    { value: KaizenStatus.assigned, label: 'Assigned' },
    { value: KaizenStatus.inProgress, label: 'In Progress' },
    { value: KaizenStatus.implemented, label: 'Implemented' },
    { value: KaizenStatus.closed, label: 'Closed' },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading Kaizens...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kaizen Suggestions</h1>
            <p className="text-muted-foreground">Continuous improvement ideas</p>
          </div>
          <Button onClick={() => navigate({ to: '/kaizen/new' })}>
            <Plus className="h-4 w-4 mr-2" />
            New Kaizen
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Kaizens</CardTitle>
            <CardDescription>Search and filter by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Kaizens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredKaizens.length === 0 ? (
          <EmptyState
            title="No Kaizens found"
            description={
              kaizens.length === 0 ? 'Submit your first Kaizen to get started' : 'Try adjusting your filters'
            }
            imageSrc="/assets/generated/empty-state-clipboard.dim_900x600.png"
            actionLabel={kaizens.length === 0 ? 'Submit Kaizen' : undefined}
            onAction={kaizens.length === 0 ? () => navigate({ to: '/kaizen/new' }) : undefined}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Kaizens ({filteredKaizens.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKaizens.map((kaizen) => (
                    <TableRow
                      key={kaizen.id}
                      className="cursor-pointer"
                      onClick={() => navigate({ to: `/kaizen/${kaizen.id}` })}
                    >
                      <TableCell className="font-medium">{kaizen.title}</TableCell>
                      <TableCell>{kaizen.department || '-'}</TableCell>
                      <TableCell>{format(new Date(Number(kaizen.timestamp) / 1000000), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <KaizenStatusBadge status={kaizen.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
