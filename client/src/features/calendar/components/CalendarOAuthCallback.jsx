import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext'; // Adjust path if needed
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios'; // Assuming you have a configured axios instance

const CalendarOAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuth(); // Use refreshUserProfile instead of fetchUser
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState('');

  useEffect(() => {
    const processCode = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const errorCode = params.get('error');

      if (errorCode) {
        setError(`Connection failed: ${errorCode}. Please try again.`);
        setStatus('Error');
        // Navigate back to settings after a delay
        setTimeout(() => navigate('/settings?calendar_error=true'), 3000);
        return;
      }

      if (!code) {
        setError('Authorization code missing. Cannot connect calendar.');
        setStatus('Error');
        setTimeout(() => navigate('/settings?calendar_error=true'), 3000);
        return;
      }

      try {
        // Make the authenticated API call to the new backend endpoint
        setStatus('Exchanging code for tokens...');
        const response = await api.post('/api/calendar/exchange-code', { code });

        if (response.data.success) {
          setStatus('Successfully connected! Redirecting...');
          await refreshUserProfile(); // Use the new function name
          // Redirect to settings with success flag
          navigate('/settings?calendar_connected=true', { replace: true });
        } else {
          throw new Error(response.data.message || 'Failed to connect calendar.');
        }
      } catch (err) {
        console.error('Error exchanging calendar code:', err);
        const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
        setError(`Connection failed: ${errorMessage}`);
        setStatus('Error');
        // Redirect to settings with error flag
        setTimeout(() => navigate('/settings?calendar_error=true', { replace: true }), 4000);
      }
    };

    processCode();
  }, [location, navigate, refreshUserProfile]); // Update dependency array

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-semibold mb-2">Connecting Google Calendar...</h2>
      <p className="text-muted-foreground mb-4 text-center">{status}</p>
      {error && (
        <p className="text-red-600 dark:text-red-500 text-center max-w-md">Error: {error}</p>
      )}
      <p className="text-sm text-muted-foreground mt-4 text-center">You will be redirected shortly.</p>
    </div>
  );
};

export default CalendarOAuthCallback; 