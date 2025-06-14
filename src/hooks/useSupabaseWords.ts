
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Use a valid fixed demo UUID
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export type SupabaseWordEntry = {
  id: string;
  text: string;
  definition: string;
  examples: any[]; // Accept array of strings or objects
  list: "to_learn" | "learnt" | "starred";
  createdAt: string;
};

export function useSupabaseWords(userIdInput: string | null) {
  // Fallback for demo if no user
  const userId = userIdInput || DEMO_USER_ID;

  const [words, setWords] = useState<SupabaseWordEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper to normalize examples
  function parseExamples(examples: any): any[] {
    if (!examples) return [];
    if (Array.isArray(examples)) return examples;
    try {
      // Sometimes Supabase returns JSON as string, parse it
      const parsed = typeof examples === "string" ? JSON.parse(examples) : examples;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Fetch all words for the user
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    supabase
      .from("words")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ error, data }) => {
        setLoading(false);
        if (error) {
          setWords([]);
          return;
        }
        if (!ignore && Array.isArray(data)) {
          setWords(
            data.map((w) => ({
              id: w.id,
              text: w.text,
              definition: w.definition,
              examples: parseExamples(w.examples),
              list: w.list,
              createdAt: w.created_at,
            }))
          );
        }
      });
    return () => {
      ignore = true;
    };
  }, [userId]);

  // Utility: reload words
  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error && Array.isArray(data)) {
      setWords(
        data.map((w) => ({
          id: w.id,
          text: w.text,
          definition: w.definition,
          examples: parseExamples(w.examples),
          list: w.list,
          createdAt: w.created_at,
        }))
      );
    }
  };

  // Add a new word to to_learn
  const addWord = async (entry: { text: string; definition: string; examples: any[] }): Promise<void> => {
    await supabase.from("words").insert([
      {
        text: entry.text,
        definition: entry.definition,
        examples: entry.examples,
        user_id: userId,
        list: "to_learn",
      },
    ]);
    await reload();
  };

  // Remove a word
  const removeWord = async (id: string) => {
    await supabase.from("words").delete().eq("id", id).eq("user_id", userId);
    await reload();
  };

  // Change a word's list
  const updateWordList = async (id: string, list: "to_learn" | "learnt" | "starred") => {
    await supabase.from("words").update({ list }).eq("id", id).eq("user_id", userId);
    await reload();
  };

  // Helpers for UI
  const markAsLearnt = (id: string) => updateWordList(id, "learnt");
  const moveBackToLearn = (id: string) => updateWordList(id, "to_learn");
  const starWord = (id: string) => updateWordList(id, "starred");
  const unstarWord = (id: string) => updateWordList(id, "to_learn");

  return {
    words: words.filter((w) => w.list === "to_learn"),
    learntWords: words.filter((w) => w.list === "learnt"),
    starredWords: words.filter((w) => w.list === "starred"),
    addWord,
    removeWord,
    markAsLearnt,
    moveBackToLearn,
    starWord,
    unstarWord,
    reload,
    loading,
    allWords: words,
  };
}

