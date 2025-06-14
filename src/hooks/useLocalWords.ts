
import { useState } from "react";

export type WordEntry = {
  id: string;
  text: string;
  definition: string;
  examples: string[];
  createdAt: string;
};

const STORAGE_KEY = "words_journal_v2";

type StoredData = {
  toLearn: WordEntry[];
  learnt: WordEntry[];
};

function loadWords(): StoredData {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return { toLearn: [], learnt: [] };
    return JSON.parse(json);
  } catch {
    return { toLearn: [], learnt: [] };
  }
}

function saveWords(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useLocalWords() {
  const [data, setData] = useState<StoredData>(loadWords());

  // Add a new word to the "to learn" list
  const addWord = (entry: Omit<WordEntry, "id" | "createdAt">) => {
    const newEntry: WordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated: StoredData = { 
      toLearn: [newEntry, ...data.toLearn],
      learnt: data.learnt,
    };
    setData(updated);
    saveWords(updated);
  };

  // Remove a word from both lists (by id)
  const removeWord = (id: string) => {
    const updated: StoredData = {
      toLearn: data.toLearn.filter((e) => e.id !== id),
      learnt: data.learnt.filter((e) => e.id !== id),
    };
    setData(updated);
    saveWords(updated);
  };

  // Move word to "learnt"
  const markAsLearnt = (id: string) => {
    const found = data.toLearn.find(e => e.id === id);
    if (!found) return;
    const updated: StoredData = {
      toLearn: data.toLearn.filter(e => e.id !== id),
      learnt: [found, ...data.learnt],
    };
    setData(updated);
    saveWords(updated);
  };

  // Move word back to "to learn"
  const moveBackToLearn = (id: string) => {
    const found = data.learnt.find(e => e.id === id);
    if (!found) return;
    const updated: StoredData = {
      toLearn: [found, ...data.toLearn],
      learnt: data.learnt.filter(e => e.id !== id),
    };
    setData(updated);
    saveWords(updated);
  };

  return { 
    words: data.toLearn, 
    learntWords: data.learnt,
    addWord, 
    removeWord,
    markAsLearnt,
    moveBackToLearn,
  };
}

