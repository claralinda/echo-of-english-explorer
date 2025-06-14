
import { useState, useRef } from "react";
import { Star, Trash, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

type Props = {
  words: {
    id: string;
    text: string;
    definition: string;
    examples: string[];
    createdAt: string;
  }[];
  starredMode?: boolean;
  showStar?: boolean;
  onStar?: (id: string) => void;
  onUnstar?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAsLearnt?: (id: string) => void;
  onMoveBackToLearn?: (id: string) => void;
  learntMode?: boolean;
};

const lcFirst = (str: string) =>
  str ? str.charAt(0).toLowerCase() + str.slice(1) : str;

const SWIPE_THRESHOLD = 44; // px to trigger swipe open

const WordList = ({
  words,
  starredMode = false,
  showStar = true,
  onStar,
  onUnstar,
  onDelete,
  onMarkAsLearnt,
  onMoveBackToLearn,
  learntMode = false
}: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  if (words.length === 0) {
    return (
      <div className="py-12 text-muted-foreground text-lg text-center bg-white rounded-lg">
        {starredMode ? "No starred words yet." : learntMode ? "No mastered words yet." : "No words or sayings saved yet."}
      </div>
    );
  }

  // compact white card with word/definition row that can be swiped to reveal actions
  return (
    <ul className="space-y-2">
      {words.map((w) => (
        <li key={w.id} className="relative">
          {/* Action bar, slide in from left when swiped open */}
          <div
            className={`absolute left-0 top-0 h-full flex items-center gap-1 px-2 bg-white z-10 transition-all duration-200 ${
              swipedId === w.id ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0 pointer-events-none"
            }`}
            style={{ minHeight: 56 }} // matches main row
          >
            {showStar && !starredMode && onStar && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Star"
                tabIndex={-1}
                className="text-yellow-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setSwipedId(null);
                  onStar(w.id);
                }}
              >
                <Star size={18} />
              </Button>
            )}
            {showStar && starredMode && onUnstar && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Unstar"
                tabIndex={-1}
                className="text-yellow-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setSwipedId(null);
                  onUnstar(w.id);
                }}
              >
                <Star fill="currentColor" className="text-yellow-500" size={18} />
              </Button>
            )}
            {onMarkAsLearnt && !learntMode && (
              <Button
                variant="secondary"
                size="icon"
                aria-label="Mark as mastered"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  setSwipedId(null);
                  onMarkAsLearnt(w.id);
                }}
              >
                <Check size={18} />
              </Button>
            )}
            {onMoveBackToLearn && learntMode && (
              <Button
                variant="outline"
                size="sm"
                aria-label="Move back"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  setSwipedId(null);
                  onMoveBackToLearn(w.id);
                }}
              >
                move back
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete"
                tabIndex={-1}
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setSwipedId(null);
                  onDelete(w.id);
                }}
              >
                <Trash size={18} />
              </Button>
            )}
          </div>
          {/* Main row - slide left when swiped, acts as collapsible trigger */}
          <Collapsible open={openId === w.id}>
            <CollapsibleTrigger asChild>
              <button
                className={`w-full text-left py-2 px-3 flex flex-col items-start bg-white rounded-lg shadow-sm border border-muted/40 relative transition-transform duration-200 active:bg-muted/30
                ${swipedId === w.id ? "translate-x-20" : ""}
                `}
                style={{ minHeight: 56 }}
                aria-expanded={openId === w.id}
                onClick={() => {
                  if (swipedId && swipedId !== w.id) {
                    setSwipedId(null);
                    return;
                  }
                  setOpenId(openId === w.id ? null : w.id);
                }}
                // Swipe logic (mobile only)
                onTouchStart={(e) => {
                  touchStartX.current = e.touches[0].clientX;
                }}
                onTouchMove={(e) => {
                  const startX = touchStartX.current;
                  if (startX == null) return;
                  const diff = e.touches[0].clientX - startX;
                  // swipe left
                  if (diff < -SWIPE_THRESHOLD) {
                    setSwipedId(w.id);
                    touchStartX.current = null;
                  }
                  // swipe right to close
                  if (diff > SWIPE_THRESHOLD) {
                    setSwipedId(null);
                    touchStartX.current = null;
                  }
                }}
                onTouchEnd={() => {
                  touchStartX.current = null;
                }}
              >
                <span className="flex items-center">
                  <span className="font-semibold text-base mr-1 truncate max-w-[60vw]">{w.text}</span>
                </span>
                <span className="text-muted-foreground text-xs mt-0.5 font-normal max-w-full truncate" style={{fontWeight: 400, color: "rgba(60,60,60,0.60)"}}>
                  {lcFirst(w.definition)}
                </span>
                {w.examples.length > 0 && (
                  <span className="text-xs text-blue-700 mt-0.5 opacity-70 underline underline-offset-4">
                    {openId === w.id ? "Hide examples" : "Tap to see examples"}
                  </span>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {w.examples.length > 0 && (
                <ul className="text-[11px] leading-5 text-muted-foreground pl-5 pb-2 mt-1">
                  {w.examples.map((ex, idx) => (
                    <li key={idx} className="list-disc mx-[8px]">{ex}</li>
                  ))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        </li>
      ))}
    </ul>
  );
};

export default WordList;

