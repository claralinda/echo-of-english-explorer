
import { useState } from "react";

export type WordEntry = {
  id: string;
  text: string;
  definition: string;
  examples: string[];
  createdAt: string;
};

const STORAGE_KEY = "words_journal";

function loadWords(): WordEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useLocalWords() {
  const [words, setWords] = useState<WordEntry[]>(loadWords());

  const addWord = (entry: Omit<WordEntry, "id" | "createdAt">) => {
    const newEntry: WordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...words];
    setWords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeWord = (id: string) => {
    const updated = words.filter((e) => e.id !== id);
    setWords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { words, addWord, removeWord };
}
