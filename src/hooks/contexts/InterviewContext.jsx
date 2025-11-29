
import { createContext, useCallback, useContext, useState } from 'react';
import apiService from '../../services/apiService.js';

const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Schedule new interview
  const scheduleInterview = useCallback(async (interviewData) => {
    setLoading(true);
    try {
      console.log('Scheduling interview with data:', interviewData);
      
      const newInterview = {
        ...interviewData,
        status: "scheduled",
        zoomLink: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`,
        calendarEventId: `cal-event-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      const createdInterview = await apiService.post('interviews', newInterview);
      setInterviews(prev => [createdInterview, ...prev]);
      console.log('Interview scheduled successfully:', createdInterview);
      return createdInterview;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get interviews for logged in user
  const fetchUserInterviews = useCallback(async () => {
    setLoading(true);
    try {
      
      let interviewList = await apiService.get('interviews/me');
      
      // Sort by date
      // interviewList = interviewList.data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
      
      console.log('Fetched interviews:', interviewList);
      setInterviews(interviewList.data);
      console.log("List:=>", interviewList);
      return interviewList;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

    // Get interviews By Id
  const fetchInterviewsById = useCallback(async (interviewId) => {
    setLoading(true);
    try {
      console.log('Fetching interview:');
      
      let interview = await apiService.get('interviews', interviewId);
      
      console.log('Fetched interviews:', interview);
      setInterviews(interview);
      return interview;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get All interviewsuser
  const fetchAllInterviews = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching all interviews');
      
      let interviewList = await apiService.get('interviews');
      
      // Sort by date
      interviewList = interviewList.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
      
      console.log('Fetched interviews:', interviewList);
      setInterviews(interviewList);
      return interviewList;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update interview
  const updateInterview = useCallback(async (interviewId, updateData) => {
    setLoading(true);
    try {
      const updatedData = {
        ...updateData,
        updated_at: new Date().toISOString()
      };
      const updatedInterview = await apiService.patch('interviews', interviewId, updatedData);
      setInterviews(prev => prev.map(interview => 
        interview.interviews_id === interviewId 
          ? updatedInterview
          : interview
      ));
      return updatedInterview.data;
    } catch (error) {
      console.error('Error updating interview:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reschedule interview
  const rescheduleInterview = useCallback(async (interviewId, newDateTime, reason) => {
    setLoading(true);
    try {
      const rescheduleData = {
        dateTime: newDateTime,
        status: 'rescheduled',
        rescheduleReason: reason,
        rescheduledAt: new Date().toISOString()
      };
      const updatedInterview = await apiService.patch('interviews', interviewId, rescheduleData);
      setInterviews(prev => prev.map(interview => 
        interview.id === interviewId 
          ? updatedInterview
          : interview
      ));
      return updatedInterview;
    } catch (error) {
      console.error('Error rescheduling interview:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    interviews,
    fetchAllInterviews,
    fetchInterviewsById,
    loading,
    scheduleInterview,
    fetchUserInterviews,
    updateInterview,
    rescheduleInterview // remove use updateInterview instead
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterviewContext = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterviewContext must be used within an InterviewProvider');
  }
  return context;
};
