
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useDataContext } from '@/hooks/useDataContext';
import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

interface ScheduleInterviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    name: string;
    email: string;
    id: number;
  };
  jobId: string;
  jobTitle: string;
}

const ScheduleInterviewDialog: React.FC<ScheduleInterviewDialogProps> = ({
  isOpen,
  onClose,
  applicant,
  jobId,
  jobTitle
}) => {
  const { scheduleInterview, loading } = useDataContext();
  const { user } = useAuthContext();
  
  const [formData, setFormData] = useState({
    dateTime: '',
    duration: 60,
    phoneNumber: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dateTime) {
      toast({ title: "Error", description: "Please select a date and time" });
      return;
    }

    try {
      const interviewData = {
        candidateName: applicant.name,
        candidateEmail: applicant.email,
        candidateId: applicant.id,
        interviewerEmail: user?.email,
        interviewerId: user?.id,
        jobId: jobId,
        jobTitle: jobTitle,
        dateTime: new Date(formData.dateTime).toISOString(),
        duration: formData.duration,
        phoneNumber: formData.phoneNumber,
        notes: formData.notes
      };

      console.log('Submitting interview data:', interviewData);
      await scheduleInterview(interviewData);
      toast({ 
        title: "Success", 
        description: "Interview scheduled successfully!" 
      });
      
      onClose();
      setFormData({
        dateTime: '',
        duration: 60,
        phoneNumber: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to schedule interview" 
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Candidate</Label>
            <Input 
              value={`${applicant.name} (${applicant.email})`} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label>Job Position</Label>
            <Input 
              value={jobTitle} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label htmlFor="dateTime">Date & Time *</Label>
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
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              min="15"
              max="180"
            />
          </div>
          
          <div>
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes or requirements..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;
