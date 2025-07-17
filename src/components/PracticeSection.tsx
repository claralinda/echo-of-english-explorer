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
        id: w.id,
        definition: w.definition || ""
      };
    }
    // legacy fallback
    return {
      word: w.text,
      sentence: typeof ex === "string" ? ex : String(ex),
      answer: w.text,
      id: w.id,
      definition: w.definition || ""
    };
  }));
  if (entries.length === 0) return null;
  const idx = Math.floor(Math.random() * entries.length);
  return entries[idx];
}
type PracticeSectionProps = {
  words: any[];
  onMarkAsLearnt?: (id: string) => void;
};
export default function PracticeSection({
  words,
  onMarkAsLearnt
}: PracticeSectionProps) {
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
  function handleMarkAsLearnt() {
    if (onMarkAsLearnt && quiz?.id) {
      onMarkAsLearnt(quiz.id);
      handleNext();
    }
  }
  return <div className="min-h-[500px] flex flex-col items-center justify-center w-full max-w-lg mx-auto px-[20px] pb-[35px] relative">
      <div className="min-h-[400px] flex flex-col items-center justify-center py-8 w-full">
        <h2 className="font-bold text-lg mb-6 text-center text-white py-[30px]">Fill in the blank</h2>
        <form onSubmit={handleCheckAnswer} className="flex flex-col gap-4 items-center w-full">
          <span className="text-md text-gray-800 mb-2 block text-center" style={{
          minHeight: 36
        }}>
            {getQuestionSentence()}
          </span>
          {!!quiz.definition && <span className="text-center mb-2 text-gray-500 text-xs">
              {quiz.definition}
            </span>}
          <Input type="text" placeholder="Your answer..." value={input} onChange={e => setInput(e.target.value)} disabled={state !== "idle"} className="mx-auto w-full max-w-xs text-center h-9 rounded-md px-3 py-2 text-base font-medium border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />

          {state === "correct" && <div className="w-full flex flex-col items-center">
              <div className="text-green-700 !font-semibold mt-6 mb-2 text-base my-[10px]">
                Correct! 🎉
              </div>
              {!!onMarkAsLearnt && <Button type="button" onClick={handleMarkAsLearnt} size="sm" variant="ghost" className="w-full bg-green-50 hover:bg-green-100 !text-green-700 font-semibold mb-1">
                  Mark as mastered
                </Button>}
              <Button type="button" onClick={handleNext} size="sm" variant="secondary" className="w-full mt-1">
                Next
              </Button>
            </div>}
          {state === "incorrect" && <div className="w-full flex flex-col items-center">
              <div className="mt-6 mb-2 w-full flex flex-col items-center my-[21px]">
                <span className="text-red-600 font-semibold w-full text-center">
                  Incorrect!
                </span>
                 <span className="text-red-600 text-center text-sm">
                   The answer is: <span className="underline">{quiz.answer}</span>
                 </span>
              </div>
              <Button type="button" onClick={handleNext} size="sm" variant="secondary" className="w-full mt-1 bg-zinc-700 hover:bg-zinc-600 text-white">
                Next
              </Button>
            </div>}

          {state === "idle" && <div className="flex gap-3 pt-2 w-full">
              <Button type="submit" disabled={!input.trim()} size="sm" className="w-full bg-zinc-700 hover:bg-zinc-600">
                Check answer
              </Button>
              <Button type="button" onClick={handleNext} size="sm" variant="ghost" className="w-full">
                I don't know
              </Button>
            </div>}
        </form>
      </div>
      
      <div className="fixed left-0 w-full text-xs text-muted-foreground text-center bg-white pt-3 pb-[32px] md:pb-0 z-30 md:px-[10px] md:mx-[10px]" style={{
      bottom: 56 // o regola in base all'altezza effettiva della tua bottom bar rosa
    }}>
        Practice is based on your "to learn" sayings.
      </div>
    </div>;
}