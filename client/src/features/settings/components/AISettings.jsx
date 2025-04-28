// src/features/settings/components/AISettings.jsx
// Component for managing AI provider settings (Local vs Cloud).

import { useEffect } from "react"; // Keep useEffect for initial check/cleanup if needed, remove useState/useCallback
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch"; // Updated path
import { Label } from "@/components/ui/label"; // Updated path
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"; // Updated path
import { Badge } from "@/components/ui/badge"; // Updated path
import { Button } from "@/components/ui/button"; // Updated path
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Updated path
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
// Remove unused service imports if hook handles them
// import { getAIProviderStatus, toggleAIProvider } from "../services/aiSettingsService"; 
import { useAISettings } from "../hooks/useAISettings"; // Import the custom hook - relative path is okay
// Remove useToast if the hook handles it entirely
// import { useToast } from "@/hooks/use-toast"; // This line was already commented out, but updating path if uncommented

const AISettings = () => {
  // Use the custom hook to manage state and logic
  const {
    isLocalAI,
    isLoading,
    isToggling,
    statusMessage, // Now a string directly from the hook
    connectionStatus,
    connectionCheckResult, // Now an object { status, message, details? }
    handleToggle,
    handleCheckConnection,
    refetchStatus // Added refetch capability
  } = useAISettings();

  // Remove all useState, useCallback, and useEffect logic that's now in the hook
  // const { toast } = useToast(); // Removed
  // const [isLocalAI, setIsLocalAI] = useState(false); // Removed
  // const [isLoading, setIsLoading] = useState(true); // Removed
  // const [isToggling, setIsToggling] = useState(false); // Removed
  // const [statusMessage, setStatusMessage] = useState(null); // Removed (now a string)
  // const [connectionStatus, setConnectionStatus] = useState("unknown"); // Removed
  // const [connectionCheckResult, setConnectionCheckResult] = useState(null); // Removed (now an object)

  // const fetchProviderStatus = useCallback(...); // Removed
  // const handleToggle = useCallback(...); // Removed (provided by hook)
  // const checkLMStudioConnection = async () => { ... }; // Renamed to handleCheckConnection in hook
  // useEffect(() => { fetchProviderStatus(); }, []); // Removed (handled by hook)

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
      className="w-full max-w-2xl mx-auto" // Added max-width and centering
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
          {/* Main Toggle Section */}
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
                  onCheckedChange={handleToggle} // Use handler from hook
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
                  className={`capitalize ${connectionStatus === 'checking' || connectionStatus === 'unknown' ? 'animate-pulse' : ''}`} // Updated pulse condition
                >
                  {connectionStatus}
                </Badge>
              )}
            </div>
             {/* Status Message Display */}
             {statusMessage && (
               <p className={`text-sm mt-2 ${
                 connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 
                 connectionStatus === 'disconnected' ? 'text-red-600 dark:text-red-400' : 
                 connectionStatus === 'checking' ? 'text-blue-600 dark:text-blue-400' : 
                 'text-muted-foreground' // Default for 'unknown' or other messages
               }`}>
                 {statusMessage}
               </p>
             )}
          </div>

          {/* Connection Check Result */} 
          {connectionCheckResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-md text-sm flex flex-col gap-2 border ${connectionCheckResult.status ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}
            >
             <div className="flex items-center gap-2 font-medium">
                {connectionCheckResult.status ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{connectionCheckResult.message || (connectionCheckResult.status ? "Connection Successful" : "Connection Failed")}</span>
              </div>
              {connectionCheckResult.details && (
                <pre className="text-xs mt-2 p-2 bg-muted/50 rounded overflow-x-auto">
                  {typeof connectionCheckResult.details === 'string' ? connectionCheckResult.details : JSON.stringify(connectionCheckResult.details, null, 2)}
                </pre>
               )}
            </motion.div>
          )}

          {/* Local AI Specific Section */} 
          {isLocalAI && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 space-y-4 p-4 bg-muted/50 rounded-md border"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Info size={16} className="text-blue-500"/>
                    Local AI (LM Studio) Requirements
                </p>
                <Button
                  onClick={handleCheckConnection} // Use handler from hook
                  disabled={isLoading || isToggling || connectionStatus === 'checking'}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {connectionStatus === 'checking' ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                  Check Connection
                </Button>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-2">
                <li>Ensure LM Studio is installed and running.</li>
                <li>Verify the API server is enabled within LM Studio (usually on port 1234).</li>
                <li>Make sure your firewall allows connections to LM Studio from this application.</li>
              </ul>
              <Alert variant="info" className="mt-3 text-xs">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                  If connection fails, check LM Studio logs and ensure the correct port is configured in the server environment variables if necessary.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </CardContent>
        
        <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
          Toggling the AI provider may require an application restart to take full effect in all features. Current status: {isLoading ? "Loading..." : isLocalAI ? `Local (${connectionStatus})` : "Cloud"}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AISettings;
