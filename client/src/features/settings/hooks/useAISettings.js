import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getAIProviderStatus,
  toggleAIProvider,
  checkLocalAIConnection,
} from "../services/aiSettingsService";

export const useAISettings = () => {
  const { toast } = useToast();
  const [isLocalAI, setIsLocalAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Fetching status...");
  const [connectionStatus, setConnectionStatus] = useState("unknown"); // 'connected', 'disconnected', 'checking', 'unknown'
  const [connectionCheckResult, setConnectionCheckResult] = useState(null); // Stores result object from check

  const fetchProviderStatus = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage("Fetching AI provider status...");
    setConnectionCheckResult(null); // Clear previous check results
    try {
      const data = await getAIProviderStatus();
      setIsLocalAI(data.useLocalAI);
      setConnectionStatus(data.connectionStatus || "unknown");
      setStatusMessage(
        data.useLocalAI
          ? `Using Local AI Provider (${data.connectionStatus || "unknown"})`
          : "Using Cloud AI Provider",
      );
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
  }, [toast]);

  useEffect(() => {
    fetchProviderStatus();
  }, [fetchProviderStatus]);

  const handleToggle = useCallback(async () => {
    setIsToggling(true);
    setConnectionCheckResult(null); // Clear check results when toggling
    const optimisticNewValue = !isLocalAI;
    setStatusMessage(optimisticNewValue ? "Switching to Local AI..." : "Switching to Cloud AI...");

    // Optimistic UI update
    setIsLocalAI(optimisticNewValue);

    try {
      const data = await toggleAIProvider(optimisticNewValue);
      setIsLocalAI(data.useLocalAI);
      setConnectionStatus(data.connectionStatus || "unknown");
      setStatusMessage(
        data.useLocalAI
          ? `Switched to Local AI Provider (${data.connectionStatus || "unknown"})`
          : "Switched to Cloud AI Provider",
      );
      toast({
        title: "Success",
        description: `Successfully switched to ${data.useLocalAI ? "Local" : "Cloud"} AI provider.`,
      });
    } catch (error) {
      console.error("Error toggling AI provider:", error);
      // Revert optimistic update on error
      setIsLocalAI(!optimisticNewValue);
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
  }, [isLocalAI, toast, fetchProviderStatus]);

  const handleCheckConnection = useCallback(async () => {
    if (!isLocalAI) {
        toast({
            title: "Info",
            description: "Connection check is only applicable for the Local AI provider.",
            variant: "default",
          });
      return; // Don't check if not using local AI
    }

    setConnectionStatus("checking");
    setStatusMessage("Checking connection to local AI...");
    setConnectionCheckResult(null);
    try {
      const result = await checkLocalAIConnection();
      setConnectionStatus(result.status ? "connected" : "disconnected");
      setStatusMessage(
        result.status
          ? "Successfully connected to Local AI."
          : "Failed to connect to Local AI.",
      );
      setConnectionCheckResult(result); // Store the full result
      toast({
        title: result.status ? "Connection Successful" : "Connection Failed",
        description:
          result.message ||
          (result.status ? "LM Studio is reachable." : "Could not reach LM Studio."),
        variant: result.status ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error checking local AI connection:", error);
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
  }, [isLocalAI, toast]);

  return {
    isLocalAI,
    isLoading,
    isToggling,
    statusMessage,
    connectionStatus,
    connectionCheckResult,
    handleToggle,
    handleCheckConnection,
    refetchStatus: fetchProviderStatus, // Expose refetch capability
  };
}; 