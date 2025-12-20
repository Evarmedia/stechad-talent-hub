import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import React, { useState } from 'react';
import { useDataContext } from '@/hooks/useDataContext';

interface RescheduleInterviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  interview: any;
}

const RescheduleInterviewDialog: React.FC<RescheduleInterviewDialogProps> = ({
  isOpen,
  onClose,
  interview
}) => {
  const { updateInterview, loading } = useDataContext();

  const [formData, setFormData] = useState({
    date_time: '',
    duration: 30,
    status: 'rescheduled',
    zoom_link: '',
    phone_number: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date_time) {
      toast({ title: "Error", description: "Please select a new date and time" });
      return;
    }

    try {
      const interviewData = {
        date_time: new Date(formData.date_time).toISOString(),
        duration: formData.duration,
        status: 'rescheduled',
        zoom_link: formData.zoom_link,
        phone_number: formData.phone_number,
        notes: formData.notes
      };
      await updateInterview(
        interview.interviews_id,
        interviewData
      );

      toast({
        title: "Success",
        description: "Interview rescheduled successfully!"
      });

      onClose();
      setFormData({
        date_time: '',
        duration: 30,
        status: '',
        zoom_link: '',
        phone_number: '',
        notes: '' 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule interview"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Interview</DialogTitle>
          <DialogDescription>
            Fill in the details below to reschedule the interview.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Candidate</Label>
            <Input
              value={`${interview.candidate_name} - ${interview.job_title}`}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label>Current Date & Time</Label>
            <Input
              value={new Date(interview.date_time).toLocaleString()}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="dateTime">New Date & Time *</Label>
            <Input
              id="dateTime"
              name="date_time"
              type="datetime-local"
              value={formData.date_time}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason for Rescheduling (Optional)</Label>
            <Textarea
              id="reason"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Please provide a reason for rescheduling..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Rescheduling..." : "Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleInterviewDialog;