import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssignDepartment } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

interface KaizenAssignmentPanelProps {
  kaizenId: string;
  currentDepartment?: string;
  currentTools?: string;
}

export default function KaizenAssignmentPanel({
  kaizenId,
  currentDepartment,
  currentTools,
}: KaizenAssignmentPanelProps) {
  const [department, setDepartment] = useState(currentDepartment || '');
  const [tools, setTools] = useState(currentTools || '');
  const assignDepartment = useAssignDepartment();

  const handleAssign = async () => {
    if (!department.trim()) {
      toast.error('Please specify a department');
      return;
    }
    if (!tools.trim()) {
      toast.error('Please specify required tools/materials');
      return;
    }

    try {
      await assignDepartment.mutateAsync({
        kaizenId,
        department: department.trim(),
        tools: tools.trim(),
      });
      toast.success('Department assigned successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign department');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Assignment</CardTitle>
        <CardDescription>Assign this Kaizen to a department and specify required resources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="department">Assigned Department *</Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g., Production, Maintenance, Quality"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tools">Required Tools / Materials *</Label>
          <Textarea
            id="tools"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            placeholder="List all required tools, materials, and resources..."
            rows={4}
          />
        </div>
        <Button
          onClick={handleAssign}
          disabled={assignDepartment.isPending || !department.trim() || !tools.trim()}
          className="w-full"
        >
          <Building2 className="h-4 w-4 mr-2" />
          {assignDepartment.isPending ? 'Assigning...' : 'Assign Department'}
        </Button>
      </CardContent>
    </Card>
  );
}
