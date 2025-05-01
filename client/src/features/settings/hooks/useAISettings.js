import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getAIProviderStatus,
  toggleAIProvider,
  checkLocalAIConnection,
} from "../services/aiSettingsService";

// Local storage key for persisting AI provider selection
const AI_PROVIDER_STORAGE_KEY = "task-tree-ai-provider";

export const useAISettings = () => {
  const { toast } = useToast();
  // Initialize from localStorage if available, otherwise default to "cloud"
  const [provider, setProvider] = useState(() => {
    const savedProvider = localStorage.getItem(AI_PROVIDER_STORAGE_KEY);
    return savedProvider || "cloud";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Fetching status...");
  const [connectionStatus, setConnectionStatus] = useState("unknown"); // 'connected', 'disconnected', 'checking', 'unknown'
  const [connectionCheckResult, setConnectionCheckResult] = useState(null); // Stores result object from check

  // Sync state with localStorage whenever provider changes
  useEffect(() => {
    localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
  }, [provider]);

  const fetchProviderStatus = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage("Fetching AI provider status...");
    setConnectionCheckResult(null); // Clear previous check results
    try {
      const data = await getAIProviderStatus();
      
      // Only update provider from server if it differs from localStorage
      // This ensures user's local choice takes precedence
      if (data.provider && data.provider !== provider) {
        setProvider(data.provider);
      }
      
      setConnectionStatus(data.status || "unknown");
      
      // Set status message based on provider
      if (provider === "cloud") {
        setStatusMessage("Using Cloud AI Provider");
      } else if (provider === "local") {
        setStatusMessage(`Using Local AI Provider (${data.status || "unknown"})`);
      } else if (provider === "ollama") {
        setStatusMessage(`Using Ollama AI Provider (${data.status || "unknown"})`);
      } else {
        setStatusMessage(`Using ${provider} AI Provider`);
      }
    } catch (error) {
      console.error("Error fetching AI provider status:", error);
      setStatusMessage("Error fetching status");
      toast({
        title: "Error",
        description: "Failed to fetch AI provider status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider, toast]);

  useEffect(() => {
    fetchProviderStatus();
    
    // Set up an interval to periodically check the status 
    // (especially important for local providers that might start/stop)
    const intervalId = setInterval(fetchProviderStatus, 30000); // 30 seconds
    
    return () => {
      clearInterval(intervalId); // Clean up the interval on component unmount
    };
  }, [fetchProviderStatus]);

  const handleProviderChange = useCallback(async (newProvider) => {
    if (newProvider === provider) return; // No change
    
    setIsToggling(true);
    setConnectionCheckResult(null); // Clear check results when toggling
    
    // Set message based on provider selection
    if (newProvider === "cloud") {
      setStatusMessage("Switching to Cloud AI...");
    } else if (newProvider === "local") {
      setStatusMessage("Switching to Local AI (LM Studio)...");
    } else if (newProvider === "ollama") {
      setStatusMessage("Switching to Ollama...");
    } else {
      setStatusMessage(`Switching to ${newProvider}...`);
    }

    // Optimistic UI update
    setProvider(newProvider);

    try {
      const data = await toggleAIProvider(newProvider);
      
      // Update state based on response
      setProvider(data.provider || newProvider);
      setConnectionStatus(data.status || "unknown");
      
      // Set status message based on provider
      if (data.provider === "cloud") {
        setStatusMessage("Switched to Cloud AI Provider");
      } else if (data.provider === "local") {
        setStatusMessage(`Switched to Local AI Provider (${data.status || "unknown"})`);
      } else if (data.provider === "ollama") {
        setStatusMessage(`Switched to Ollama AI Provider (${data.status || "unknown"})`);
      } else {
        setStatusMessage(`Switched to ${data.provider} AI Provider`);
      }
      
      toast({
        title: "Success",
        description: `Successfully switched to ${data.provider === "cloud" ? "Cloud" : data.provider === "local" ? "Local" : "Ollama"} AI provider.`,
      });
    } catch (error) {
      console.error("Error setting AI provider:", error);
      // Revert optimistic update on error
      setProvider(provider);
      setStatusMessage("Error switching provider");
      toast({
        title: "Error",
        description: "Failed to switch AI provider. Please try again.",
        variant: "destructive",
      });
      // Fetch status again to ensure UI consistency after failure
      await fetchProviderStatus(); 
    } finally {
      setIsToggling(false);
    }
  }, [provider, toast, fetchProviderStatus]);

  const handleCheckConnection = useCallback(async () => {
    if (provider === "cloud") {
        toast({
            title: "Info",
            description: "Connection check is only applicable for local AI providers.",
            variant: "default",
          });
      return; // Don't check if using cloud
    }

    setConnectionStatus("checking");
    setStatusMessage(`Checking connection to ${provider} AI...`);
    setConnectionCheckResult(null);
    try {
      const result = await checkLocalAIConnection();
      setConnectionStatus(result.status ? "connected" : "disconnected");
      setStatusMessage(
        result.status
          ? `Successfully connected to ${provider === "local" ? "Local" : "Ollama"} AI.`
          : `Failed to connect to ${provider === "local" ? "Local" : "Ollama"} AI.`,
      );
      setConnectionCheckResult(result); // Store the full result
      toast({
        title: result.status ? "Connection Successful" : "Connection Failed",
        description:
          result.message ||
          (result.status ? `${provider === "local" ? "LM Studio" : "Ollama"} is reachable.` : `Could not reach ${provider === "local" ? "LM Studio" : "Ollama"}.`),
        variant: result.status ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`Error checking ${provider} AI connection:`, error);
      setConnectionStatus("disconnected");
      setStatusMessage("Error checking connection");
      setConnectionCheckResult({
        status: false,
        message: error.message || "An unexpected error occurred.",
        details: error.response?.data || error.toString(),
      });
      toast({
        title: "Connection Error",
        description:
          error.message || "Failed to check connection. See console for details.",
        variant: "destructive",
      });
    } finally {
        // No status change needed here, handled within try/catch
    }
  }, [provider, toast]);

  return {
    provider,
    isLoading,
    isToggling,
    statusMessage,
    connectionStatus,
    connectionCheckResult,
    handleProviderChange,
    handleCheckConnection,
    refetchStatus: fetchProviderStatus, // Expose refetch capability
  };
}; 