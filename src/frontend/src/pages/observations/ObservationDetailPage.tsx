import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetObservation } from '../../hooks/useQueries';
import { useNavigate, useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react';

export default function ObservationDetailPage() {
  const { id } = useParams({ from: '/observations/$id' });
  const { data: observation, isLoading } = useGetObservation(id);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading observation...</p>
        </div>
      </AppLayout>
    );
  }

  if (!observation) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Observation not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/observations' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{observation.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(Number(observation.timestamp) / 1000000), 'MMM d, yyyy h:mm a')}
              </div>
              {observation.area && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {observation.area}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{observation.obsType}</Badge>
            <Badge variant="secondary">{observation.status}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{observation.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Submitter</span>
              <span className="text-sm font-mono">{observation.submitter.toString().slice(0, 20)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Observation ID</span>
              <span className="text-sm font-mono">{observation.id.slice(0, 30)}...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
