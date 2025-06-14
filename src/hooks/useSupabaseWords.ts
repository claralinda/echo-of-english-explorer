
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SupabaseWordEntry = {
  id: string;
  text: string;
  definition: string;
  examples: string[];
  list: "to_learn" | "learnt" | "starred";
  createdAt: string;
};

export function useSupabaseWords(userId: string | null) {
  const [words, setWords] = useState<SupabaseWordEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all words for the user
  useEffect(() => {
    let ignore = false;
    if (!userId) {
      setWords([]);
      return;
    }
    setLoading(true);
    supabase
      .from("words")
      .select("*")
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
              examples: w.examples || [],
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
    if (!userId) {
      setWords([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error && Array.isArray(data)) {
      setWords(
        data.map((w) => ({
          id: w.id,
          text: w.text,
          definition: w.definition,
          examples: w.examples || [],
          list: w.list,
          createdAt: w.created_at,
        }))
      );
    }
  };

  // Add a new word to to_learn
  const addWord = async (entry: { text: string; definition: string; examples: string[] }) => {
    if (!userId) return;
    const { error } = await supabase.from("words").insert([
      {
        text: entry.text,
        definition: entry.definition,
        examples: entry.examples,
        user_id: userId,
        list: "to_learn",
      },
    ]);
    await reload();
    return !error;
  };

  // Remove a word
  const removeWord = async (id: string) => {
    await supabase.from("words").delete().eq("id", id);
    await reload();
  };

  // Change a word's list
  const updateWordList = async (id: string, list: "to_learn" | "learnt" | "starred") => {
    await supabase.from("words").update({ list }).eq("id", id);
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
