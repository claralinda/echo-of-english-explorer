
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Stores and retrieves the OpenAI API key for a user in Supabase.
 * @param userId The id of the signed-in Supabase user.
 */
export function useUserApiKey(userId: string | null) {
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch API key when userId changes (on login/logout)
  useEffect(() => {
    if (!userId) {
      setApiKey("");
      return;
    }
    setLoading(true);
    supabase
      .from("user_api_keys")
      .select("openai_api_key")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) {
          setApiKey("");
          return;
        }
        setApiKey(data.openai_api_key || "");
      });
  }, [userId]);

  // Set API key in Supabase (upsert: insert or update), then update state
  const saveApiKey = async (key: string) => {
    if (!userId) return;
    setLoading(true);
    await supabase
      .from("user_api_keys")
      .upsert(
        [
          {
            user_id: userId,
            openai_api_key: key,
          },
        ],
        { onConflict: "user_id" }
      );
    setApiKey(key);
    setLoading(false);
  };

  return { apiKey, setApiKey: saveApiKey, loading };
}
