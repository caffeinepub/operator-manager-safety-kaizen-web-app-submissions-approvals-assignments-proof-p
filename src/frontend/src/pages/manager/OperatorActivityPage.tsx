import { useState } from 'react';
import { useGetAllOperatorActivity } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Users } from 'lucide-react';

export default function OperatorActivityPage() {
  const [thresholdDays, setThresholdDays] = useState(7);
  const { data: activities, isLoading, refetch, isFetching } = useGetAllOperatorActivity();
  const [sortField, setSortField] = useState<'name' | 'lastActivity' | 'daysInactive'>('lastActivity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'name' | 'lastActivity' | 'daysInactive') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const calculateDaysInactive = (lastActivity: bigint): number => {
    try {
      const nowNs = BigInt(Date.now()) * BigInt(1_000_000);
      const diff = nowNs - lastActivity;
      const daysNs = BigInt(24 * 60 * 60 * 1_000_000_000);
      return Number(diff / daysNs);
    } catch (error) {
      console.error('Error calculating days inactive:', error);
      return 0;
    }
  };

  const formatLastActivity = (timestamp: bigint): string => {
    try {
      const timestampMs = Number(timestamp / BigInt(1_000_000));
      const date = new Date(timestampMs);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
        }
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting last activity:', error);
      return 'Unknown';
    }
  };

  const enrichedActivities = activities?.map((activity) => ({
    ...activity,
    daysInactive: calculateDaysInactive(activity.lastActivity),
  })) || [];

  const sortedActivities = [...enrichedActivities].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      const nameA = a.name || a.operator.toString();
      const nameB = b.name || b.operator.toString();
      comparison = nameA.localeCompare(nameB);
    } else if (sortField === 'lastActivity') {
      comparison = Number(a.lastActivity - b.lastActivity);
    } else if (sortField === 'daysInactive') {
      comparison = a.daysInactive - b.daysInactive;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const activeCount = enrichedActivities.filter(a => a.daysInactive < thresholdDays).length;
  const inactiveCount = enrichedActivities.filter(a => a.daysInactive >= thresholdDays).length;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Operator Activity Overview</h1>
        <p className="text-muted-foreground">
          Monitor all operator activity and identify inactive users
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{enrichedActivities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Activity Report</CardTitle>
              <CardDescription>View and filter operator activity data</CardDescription>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 sm:flex-initial">
                <Label htmlFor="threshold" className="text-xs">Inactivity Threshold (days)</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="1"
                  value={thresholdDays}
                  onChange={(e) => setThresholdDays(Math.max(1, parseInt(e.target.value) || 7))}
                  className="w-24"
                />
              </div>
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                size="default"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading activity data...</p>
              </div>
            </div>
          ) : enrichedActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activity Data</h3>
              <p className="text-muted-foreground max-w-md">
                There is no operator activity recorded yet. Activity will appear here once operators start using the system.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Operator
                        {sortField === 'name' && (
                          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Principal</TableHead>
                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('lastActivity')}
                    >
                      <div className="flex items-center gap-1">
                        Last Activity
                        {sortField === 'lastActivity' && (
                          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('daysInactive')}
                    >
                      <div className="flex items-center gap-1">
                        Days Inactive
                        {sortField === 'daysInactive' && (
                          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedActivities.map((activity) => {
                    const isInactive = activity.daysInactive >= thresholdDays;
                    return (
                      <TableRow key={activity.operator.toString()}>
                        <TableCell className="font-medium">
                          {activity.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                          {activity.operator.toString().slice(0, 12)}...
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {activity.role || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatLastActivity(activity.lastActivity)}
                        </TableCell>
                        <TableCell>
                          <span className={isInactive ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''}>
                            {activity.daysInactive}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isInactive ? 'destructive' : 'default'}>
                            {isInactive ? 'Inactive' : 'Active'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
