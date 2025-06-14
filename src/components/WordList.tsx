import { useState } from "react";
import { Star, X, Check } from "lucide-react";
type Word = {
  id: string;
  text: string;
  definition: string;
  examples: string[];
  createdAt: string;
};
type Props = {
  words: Word[];
  onDelete?: (id: string) => void;
  onMarkAsLearnt?: (id: string) => void;
  onMoveBackToLearn?: (id: string) => void;
  onStar?: (id: string) => void;
  onUnstar?: (id: string) => void;
  showStar?: boolean;
  learntMode?: boolean;
  starredMode?: boolean;
};
const lcFirst = (str: string) => str ? str.charAt(0).toLowerCase() + str.slice(1) : str;

const WordList = ({
  words,
  onDelete,
  onMarkAsLearnt,
  onMoveBackToLearn,
  onStar,
  onUnstar,
  showStar,
  learntMode = false,
  starredMode = false
}: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (words.length === 0) {
    return (
      <div className="py-12 text-muted-foreground text-lg text-center bg-white">
        No words or sayings saved yet.
      </div>
    );
  }

  return (
    <ul className="w-full bg-white min-h-screen px-4">
      {words.map((w, idx) => (
        <li
          key={w.id}
          className={`border-b border-[#ededed] last:border-b-0 px-0 ${idx === 0 ? "pt-4" : "pt-2"} pb-2 group transition-colors`}
        >
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="flex flex-col items-start justify-center flex-1 text-left focus:outline-none"
              onClick={() => setOpenId(openId === w.id ? null : w.id)}
              aria-expanded={openId === w.id}
              data-testid="word-collapsible"
              tabIndex={0}
            >
              <span className="font-medium text-[0.95rem] leading-tight text-gray-600">
                {w.text}
              </span>
              <span className="text-xs mt-0.5 text-gray-400 font-normal leading-snug py-px">
                {lcFirst(w.definition)}
              </span>
              {w.examples.length > 0 && openId === w.id ? (
                <ul className="mt-1 ml-0 px-0 text-[0.84em] text-gray-400 italic space-y-1">
                  {w.examples.map((ex, i) => (
                    <li key={i} className="pb-0 leading-tight">
                      {ex}
                    </li>
                  ))}
                </ul>
              ) : null}
              {/* Actions as icons, displayed only when expanded */}
              {openId === w.id && (
                <div className="flex flex-row flex-wrap gap-4 mt-2 items-center">
                  {/* Learnt/Back actions */}
                  {!learntMode && !!onMarkAsLearnt && (
                    <button
                      onClick={e => { e.stopPropagation(); onMarkAsLearnt(w.id); }}
                      className="p-3 text-green-700 hover:text-green-800 rounded-full bg-transparent focus:outline-none"
                      title="Mark as mastered"
                      aria-label="Mark as mastered"
                      type="button"
                    >
                      <Check size={22} strokeWidth={2.2} />
                    </button>
                  )}
                  {learntMode && !!onMoveBackToLearn && (
                    <button
                      onClick={e => { e.stopPropagation(); onMoveBackToLearn(w.id); }}
                      className="text-xs text-blue-700 hover:underline px-3 py-2 rounded bg-transparent focus:outline-none"
                      title="Move back to To Learn"
                      aria-label="Move back to To Learn"
                      type="button"
                    >
                      Back
                    </button>
                  )}
                  {/* Star/Unstar as icons */}
                  {showStar && !!onStar && !starredMode && (
                    <button
                      onClick={e => { e.stopPropagation(); onStar(w.id); }}
                      className="p-3 text-yellow-400 hover:text-yellow-500 rounded-full bg-transparent focus:outline-none"
                      title="Star"
                      aria-label="Star"
                      type="button"
                    >
                      <Star size={22} strokeWidth={2.2} />
                    </button>
                  )}
                  {showStar && !!onUnstar && starredMode && (
                    <button
                      onClick={e => { e.stopPropagation(); onUnstar(w.id); }}
                      className="p-3 text-yellow-500 hover:text-yellow-600 rounded-full bg-transparent focus:outline-none"
                      title="Unstar"
                      aria-label="Unstar"
                      type="button"
                    >
                      <Star size={22} fill="currentColor" strokeWidth={2.1} />
                    </button>
                  )}
                  {/* Delete as icon */}
                  {!!onDelete && (
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(w.id); }}
                      className="p-3 text-[#ef233c] hover:text-[#ff3d57] rounded-full bg-transparent focus:outline-none"
                      title="Delete"
                      aria-label="Delete"
                      type="button"
                    >
                      <X size={22} strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              )}
            </button>
            {/* Right column is empty, omit */}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default WordList;
