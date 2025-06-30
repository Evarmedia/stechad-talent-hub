
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useInterviewContext } from '../hooks/useInterviewContext';

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
  const { rescheduleInterview, loading } = useInterviewContext();
  
  const [formData, setFormData] = useState({
    dateTime: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dateTime) {
      toast({ title: "Error", description: "Please select a new date and time" });
      return;
    }

    try {
      await rescheduleInterview(
        interview.id, 
        new Date(formData.dateTime).toISOString(),
        formData.reason
      );
      
      toast({ 
        title: "Success", 
        description: "Interview rescheduled successfully!" 
      });
      
      onClose();
      setFormData({ dateTime: '', reason: '' });
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
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Candidate</Label>
            <Input 
              value={`${interview.candidateName} - ${interview.jobTitle}`} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label>Current Date & Time</Label>
            <Input 
              value={new Date(interview.dateTime).toLocaleString()} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label htmlFor="dateTime">New Date & Time *</Label>
            <Input
              id="dateTime"
              name="dateTime"
              type="datetime-local"
              value={formData.dateTime}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <div>
            <Label htmlFor="reason">Reason for Rescheduling (Optional)</Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please provide a reason for rescheduling..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
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
