import { useState, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetAllObservations } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useCurrentUser';
import { format } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import EmptyState from '../../components/empty/EmptyState';

export default function ObservationsListPage() {
  const { data: observations = [], isLoading } = useGetAllObservations();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredObservations = useMemo(() => {
    let filtered = observations;

    // Filter by submitter (operators see only their own)
    if (!isAdmin && identity) {
      filtered = filtered.filter((obs) => obs.submitter.toString() === identity.getPrincipal().toString());
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((obs) => obs.obsType === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (obs) =>
          obs.title.toLowerCase().includes(query) ||
          obs.description.toLowerCase().includes(query) ||
          obs.area?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [observations, typeFilter, searchQuery, isAdmin, identity]);

  const observationTypes = ['all', ...Array.from(new Set(observations.map((o) => o.obsType)))];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading observations...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Observations</h1>
            <p className="text-muted-foreground">Safety hazards and quality issues</p>
          </div>
          <Button onClick={() => navigate({ to: '/observations/new' })}>
            <Plus className="h-4 w-4 mr-2" />
            New Observation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Observations</CardTitle>
            <CardDescription>Search and filter by type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search observations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {observationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredObservations.length === 0 ? (
          <EmptyState
            title="No observations found"
            description={
              observations.length === 0
                ? 'Submit your first observation to get started'
                : 'Try adjusting your filters'
            }
            imageSrc="/assets/generated/empty-state-clipboard.dim_900x600.png"
            actionLabel={observations.length === 0 ? 'Submit Observation' : undefined}
            onAction={observations.length === 0 ? () => navigate({ to: '/observations/new' }) : undefined}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Observations ({filteredObservations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObservations.map((obs) => (
                    <TableRow
                      key={obs.id}
                      className="cursor-pointer"
                      onClick={() => navigate({ to: `/observations/${obs.id}` })}
                    >
                      <TableCell>
                        <Badge variant="outline">{obs.obsType}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{obs.title}</TableCell>
                      <TableCell>{obs.area || '-'}</TableCell>
                      <TableCell>{format(new Date(Number(obs.timestamp) / 1000000), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{obs.status}</Badge>
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
