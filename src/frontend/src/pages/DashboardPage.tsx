import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllObservations, useGetAllKaizens } from '../hooks/useQueries';
import { useIsCallerAdmin } from '../hooks/useCurrentUser';
import { FileText, Lightbulb, Plus, BarChart3, Activity } from 'lucide-react';
import KaizenStatusBadge from '../components/kaizen/KaizenStatusBadge';
import { KaizenStatus } from '../backend';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: observations = [] } = useGetAllObservations();
  const { data: kaizens = [] } = useGetAllKaizens();
  const { data: isAdmin } = useIsCallerAdmin();

  const submittedKaizens = kaizens.filter((k) => k.status === KaizenStatus.submitted).length;
  const approvedKaizens = kaizens.filter((k) => k.status === KaizenStatus.approved).length;
  const implementedKaizens = kaizens.filter((k) => k.status === KaizenStatus.implemented).length;

  const recentKaizens = [...kaizens].sort((a, b) => Number(b.timestamp - a.timestamp)).slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your safety and continuous improvement hub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{observations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Kaizens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kaizens.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{submittedKaizens}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Implemented</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{implementedKaizens}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Submit new observations or Kaizen suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigate({ to: '/observations/new' })} className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Submit Observation
              </Button>
              <Button onClick={() => navigate({ to: '/kaizen/new' })} className="w-full justify-start">
                <Lightbulb className="h-4 w-4 mr-2" />
                Submit Kaizen
              </Button>
              <Button onClick={() => navigate({ to: '/observations' })} variant="outline" className="w-full justify-start">
                View All Observations
              </Button>
              <Button onClick={() => navigate({ to: '/kaizen' })} variant="outline" className="w-full justify-start">
                View All Kaizens
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Manager Tools</CardTitle>
                <CardDescription>Analytics and management features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => navigate({ to: '/manager/analytics' })} variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button onClick={() => navigate({ to: '/manager/gaps' })} variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Gaps Analysis
                </Button>
                <Button onClick={() => navigate({ to: '/manager/inactivity' })} variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Inactivity Report
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Kaizens</CardTitle>
            <CardDescription>Latest improvement suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentKaizens.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No Kaizens submitted yet</p>
            ) : (
              <div className="space-y-3">
                {recentKaizens.map((kaizen) => (
                  <div
                    key={kaizen.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate({ to: `/kaizen/${kaizen.id}` })}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{kaizen.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{kaizen.problemStatement}</p>
                    </div>
                    <KaizenStatusBadge status={kaizen.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
