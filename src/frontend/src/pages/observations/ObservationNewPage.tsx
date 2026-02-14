import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitObservation } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const OBSERVATION_TYPES = ['Q SUSA', 'Q Hazards', 'Safety Hazards'];

export default function ObservationNewPage() {
  const [obsType, setObsType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const submitObservation = useSubmitObservation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!obsType || !title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await submitObservation.mutateAsync({
        obsType,
        title: title.trim(),
        description: description.trim(),
        area: area.trim() || undefined,
      });
      toast.success('Observation submitted successfully');
      navigate({ to: '/observations' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit observation');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/observations' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Submit Observation</h1>
            <p className="text-muted-foreground">Report safety hazards and quality issues</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Observation Details</CardTitle>
            <CardDescription>Fill in the details of your observation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="obsType">Observation Type *</Label>
                <Select value={obsType} onValueChange={setObsType}>
                  <SelectTrigger id="obsType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {OBSERVATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the observation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of what you observed..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area / Line / Department</Label>
                <Input
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g., Production Line 3, Warehouse A"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitObservation.isPending} className="flex-1">
                  {submitObservation.isPending ? 'Submitting...' : 'Submit Observation'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate({ to: '/observations' })}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
