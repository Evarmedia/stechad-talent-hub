
import React, { createContext, useContext, useState, useCallback } from 'react';
import apiService from '../services/apiService.js';

const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Schedule new interview
  const scheduleInterview = useCallback(async (interviewData) => {
    setLoading(true);
    try {
      console.log('Scheduling interview with data:', interviewData);
      await apiService.simulateDelay();
      
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

  // Get interviews for user
  const fetchInterviews = useCallback(async (userId, userRole) => {
    setLoading(true);
    try {
      console.log('Fetching interviews for user:', userId, 'role:', userRole);
      await apiService.simulateDelay();
      
      let interviewList = await apiService.get('interviews');
      
      // Filter based on user role
      if (userRole === 'engineer') {
        interviewList = interviewList.filter(interview => 
          interview.candidateId === userId
        );
      } else if (userRole === 'pm') {
        interviewList = interviewList.filter(interview => 
          interview.interviewerId === userId
        );
      }
      
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
      await apiService.simulateDelay();
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      const updatedInterview = await apiService.patch('interviews', interviewId, updatedData);
      setInterviews(prev => prev.map(interview => 
        interview.id === interviewId 
          ? updatedInterview
          : interview
      ));
      return updatedInterview;
    } catch (error) {
      console.error('Error updating interview:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel interview
  const cancelInterview = useCallback(async (interviewId, reason) => {
    setLoading(true);
    try {
      await apiService.simulateDelay();
      const cancelData = {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString()
      };
      const updatedInterview = await apiService.patch('interviews', interviewId, cancelData);
      setInterviews(prev => prev.map(interview => 
        interview.id === interviewId 
          ? updatedInterview
          : interview
      ));
      return updatedInterview;
    } catch (error) {
      console.error('Error cancelling interview:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reschedule interview
  const rescheduleInterview = useCallback(async (interviewId, newDateTime, reason) => {
    setLoading(true);
    try {
      await apiService.simulateDelay();
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
    loading,
    scheduleInterview,
    fetchInterviews,
    updateInterview,
    cancelInterview,
    rescheduleInterview
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
