import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetKaizen } from '../../hooks/useQueries';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../../hooks/useCurrentUser';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Building2 } from 'lucide-react';
import KaizenStatusBadge from '../../components/kaizen/KaizenStatusBadge';
import KaizenDecisionPanel from '../../components/kaizen/KaizenDecisionPanel';
import KaizenAssignmentPanel from '../../components/kaizen/KaizenAssignmentPanel';
import KaizenPhotoUploader from '../../components/kaizen/KaizenPhotoUploader';
import KaizenPhotoGallery from '../../components/kaizen/KaizenPhotoGallery';
import { KaizenStatus } from '../../backend';

export default function KaizenDetailPage() {
  const { id } = useParams({ from: '/kaizen/$id' });
  const { data: kaizen, isLoading } = useGetKaizen(id);
  const { data: isAdmin } = useIsCallerAdmin();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading Kaizen...</p>
        </div>
      </AppLayout>
    );
  }

  if (!kaizen) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Kaizen not found</p>
        </div>
      </AppLayout>
    );
  }

  const showDecisionPanel = isAdmin && kaizen.status === KaizenStatus.submitted;
  const showAssignmentPanel = isAdmin && (kaizen.status === KaizenStatus.approved || kaizen.status === KaizenStatus.assigned);
  const showPhotoUploader = kaizen.status === KaizenStatus.implemented || kaizen.status === KaizenStatus.closed;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/kaizen' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{kaizen.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Submitted: {format(new Date(Number(kaizen.timestamp) / 1000000), 'MMM d, yyyy')}
              </div>
              {kaizen.department && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {kaizen.department}
                </div>
              )}
            </div>
          </div>
          <KaizenStatusBadge status={kaizen.status} />
        </div>

        {showDecisionPanel && <KaizenDecisionPanel kaizenId={kaizen.id} />}
        {showAssignmentPanel && (
          <KaizenAssignmentPanel
            kaizenId={kaizen.id}
            currentDepartment={kaizen.assignedDepartment}
            currentTools={kaizen.requiredTools}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Problem Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{kaizen.problemStatement}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proposed Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{kaizen.improvement}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Benefit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{kaizen.benefit}</p>
          </CardContent>
        </Card>

        {kaizen.managerComment && (
          <Card>
            <CardHeader>
              <CardTitle>Manager Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{kaizen.managerComment}</p>
            </CardContent>
          </Card>
        )}

        {kaizen.assignedDepartment && (
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Assigned Department:</span>
                <p className="text-sm text-muted-foreground mt-1">{kaizen.assignedDepartment}</p>
              </div>
              {kaizen.requiredTools && (
                <div>
                  <span className="text-sm font-medium">Required Tools/Resources:</span>
                  <p className="text-sm text-muted-foreground mt-1">{kaizen.requiredTools}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showPhotoUploader && <KaizenPhotoUploader kaizenId={kaizen.id} />}
        <KaizenPhotoGallery kaizenId={kaizen.id} />

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Submitter</span>
              <span className="text-sm font-mono">{kaizen.submitter.toString().slice(0, 20)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm">{format(new Date(Number(kaizen.lastUpdate) / 1000000), 'MMM d, yyyy h:mm a')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kaizen ID</span>
              <span className="text-sm font-mono">{kaizen.id.slice(0, 30)}...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
