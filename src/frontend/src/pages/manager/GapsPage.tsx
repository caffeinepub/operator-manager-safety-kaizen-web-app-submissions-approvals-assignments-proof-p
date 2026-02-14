import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetAllObservations, useGetAllKaizens } from '../../hooks/useQueries';
import { identifyLowActivitySegments } from '../../utils/analytics';
import { AlertTriangle, Info } from 'lucide-react';

export default function GapsPage() {
  const { data: observations = [], isLoading: obsLoading } = useGetAllObservations();
  const { data: kaizens = [], isLoading: kaizenLoading } = useGetAllKaizens();

  if (obsLoading || kaizenLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading gaps analysis...</p>
        </div>
      </AppLayout>
    );
  }

  const lowActivityAreas = identifyLowActivitySegments(observations, 'area');
  const lowActivityDepartments = identifyLowActivitySegments(
    kaizens.map((k) => ({ ...k, area: k.department })),
    'area'
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gaps Analysis</h1>
          <p className="text-muted-foreground">Identify low-activity areas and improvement opportunities</p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Analysis Method</AlertTitle>
          <AlertDescription>
            This analysis identifies areas/departments in the bottom quartile (lowest 25%) by submission count in the last 30
            days. These segments may benefit from additional engagement or support.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Low-Activity Observation Areas</CardTitle>
            <CardDescription>Areas with fewer observations than average</CardDescription>
          </CardHeader>
          <CardContent>
            {lowActivityAreas.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No low-activity areas identified</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area</TableHead>
                    <TableHead className="text-right">Submissions (30d)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowActivityAreas.map((area) => (
                    <TableRow key={area.name}>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell className="text-right">{area.count}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Low Activity</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low-Activity Kaizen Departments</CardTitle>
            <CardDescription>Departments with fewer Kaizen submissions than average</CardDescription>
          </CardHeader>
          <CardContent>
            {lowActivityDepartments.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No low-activity departments identified</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Submissions (30d)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowActivityDepartments.map((dept) => (
                    <TableRow key={dept.name}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="text-right">{dept.count}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Low Activity</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
