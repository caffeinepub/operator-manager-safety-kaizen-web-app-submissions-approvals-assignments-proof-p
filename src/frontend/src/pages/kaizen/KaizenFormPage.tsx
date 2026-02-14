import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSubmitKaizen } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function KaizenFormPage() {
  const navigate = useNavigate();
  const submitKaizen = useSubmitKaizen();

  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [improvement, setImprovement] = useState('');
  const [benefit, setBenefit] = useState('');
  const [department, setDepartment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !problemStatement.trim() || !improvement.trim() || !benefit.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await submitKaizen.mutateAsync({
        title: title.trim(),
        problemStatement: problemStatement.trim(),
        improvement: improvement.trim(),
        benefit: benefit.trim(),
        department: department.trim() || undefined,
      });

      toast.success('Kaizen submitted successfully');
      navigate({ to: '/kaizen' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit Kaizen');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/kaizen' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Submit Kaizen</h1>
            <p className="text-muted-foreground">Propose a continuous improvement idea</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kaizen Details</CardTitle>
            <CardDescription>
              Describe the current problem, your proposed improvement, and the expected benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the improvement"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Production, Maintenance, Quality"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemStatement">Problem Statement *</Label>
                <Textarea
                  id="problemStatement"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Describe the current problem or inefficiency..."
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  What is the current situation? What issues or inefficiencies exist?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvement">Proposed Improvement *</Label>
                <Textarea
                  id="improvement"
                  value={improvement}
                  onChange={(e) => setImprovement(e.target.value)}
                  placeholder="Describe your proposed solution or improvement..."
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  How would you solve this problem? What changes do you propose?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefit">Expected Benefit *</Label>
                <Textarea
                  id="benefit"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  placeholder="Describe the expected benefits and impact..."
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  What benefits will this improvement bring? Consider safety, quality, efficiency, cost savings, etc.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/kaizen' })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitKaizen.isPending} className="flex-1">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {submitKaizen.isPending ? 'Submitting...' : 'Submit Kaizen'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
