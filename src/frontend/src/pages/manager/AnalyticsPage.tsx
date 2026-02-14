import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllObservations, useGetAllKaizens } from '../../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  calculateSubmissionsOverTime,
  calculateTopAreas,
  calculateApprovalRate,
  calculateAverageTimeToDecision,
} from '../../utils/analytics';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: observations = [], isLoading: obsLoading } = useGetAllObservations();
  const { data: kaizens = [], isLoading: kaizenLoading } = useGetAllKaizens();

  if (obsLoading || kaizenLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </AppLayout>
    );
  }

  const submissionsOverTime = calculateSubmissionsOverTime(observations, kaizens);
  const topObservationAreas = calculateTopAreas(observations);
  const topKaizenDepartments = calculateTopAreas(kaizens.map((k) => ({ ...k, area: k.department })));
  const approvalRate = calculateApprovalRate(kaizens);
  const avgTimeToDecision = calculateAverageTimeToDecision(kaizens);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights and trends from your safety and improvement data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{observations.length + kaizens.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {observations.length} observations, {kaizens.length} kaizens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approval Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvalRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kaizens.filter((k) => k.status === 'approved' || k.status === 'assigned' || k.status === 'inProgress' || k.status === 'implemented' || k.status === 'closed').length} of {kaizens.length} kaizens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg. Decision Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgTimeToDecision.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">days to approve/reject</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {submissionsOverTime.slice(-30).reduce((sum, day) => sum + day.count, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">submissions in last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="submissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="submissions">Submissions Over Time</TabsTrigger>
            <TabsTrigger value="areas">Top Areas</TabsTrigger>
            <TabsTrigger value="departments">Top Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Submissions Over Time</CardTitle>
                <CardDescription>Daily submission counts (last 30 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Submissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissionsOverTime.slice(-30).reverse().map((day) => (
                      <TableRow key={day.date}>
                        <TableCell>{day.date}</TableCell>
                        <TableCell className="text-right font-medium">{day.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="areas">
            <Card>
              <CardHeader>
                <CardTitle>Top Observation Areas</CardTitle>
                <CardDescription>Areas with most observations</CardDescription>
              </CardHeader>
              <CardContent>
                {topObservationAreas.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No area data available</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Area</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topObservationAreas.map((area) => (
                        <TableRow key={area.name}>
                          <TableCell>{area.name}</TableCell>
                          <TableCell className="text-right font-medium">{area.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Top Kaizen Departments</CardTitle>
                <CardDescription>Departments with most Kaizen submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {topKaizenDepartments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No department data available</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topKaizenDepartments.map((dept) => (
                        <TableRow key={dept.name}>
                          <TableCell>{dept.name}</TableCell>
                          <TableCell className="text-right font-medium">{dept.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
