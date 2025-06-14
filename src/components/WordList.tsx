
import { useState } from "react";
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
  if (words.length === 0) {
    return <div className="py-12 text-muted-foreground text-lg text-center">
        {starredMode ? "No starred words yet." : learntMode ? "No mastered words yet." : "No words or sayings saved yet."}
      </div>;
  }
  return <ul className="divide-y divide-muted/50">
      {words.map(w => <li key={w.id}>
          <Collapsible open={openId === w.id}>
            <CollapsibleTrigger asChild>
              <button className="w-full text-left py-3 px-2 flex flex-col items-start active:bg-muted/50 transition rounded group" onClick={() => setOpenId(openId === w.id ? null : w.id)} aria-expanded={openId === w.id} data-testid="word-collapsible">
                <span className="flex items-center">
                  <span className="font-semibold text-base mr-2">{w.text}</span>
                  {/* Star/Unstar */}
                  {showStar && !starredMode && onStar && <Button variant="ghost" size="icon" className="ml-1 text-yellow-500" aria-label="Star" tabIndex={-1} onClick={e => {
                e.stopPropagation();
                onStar(w.id);
              }}>
                      <Star size={18} />
                    </Button>}
                  {showStar && starredMode && onUnstar && <Button variant="ghost" size="icon" aria-label="Unstar" tabIndex={-1} onClick={e => {
                e.stopPropagation();
                onUnstar(w.id);
              }}>
                      <Star fill="currentColor" className="text-yellow-500" size={18} />
                    </Button>}
                  {onMarkAsLearnt && !learntMode && <Button variant="secondary" size="icon" aria-label="Mark as mastered" tabIndex={-1} onClick={e => {
                e.stopPropagation();
                onMarkAsLearnt(w.id);
              }}>
                      <Check size={18} />
                    </Button>}
                  {onMoveBackToLearn && learntMode && <Button variant="outline" size="sm" aria-label="Move back" tabIndex={-1} onClick={e => {
                e.stopPropagation();
                onMoveBackToLearn(w.id);
              }}>
                      move back
                    </Button>}
                  {onDelete && <Button variant="ghost" size="icon" aria-label="Delete" tabIndex={-1} className="text-destructive" onClick={e => {
                e.stopPropagation();
                onDelete(w.id);
              }}>
                      <Trash size={18} />
                    </Button>}
                </span>
                <span className="text-muted-foreground text-sm mt-0.5 font-normal">
                  {/* Make the first letter lowercase */}
                  {lcFirst(w.definition)}
                </span>
                {w.examples.length > 0 && <span className="text-xs text-blue-700 mt-1 opacity-70 group-hover:underline">
                    {openId === w.id ? "Hide examples" : "Tap to see examples"}
                  </span>}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {w.examples.length > 0 && <ul className="text-xs text-muted-foreground pl-5 pb-3">
                  {w.examples.map((ex, idx) => <li key={idx} className="list-disc mx-[8px]">{ex}</li>)}
                </ul>}
            </CollapsibleContent>
          </Collapsible>
        </li>)}
    </ul>;
};
export default WordList;
