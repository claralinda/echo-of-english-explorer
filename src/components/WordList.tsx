import { useState } from "react";
import { Trash2, Check, Star, Undo } from "lucide-react";
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
    return <div className="py-12 text-muted-foreground text-lg text-center bg-white">
        No words or sayings saved yet.
      </div>;
  }
  return <ul className="w-full bg-white min-h-screen px-0">
      {words.map((w, idx) => <li key={w.id} className={`border-b border-[#ededed] last:border-b-0 px-4 ${idx === 0 ? "pt-4" : "pt-2"} pb-2`}>
          <div className="flex items-start justify-between gap-3">
            <button type="button" className="flex flex-col items-start justify-center flex-1 text-left focus:outline-none" onClick={() => setOpenId(openId === w.id ? null : w.id)} aria-expanded={openId === w.id} data-testid="word-collapsible">
              <span className="font-medium text-[0.9rem] leading-tight text-gray-600 ">
                {w.text}
              </span>
              <span className="text-xs mt-0.5 text-gray-400 font-normal leading-snug">
                {lcFirst(w.definition)}
              </span>
              {w.examples.length > 0 && openId === w.id ? <ul className="mt-1 ml-1 pl-2 border-l-2 border-gray-100 text-xs text-gray-400">
                  {w.examples.map((ex, i) => <li key={i} className="pb-1 last:pb-0">
                      {ex}
                    </li>)}
                </ul> : null}
            </button>
            <div className="flex flex-col items-end space-y-2 pt-0.5">
              {/* Action area */}
              {/* Mark as learnt */}
              {!learntMode && !!onMarkAsLearnt && <button onClick={() => onMarkAsLearnt(w.id)} className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Mark as learnt" aria-label="Mark as learnt" tabIndex={0}>
                  <Check className="w-5 h-5" />
                </button>}
              {/* Move back to learn */}
              {learntMode && !!onMoveBackToLearn && <button onClick={() => onMoveBackToLearn(w.id)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Move back to To Learn" aria-label="Move back to To Learn" tabIndex={0}>
                  <Undo className="w-5 h-5" />
                </button>}
              {/* Star/unstar */}
              {showStar && !!onStar && !starredMode && <button onClick={() => onStar(w.id)} className="p-1 text-gray-400 hover:text-yellow-400 transition-colors" title="Star" aria-label="Star" tabIndex={0}>
                  <Star className="w-5 h-5" />
                </button>}
              {showStar && !!onUnstar && starredMode && <button onClick={() => onUnstar(w.id)} className="p-1 text-yellow-500 hover:text-yellow-600 transition-colors" title="Unstar" aria-label="Unstar" tabIndex={0}>
                  <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-600" />
                </button>}
              {/* Delete */}
              {!!onDelete && <button onClick={() => onDelete(w.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete" aria-label="Delete" tabIndex={0}>
                  <Trash2 className="w-5 h-5" />
                </button>}
            </div>
          </div>
        </li>)}
    </ul>;
};
export default WordList;