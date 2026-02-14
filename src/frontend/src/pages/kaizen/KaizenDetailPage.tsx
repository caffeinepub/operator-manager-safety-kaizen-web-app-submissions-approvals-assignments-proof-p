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
  const showPhotoUpload = kaizen.status === KaizenStatus.implemented || kaizen.status === KaizenStatus.closed;

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                <CardTitle>Suggested Improvement</CardTitle>
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
                    <p className="text-sm text-muted-foreground mb-1">Assigned Department</p>
                    <p className="font-medium">{kaizen.assignedDepartment}</p>
                  </div>
                  {kaizen.requiredTools && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Required Tools / Materials</p>
                      <p className="whitespace-pre-wrap">{kaizen.requiredTools}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showPhotoUpload && (
              <>
                <KaizenPhotoGallery kaizenId={kaizen.id} />
                <KaizenPhotoUploader kaizenId={kaizen.id} />
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="text-sm">{format(new Date(Number(kaizen.timestamp) / 1000000), 'MMM d, yyyy h:mm a')}</p>
                </div>
                {kaizen.status !== KaizenStatus.submitted && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{format(new Date(Number(kaizen.lastUpdate) / 1000000), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Submitter</p>
                  <p className="text-xs font-mono break-all">{kaizen.submitter.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kaizen ID</p>
                  <p className="text-xs font-mono break-all">{kaizen.id.slice(0, 40)}...</p>
                </div>
              </CardContent>
            </Card>

            {showDecisionPanel && <KaizenDecisionPanel kaizenId={kaizen.id} />}
            {showAssignmentPanel && (
              <KaizenAssignmentPanel
                kaizenId={kaizen.id}
                currentDepartment={kaizen.assignedDepartment}
                currentTools={kaizen.requiredTools}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
