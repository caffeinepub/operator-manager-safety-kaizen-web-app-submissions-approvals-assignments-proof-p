import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetInactiveOperators } from '../../hooks/useQueries';
import { format } from 'date-fns';
import { Download, AlertCircle } from 'lucide-react';
import { downloadCSV } from '../../utils/csv';

export default function InactivityDashboardPage() {
  const [days, setDays] = useState(7);
  const { data: inactiveOperators = [], isLoading, refetch } = useGetInactiveOperators(days);

  const handleDownloadCSV = () => {
    const csvData = inactiveOperators.map((op) => ({
      Principal: op.operator.toString(),
      'Last Activity': format(new Date(Number(op.lastActivity) / 1000000), 'yyyy-MM-dd HH:mm:ss'),
      'Days Inactive': Math.floor((Date.now() - Number(op.lastActivity) / 1000000) / (1000 * 60 * 60 * 24)),
    }));
    downloadCSV(csvData, `inactive-operators-${days}days-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inactivity Dashboard</h1>
          <p className="text-muted-foreground">Monitor operator activity and identify inactive users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inactivity Threshold</CardTitle>
            <CardDescription>Set the number of days to consider a user inactive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="days">Days of Inactivity</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 7)}
                />
              </div>
              <Button onClick={() => refetch()}>Update</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inactive Operators</CardTitle>
              <CardDescription>
                {inactiveOperators.length} operator(s) inactive for {days}+ days
              </CardDescription>
            </div>
            {inactiveOperators.length > 0 && (
              <Button onClick={handleDownloadCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : inactiveOperators.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No inactive operators found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Principal</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Days Inactive</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveOperators.map((op) => {
                    const daysInactive = Math.floor(
                      (Date.now() - Number(op.lastActivity) / 1000000) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow key={op.operator.toString()}>
                        <TableCell className="font-mono text-xs">{op.operator.toString().slice(0, 30)}...</TableCell>
                        <TableCell>{format(new Date(Number(op.lastActivity) / 1000000), 'MMM d, yyyy h:mm a')}</TableCell>
                        <TableCell>{daysInactive}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Inactive</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
