// src/features/settings/components/AISettings.jsx
// Component for managing AI provider settings (Local vs Cloud).

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Switch } from "../../../components/ui/switch"; // Corrected path
import { Label } from "../../../components/ui/label"; // Corrected path
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../components/ui/card"; // Corrected path
import { Badge } from "../../../components/ui/badge"; // Corrected path
import { Button } from "../../../components/ui/button"; // Corrected path
import { Alert, AlertTitle, AlertDescription } from "../../../components/ui/alert"; // Corrected path
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getAIProviderStatus, toggleAIProvider } from "../services/aiSettingsService"; // Use feature-specific service
import { useToast } from "../../../hooks/use-toast"; // Corrected path

const AISettings = () => {
  const { toast } = useToast();
  const [isLocalAI, setIsLocalAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // For general errors/warnings
  const [connectionStatus, setConnectionStatus] = useState("unknown"); // "connected", "disconnected", "unknown"
  const [connectionCheckResult, setConnectionCheckResult] = useState(null); // For check connection button result

  // Fetch current AI provider status
  const fetchProviderStatus = async () => {
    try {
      setIsLoading(true);
      const response = await getAIProviderStatus();
      if (response.success) {
        setIsLocalAI(response.useLocalAI);
        setConnectionStatus(response.status || "unknown");
        console.log("fetchProviderStatus: LocalAI=", response.useLocalAI, "Status=", response.status);

        if (response.useLocalAI && response.status === "disconnected") {
          setStatusMessage({
            type: "warning",
            message: "Local AI (LM Studio) appears offline. Ensure it's running.",
          });
        } else {
          setStatusMessage(null); // Clear message if connected or using cloud
        }
        return response.status || "unknown";
      } else {
        throw new Error(response.error || "Failed to fetch AI status");
      }
    } catch (error) {
      console.error("Failed to fetch AI provider status:", error);
      setStatusMessage({
        type: "error",
        message: "Unable to retrieve AI provider status. Please try again later.",
      });
      setConnectionStatus("unknown");
      setIsLocalAI(false); // Default to false on error?
      return "unknown";
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between local and cloud AI
  const handleToggle = async () => {
    setIsToggling(true);
    setStatusMessage(null); // Clear previous messages
    setConnectionCheckResult(null);
    const newValue = !isLocalAI;
    
    try {
      const response = await toggleAIProvider(newValue);
      if (response.success) {
        setIsLocalAI(newValue);
        setConnectionStatus(response.status || 'unknown'); // Update status from toggle response
        toast({ title: `Switched to ${newValue ? 'Local AI' : 'Cloud AI'}` });
         // Re-check status message conditions
         if (newValue && response.status === 'disconnected') {
            setStatusMessage({
                type: "warning",
                message: "Switched to Local AI, but LM Studio appears offline.",
            });
         }
      } else {
        throw new Error(response.error || "Failed to toggle AI provider");
      }
    } catch (error) {
      console.error("Failed to toggle AI provider:", error);
      toast({ title: "Error Toggling AI", description: error.message, variant: "destructive" });
      // Optionally revert state? Or refetch to be sure?
      fetchProviderStatus(); // Refetch on error to get actual current state
    } finally {
      setIsToggling(false);
    }
  };

  // Check LM Studio connection status manually
  const checkLMStudioConnection = async () => {
    setIsLoading(true); // Use main loading indicator
    setConnectionCheckResult(null); // Clear previous result
    setStatusMessage(null);
    try {
      // We re-fetch the status which implicitly checks the connection
      const latestStatus = await fetchProviderStatus();
      console.log("checkLMStudioConnection: latestStatus", latestStatus);
      if (latestStatus === "connected") {
        setConnectionCheckResult({
          text: "LM Studio connection successful!",
          type: "success",
        });
      } else {
        setConnectionCheckResult({
          text: "LM Studio connection failed. Ensure it's running and accessible on port 1234.",
          type: "error",
        });
      }
    } catch (error) {
      // Error during fetchProviderStatus is already handled within that function
      setConnectionCheckResult({
        text: "Unable to verify LM Studio connection. Check console for errors.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      // Clear the check result message after 5 seconds
      setTimeout(() => setConnectionCheckResult(null), 5000);
    }
  };

  // Load initial status on mount
  useEffect(() => {
    fetchProviderStatus();
  }, []);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const switchVariants = {
    checked: { backgroundColor: "var(--primary)" },
    unchecked: { backgroundColor: "var(--muted)" },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="w-full bg-card/70 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            AI Provider Settings
            {(isLoading || isToggling) && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription>
            Choose between using local AI models (via LM Studio) or a cloud AI service (Groq).
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background/50">
            <div className="flex items-center space-x-2 justify-between">
              <div>
                <Label htmlFor="ai-provider-toggle" className="text-base font-medium">
                  Use Local AI Models
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {isLocalAI 
                    ? "Using LM Studio for local AI inference." 
                    : "Using Groq Cloud API for AI features."}
                </p>
              </div>
              
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={switchVariants}
              >
                <Switch
                  id="ai-provider-toggle"
                  checked={isLocalAI}
                  onCheckedChange={handleToggle}
                  disabled={isLoading || isToggling}
                  className="data-[state=checked]:bg-primary"
                />
              </motion.div>
            </div>

            {/* Status Badges */} 
            <div className="flex items-center mt-1 space-x-2">
              <Badge 
                variant={isLocalAI ? "outline" : "default"}
                className="capitalize"
              >
                {isLocalAI ? "Local" : "Cloud"}
              </Badge>
              
              {isLocalAI && (
                <Badge 
                  variant={connectionStatus === "connected" ? "success" : connectionStatus === 'disconnected' ? "destructive" : "secondary"}
                  className={`capitalize ${connectionStatus === 'unknown' ? 'animate-pulse' : ''}`}
                >
                  {connectionStatus}
                </Badge>
              )}
            </div>
          </div>

          {/* General Status/Warning Message */} 
          {statusMessage && (
            <Alert variant={statusMessage.type === "error" ? "destructive" : "default"} className={`${statusMessage.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200' : ''}`}>
              <AlertTriangle className={`h-4 w-4 ${statusMessage.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : ''}`} />
              <AlertTitle>
                {statusMessage.type === "error" ? "Error" : "Notice"}
              </AlertTitle>
              <AlertDescription>{statusMessage.message}</AlertDescription>
            </Alert>
          )}

          {/* Connection Check Result Message */} 
          {connectionCheckResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-md text-sm flex items-center gap-2 ${connectionCheckResult.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
            >
              {connectionCheckResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {connectionCheckResult.text}
            </motion.div>
          )}

          {/* Local AI Requirements Info Box */} 
          {isLocalAI && (
            <div className="mt-4 space-y-2 p-4 bg-muted/50 rounded-md border">
              <h4 className="font-medium text-sm">Local AI Requirements:</h4>
              <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
                <li>LM Studio application installed and running.</li>
                <li>Local Inference Server started within LM Studio.</li>
                <li>Server running on default port 1234 (OpenAI API format).</li>
                <li>An appropriate model loaded and ready in LM Studio.</li>
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t">
          <div className="text-xs text-muted-foreground max-w-md">
            {isLocalAI ? (
              <>Local AI keeps your task data private on your machine but requires setup and may be slower.</>
            ) : (
              <>Cloud AI (Groq) is faster and requires no setup, but sends task titles to an external service for processing.</>
            )}
          </div>
          
          {isLocalAI && (
            <Button
              variant="outline"
              size="sm"
              onClick={checkLMStudioConnection}
              disabled={isLoading || isToggling}
              className="flex-shrink-0"
            >
              {(isLoading || isToggling) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              )}
              Check LM Studio
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AISettings;
