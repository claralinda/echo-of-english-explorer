
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Helper: Pick a random word and example, blank out the word for the quiz
function pickRandomQuiz(words) {
  if (!words || words.length === 0) return null;
  // Flatten all available examples with their word
  const entries = words.flatMap(w =>
    (w.examples || []).map(ex => ({
      word: w.text,
      ex,
      id: w.id,
    }))
  );
  if (entries.length === 0) return null;
  const idx = Math.floor(Math.random() * entries.length);
  return entries[idx];
}

export default function PracticeSection({ words }) {
  const [quiz, setQuiz] = useState(() => pickRandomQuiz(words));
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "incorrect">("idle");

  if (!quiz) {
    return (
      <div className="py-12 text-muted-foreground text-lg text-center bg-white">
        No examples available for practice yet.<br/>Add sayings with examples to unlock practice!
      </div>
    );
  }

  // Replace the actual word (case-insensitive) with ___ (once)
  function getQuestionSentence() {
    const re = new RegExp(quiz.word, "i");
    return quiz.ex.replace(re, "_____");
  }

  function handleCheckAnswer(e) {
    e.preventDefault();
    // Accept case-insensitive match
    if (input.trim().toLowerCase() === quiz.word.trim().toLowerCase()) {
      setState("correct");
    } else {
      setState("incorrect");
    }
  }

  function handleNext() {
    setQuiz(pickRandomQuiz(words));
    setInput("");
    setState("idle");
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 w-full max-w-lg mx-auto">
      <div className="bg-card rounded-xl shadow p-6 w-full">
        <h2 className="font-bold text-lg mb-6 text-center">Practice: Fill in the blank</h2>
        <form onSubmit={handleCheckAnswer} className="flex flex-col gap-4 items-center">
          <span className="text-md text-gray-800 mb-2 block text-center" style={{ minHeight: 36 }}>
            {getQuestionSentence()}
          </span>
          <input
            className="w-full border rounded-lg px-3 py-2 text-base focus:outline-primary"
            type="text"
            placeholder="Your answer..."
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={state !== "idle"}
          />
          {state === "correct" && (
            <div className="text-green-700 font-semibold">Correct! 🎉</div>
          )}
          {state === "incorrect" && (
            <div className="text-red-600 font-semibold">
              Incorrect! The answer is: <span className="underline">{quiz.word}</span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            {state === "idle" && (
              <Button type="submit" disabled={!input.trim()} size="sm">
                Check answer
              </Button>
            )}
            {(state === "correct" || state === "incorrect") && (
              <Button type="button" onClick={handleNext} size="sm" variant="secondary">
                Next
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Practice is based on your saved sayings and their example sentences.
      </div>
    </div>
  );
}
