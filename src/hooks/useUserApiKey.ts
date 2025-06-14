
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "./useSupabaseAuth";

export function useUserApiKey() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKeyState] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // Load API key from Supabase table when user is available
  useEffect(() => {
    if (!user) {
      setApiKeyState("");
      setInitialized(true);
      return;
    }
    setLoading(true);
    supabase
      .from("user_api_keys")
      .select("openai_api_key")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ error, data }) => {
        if (data && data.openai_api_key) {
          setApiKeyState(data.openai_api_key);
        } else {
          setApiKeyState(""); // No key present
        }
        setLoading(false);
        setInitialized(true);
      });
  }, [user]);

  // Save API Key to Supabase table. Upsert for idempotency.
  const setApiKey = useCallback(
    async (key: string) => {
      if (!user) return;
      setLoading(true);
      const { error } = await supabase.from("user_api_keys").upsert(
        {
          user_id: user.id,
          openai_api_key: key,
        },
        { onConflict: "user_id" }
      );
      if (error) {
        console.error("Error saving API key to Supabase:", error);
      } else {
        console.log("Upserted API key to Supabase for user", user.id);
      }
      setApiKeyState(key);
      setLoading(false);
    },
    [user]
  );

  return {
    apiKey,
    setApiKey,
    loading,
    initialized,
    isMissing: initialized && !apiKey && !!user,
    ready: initialized && !!user,
  };
}
