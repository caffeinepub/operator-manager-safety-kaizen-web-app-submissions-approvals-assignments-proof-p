import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApproveKaizen, useRejectKaizen } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

interface KaizenDecisionPanelProps {
  kaizenId: string;
}

export default function KaizenDecisionPanel({ kaizenId }: KaizenDecisionPanelProps) {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const approveKaizen = useApproveKaizen();
  const rejectKaizen = useRejectKaizen();

  const handleApprove = async () => {
    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    try {
      await approveKaizen.mutateAsync({ kaizenId, comment: comment.trim() });
      toast.success('Kaizen approved successfully');
      setComment('');
      setAction(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve Kaizen');
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectKaizen.mutateAsync({ kaizenId, reason: comment.trim() });
      toast.success('Kaizen rejected');
      setComment('');
      setAction(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject Kaizen');
    }
  };

  const isPending = approveKaizen.isPending || rejectKaizen.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manager Decision</CardTitle>
        <CardDescription>Approve or reject this Kaizen suggestion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="comment">Comment / Reason *</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Provide your feedback or reason..."
            rows={4}
          />
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={isPending || !comment.trim()}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {approveKaizen.isPending ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isPending || !comment.trim()}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {rejectKaizen.isPending ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
