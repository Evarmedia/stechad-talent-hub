
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useDataContext } from '@/hooks/useDataContext';
import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

interface Engineer {
  engineer_id: string;
  user_id: string;
  date_of_birth: string;
  open_to_nearby_cities: boolean;
  languages: string[];
  language_proficiency: string;
  has_drivers_license: boolean;
  has_car: boolean;
  is_native: boolean;
  work_authorized: boolean;
  specialization: string[];
  skill_level: string;
  years_of_experience: number;
  certifications: string[];
  project_types: string[];
  open_to_training: boolean;
  is_freelancer: boolean;
  follows_linkedin: boolean;
  referee_info: string;
  newsletter: boolean;
  special_preferences: string;
  cv_object_name: string;
  is_vetted: boolean;
  vetted_by?: string | null;
  vetted_at?: string | null;
  availability: string;
  status: string;
  is_onboarded: boolean;
  onboarded_at: string;
  created_at: string;
  updated_at: string;
}

interface Applicant {
  engineer_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  engineer?: Engineer;
  user: any;
}

interface ApplicantData {
  // When passed from Applicants page (full application)
  applicant?: Applicant;
  applications_id?: string;
  engineer_id?: string;
  job_id?: string;
  job_title?: string;
  status?: string;
  applied_at?: string;
  // When passed from profile dialog (direct applicant object)
  first_name?: string;
  last_name?: string;
  email?: string;
  engineer?: Engineer;
}

interface ScheduleInterviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: ApplicantData;
  // jobId: string;
  jobTitle: string;
}

interface FormData {
  engineer_id: string;
  job_id: string;
  date_time: string;
  duration: number;
  zoom_link: string;
  phone_number: string;
  notes: string;
}

const ScheduleInterviewDialog: React.FC<ScheduleInterviewDialogProps> = ({
  isOpen,
  onClose,
  applicant,
  // jobId,
  jobTitle
}) => {
  const { scheduleInterview, loading, interviews, refreshAllInterviews } = useDataContext();
  const { user } = useAuthContext();

  // Handle both data structures - full application or direct applicant
  const getApplicantData = () => {
    // If applicant has nested 'applicant' property, use that (from Applicants page)
    // console.log("Applicant Data:", applicant);
    if (applicant.applicant) {
      return {
        firstName: applicant.applicant.user?.first_name || '',
        lastName: applicant.applicant.user?.last_name || '',
        email: applicant.applicant.user?.email || '',
        engineerId: applicant.applicant?.engineer_id || applicant.engineer_id || '',
      };
    }
    // Otherwise, applicant is the direct object (from profile dialog)
    return {
      firstName: applicant.first_name || '',
      lastName: applicant.last_name || '',
      email: applicant.email || '',
      engineerId: applicant.engineer?.engineer_id || applicant.engineer_id || '',
    };
  };

  const applicantData = getApplicantData();

  const [formData, setFormData] = useState({
    engineer_id: applicantData.engineerId,
    job_id: applicant.job_id || '',
    date_time: '',
    duration: 30,
    zoom_link: '',
    phone_number: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date_time) {
      toast({ title: "Error", description: "Please select a date and time" });
      return;
    }

    try {
      const interviewData = {
        engineer_id: applicantData.engineerId,
        job_id: applicant.job_id || '',
        date_time: new Date(formData.date_time).toISOString(),
        duration: formData.duration,
        zoom_link: formData.zoom_link,
        phone_number: formData.phone_number,
        notes: formData.notes
      };

      // console.log('Submitting interview data:', interviewData);
      await scheduleInterview(interviewData);
      toast({
        title: "Success",
        description: "Interview scheduled successfully!"
      });

      onClose();
      setFormData({
        engineer_id: '',
        job_id: '',
        date_time: '',
        duration: 30,
        zoom_link: '',
        phone_number: '',
        notes: ''
      });
      await refreshAllInterviews();
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
            <Label>Candidate Name</Label>
            <Input
              value={`${applicantData.firstName} ${applicantData.lastName}`}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label>Candidate Email</Label>
            <Input
              value={applicantData.email}
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
            <Label htmlFor="date_time">Date & Time *</Label>
            <Input
              id="date_time"
              name="date_time"
              type="datetime-local"
              value={formData.date_time}
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
            <Label htmlFor="zoom_link">Zoom/Conference Link (Optional)</Label>
            <Input
              id="zoom_link"
              name="zoom_link"
              value={formData.zoom_link}
              onChange={handleChange}
              placeholder="Add zoom link here"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input
              id="phoneNumber"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
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
            <Button type="submit" disabled={loading} className='text-white'>
              {loading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;
