import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Picks a random quiz entry, supporting both legacy string and {sentence, answer} objects
function pickRandomQuiz(words) {
  if (!words || words.length === 0) return null;
  // Build a list of quiz entries
  const entries = words.flatMap(w => (w.examples || []).map(ex => {
    if (ex && typeof ex === "object" && "sentence" in ex) {
      // Use answer field if present, fallback to word if missing
      return {
        word: w.text,
        sentence: ex.sentence,
        answer: ex.answer || w.text,
        id: w.id
      };
    }
    // legacy fallback
    return {
      word: w.text,
      sentence: typeof ex === "string" ? ex : String(ex),
      answer: w.text,
      id: w.id
    };
  }));
  if (entries.length === 0) return null;
  const idx = Math.floor(Math.random() * entries.length);
  return entries[idx];
}
export default function PracticeSection({
  words
}) {
  const [quiz, setQuiz] = useState(() => pickRandomQuiz(words));
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "incorrect">("idle");
  if (!quiz) {
    return <div className="min-h-[400px] flex items-center justify-center py-12 text-muted-foreground text-lg text-center bg-white">
        No examples available for practice yet.<br />Add sayings with examples to unlock practice!
      </div>;
  }
  function getQuestionSentence() {
    // Sostituisce la prima occorrenza della risposta con una linea
    if (quiz.answer) {
      const re = new RegExp(quiz.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      return quiz.sentence.replace(re, "_____");
    }
    // fallback: blank out the word
    const re = new RegExp(quiz.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
    return quiz.sentence.replace(re, "_____");
  }
  function handleCheckAnswer(e) {
    e.preventDefault();
    if (input.trim().toLowerCase() === (quiz.answer || quiz.word).trim().toLowerCase()) {
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
  return <div className="min-h-[400px] flex flex-col items-center justify-center py-8 w-full max-w-lg mx-auto px-[20px]">
      <h2 className="font-bold text-lg mb-6 text-center text-white py-[30px]">Fill in the blank</h2>
      <form onSubmit={handleCheckAnswer} className="flex flex-col gap-4 items-center w-full">
        <span
          className="text-md text-gray-800 mb-6 block text-center"
          style={{ minHeight: 36 }}
        >
          {getQuestionSentence()}
        </span>
        <Input type="text" placeholder="Your answer..." autoFocus value={input} onChange={e => setInput(e.target.value)} disabled={state !== "idle"} />
        {state === "correct" && <div className="text-green-700 font-semibold">Correct! 🎉</div>}
        {state === "incorrect" && <div className="flex flex-col items-center w-full">
            <span className="text-red-600 font-semibold w-full text-center">
              Incorrect!
            </span>
            <span className="text-red-600 text-center">
              The answer is: <span className="underline">{quiz.answer}</span>
            </span>
          </div>}
        <div className="flex gap-3 pt-2 w-full">
          {state === "idle" && <Button type="submit" disabled={!input.trim()} size="sm" className="w-full">
              Check answer
            </Button>}
          {(state === "correct" || state === "incorrect") && <Button type="button" onClick={handleNext} size="sm" variant="secondary" className="w-full">
              Next
            </Button>}
        </div>
      </form>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Practice is based on your saved sayings and their example sentences.
      </div>
    </div>;
}
