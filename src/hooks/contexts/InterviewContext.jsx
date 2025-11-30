
import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import apiService from '../../services/apiService.js';
import { useAuthContext } from "../useAuthContext.jsx";

const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const token = apiService.getToken(); // ensures only fetch when logged in
  const { user } = useAuthContext();

  const [interviews, setInterviews] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // prevents double fetching
  

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
      const sortedInterviews = interviewList.data.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
      setInterviews(sortedInterviews);
      console.log("Interview List from Context:=>", sortedInterviews);
      return sortedInterviews;
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
      interviewList = interviewList.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
      
      console.log('Fetched interviews:', interviewList);
      setAllInterviews(interviewList.data);
      return interviewList.data;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update interview
// Update interview
  const updateInterview = useCallback(async (interviewId, updateData) => {
    setLoading(true);
    try {
      const updatedData = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const updatedInterview = await apiService.patch(
        "interviews",
        interviewId,
        updatedData
      );

      // Merge instead of replace so structure never breaks
      setInterviews(prev =>
        prev.map(interview =>
          interview.interviews_id === interviewId
            ? { ...interview, ...updatedInterview.data }
            : interview
        )
      );

      return updatedInterview.data;
    } catch (error) {
      console.error("Error updating interview:", error);
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
        date_time: newDateTime,
        status: 'rescheduled',
        rescheduleReason: reason,
      };
      const updatedInterview = await apiService.patch('interviews', interviewId, rescheduleData);
      setInterviews(prev => prev.map(interview => 
        interview.interviews_id === interviewId 
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

    // ---------------------------
    // FETCH ALL DATA ONCE
    // ---------------------------
    useEffect(() => {
      if (!token || !user || initialized) return;
  
      const init = async () => {
        setLoading(true);
  
        try {
          await fetchUserInterviews();
  
          if (user.role === "admin" || user.role === "project_manager") {
            // Admins + PMs fetch interview list ONLY
            await fetchAllInterviews();
          }
        } catch (err) {
          console.error("InterviewContext init error:", err);
        } finally {
          setInitialized(true);
          setLoading(false);
        }
      };
  
      init();
    }, [token, user]);

    const resetInterview = async () => {
      setAllInterviews([]);
      setInterviews([]);
      setInitialized(false);
    };
  

  const value = {
    interviews,
    allInterviews,
    fetchAllInterviews,
    fetchInterviewsById,
    loading,
    scheduleInterview,
    fetchUserInterviews,
    updateInterview,
    rescheduleInterview, // remove use updateInterview instead
    resetInterview,
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
