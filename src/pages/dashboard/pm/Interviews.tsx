
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Edit, X } from 'lucide-react';
import { useInterviewContext } from '../../../hooks/useInterviewContext';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { toast } from '@/hooks/use-toast';
import RescheduleInterviewDialog from '../../../components/RescheduleInterviewDialog';

const Interviews = () => {
  const { interviews, loading, fetchInterviews, cancelInterview } = useInterviewContext();
  const { user } = useAuthContext();
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    if (user) {
      fetchInterviews(user.id, user.role);
    }
  }, [user, fetchInterviews]);

  const handleCancelInterview = async (interviewId: number) => {
    try {
      await cancelInterview(interviewId, "Cancelled by interviewer");
      toast({
        title: "Success",
        description: "Interview cancelled successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel interview"
      });
    }
  };

  const handleReschedule = (interview: any) => {
    setSelectedInterview(interview);
    setRescheduleDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="p-2 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Scheduled Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No interviews scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => {
                const { date, time } = formatDateTime(interview.dateTime);
                return (
                  <div key={interview.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">{interview.candidateName}</h3>
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Job:</strong> {interview.jobTitle}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Email:</strong> {interview.candidateEmail}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Date:</strong> {date} at {time}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Duration:</strong> {interview.duration} minutes
                        </p>
                        {interview.phoneNumber && (
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Phone:</strong> {interview.phoneNumber}
                          </p>
                        )}
                        {interview.zoomLink && interview.status === 'scheduled' && (
                          <div className="mt-2">
                            <a 
                              href={interview.zoomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              Join Zoom Meeting
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {interview.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReschedule(interview)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelInterview(interview.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reschedule Dialog */}
      {selectedInterview && (
        <RescheduleInterviewDialog
          isOpen={rescheduleDialogOpen}
          onClose={() => {
            setRescheduleDialogOpen(false);
            setSelectedInterview(null);
          }}
          interview={selectedInterview}
        />
      )}
    </div>
  );
};

export default Interviews;
