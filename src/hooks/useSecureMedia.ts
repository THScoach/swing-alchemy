import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
}

export function useSecureMedia() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSignedUrl = async (
    mediaId: string,
    expiresInHours: number = 48
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("media-signed-url", {
        body: { mediaId, expiresInHours },
      });

      if (error) throw error;

      const response = data as SignedUrlResponse;
      return response.signedUrl;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      toast({
        title: "Access Failed",
        description: "Could not access media. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getSignedUrl, loading };
}
