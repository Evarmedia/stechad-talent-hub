
import React, { createContext, useContext, useState, useCallback } from 'react';
import { interviewAPI } from '../data/mockData.js';

const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Schedule new interview
  const scheduleInterview = useCallback(async (interviewData) => {
    setLoading(true);
    try {
      const response = await interviewAPI.schedule(interviewData);
      if (response.success) {
        setInterviews(prev => [response.interview, ...prev]);
        return response.interview;
      }
      throw new Error('Failed to schedule interview');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get interviews for user
  const fetchInterviews = useCallback(async (userId, userRole) => {
    setLoading(true);
    try {
      const interviewList = await interviewAPI.getInterviews(userId, userRole);
      setInterviews(interviewList);
      return interviewList;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update interview
  const updateInterview = useCallback(async (interviewId, updateData) => {
    setLoading(true);
    try {
      const response = await interviewAPI.updateInterview(interviewId, updateData);
      if (response.success) {
        setInterviews(prev => prev.map(interview => 
          interview.id === interviewId 
            ? { ...interview, ...response.interview }
            : interview
        ));
        return response.interview;
      }
      throw new Error('Failed to update interview');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel interview
  const cancelInterview = useCallback(async (interviewId, reason) => {
    setLoading(true);
    try {
      const response = await interviewAPI.cancelInterview(interviewId, reason);
      if (response.success) {
        setInterviews(prev => prev.map(interview => 
          interview.id === interviewId 
            ? { ...interview, ...response.interview }
            : interview
        ));
        return response.interview;
      }
      throw new Error('Failed to cancel interview');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reschedule interview
  const rescheduleInterview = useCallback(async (interviewId, newDateTime, reason) => {
    setLoading(true);
    try {
      const response = await interviewAPI.rescheduleInterview(interviewId, newDateTime, reason);
      if (response.success) {
        setInterviews(prev => prev.map(interview => 
          interview.id === interviewId 
            ? { ...interview, ...response.interview }
            : interview
        ));
        return response.interview;
      }
      throw new Error('Failed to reschedule interview');
    } catch (error) {
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
