import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/features/auth/contexts/AuthContext"; // Adjust path if needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const AccountSettings = () => {
  const { user, refreshUserProfile } = useAuth(); // Use refreshUserProfile instead of fetchUser
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const isConnected = user?.isCalendarConnected;
  const connectUrl = `${API_BASE_URL}/api/auth/google/calendar/connect`;

  useEffect(() => {
    const calendarConnected = searchParams.get("calendar_connected");
    const calendarError = searchParams.get("calendar_error");

    if (calendarConnected === "true") {
      setFeedback({ type: "success", message: "Google Calendar connected successfully!" });
      refreshUserProfile(); // Use the new function name
      // Clean up URL
      searchParams.delete("calendar_connected");
      setSearchParams(searchParams, { replace: true });
    } else if (calendarError === "true") {
      setFeedback({ type: "error", message: "Failed to connect Google Calendar. Please try again." });
      // Clean up URL
      searchParams.delete("calendar_error");
      setSearchParams(searchParams, { replace: true });
    }

    // Clear feedback after a delay
    if (calendarConnected || calendarError) {
        const timer = setTimeout(() => setFeedback({ type: "", message: "" }), 5000);
        return () => clearTimeout(timer);
    }

  }, [searchParams, setSearchParams, navigate, refreshUserProfile]); // Update dependency array

  const handleConnect = (e) => {
    // Prevent default if it's somehow not a direct link
    e.preventDefault();
    // Redirect to backend OAuth endpoint
    window.location.href = connectUrl;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {feedback.message && (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          {feedback.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{feedback.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Google Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically sync your tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Calendar Connected</span>
              {/* TODO: Add a Disconnect button here later */}
            </div>
          ) : (
            <Button onClick={handleConnect} className="w-full sm:w-auto">
              Connect Google Calendar
            </Button>
            /* If using a direct link instead of Button onClick:
            <a href={connectUrl} className={buttonVariants()}>
              Connect Google Calendar
            </a>
            */
          )}
        </CardContent>
      </Card>

       {/* You can add other account settings here later */}
       {/*
       <Card className="bg-card/70 backdrop-blur-sm border-border/50">
         <CardHeader>
            <CardTitle>Account Details</CardTitle>
         </CardHeader>
         <CardContent>
            <p className="text-muted-foreground">Manage your account details (coming soon).</p>
         </CardContent>
        </Card>
       */}
    </motion.div>
  );
};

export default AccountSettings; 