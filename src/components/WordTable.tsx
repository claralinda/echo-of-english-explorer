
import { Button } from "@/components/ui/button";
import { Star, Check, Trash } from "lucide-react";

// "learntMode" is now called "masteredMode" in props for clarity
type Props = {
  words: {
    id: string;
    text: string;
    definition: string;
    examples: string[];
    createdAt: string;
  }[];
  onDelete?: (id: string) => void;
  onMarkAsLearnt?: (id: string) => void;
  onMoveBackToLearn?: (id: string) => void;
  onStar?: (id: string) => void;
  onUnstar?: (id: string) => void;
  showStar?: boolean;
  learntMode?: boolean; // legacy: keep using for backwards compatibility
  starredMode?: boolean;
};

const WordTable = ({
  words,
  onDelete,
  onMarkAsLearnt,
  onMoveBackToLearn,
  onStar,
  onUnstar,
  showStar = false,
  learntMode = false,
  starredMode = false,
}: Props) => {
  // Reinterpret "learntMode" as "masteredMode" for display text
  const masteredMode = learntMode;
  if (words.length === 0)
    return (
      <div className="py-12 text-muted-foreground text-lg">
        {starredMode
          ? "No starred words yet."
          : masteredMode
          ? "No mastered words yet."
          : "No words or sayings saved yet."}
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="p-4 text-left font-bold lowercase">word/saying</th>
            <th className="p-4 text-left font-bold lowercase">meaning</th>
            <th className="p-4 text-left font-bold lowercase">examples</th>
            {(onDelete || onMarkAsLearnt || onMoveBackToLearn || showStar) && (
              <th className="p-4"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {words.map((w) => (
            <tr key={w.id} className="border-b hover:bg-muted/30 duration-100">
              <td className="p-4 font-medium">{w.text}</td>
              <td className="p-4 max-w-xs whitespace-pre-line text-xs text-muted-foreground lowercase">
                {w.definition}
              </td>
              <td className="p-4 max-w-lg text-xs text-muted-foreground">
                <div className="space-y-1">
                  {w.examples.map((ex, idx) => (
                    <div key={idx} className="">{ex}</div>
                  ))}
                </div>
              </td>
              {(onDelete || onMarkAsLearnt || onMoveBackToLearn || showStar) && (
                <td className="p-4 flex space-x-2">
                  {/* Put star/unstar first */}
                  {showStar && !starredMode && onStar && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Star"
                      title="Star"
                      onClick={() => onStar(w.id)}
                      className="text-yellow-500"
                    >
                      <Star />
                    </Button>
                  )}
                  {showStar && starredMode && onUnstar && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Unstar"
                      title="Unstar"
                      onClick={() => onUnstar(w.id)}
                    >
                      <Star fill="currentColor" className="text-yellow-500" />
                    </Button>
                  )}
                  {/* Then Mark as Mastered/Move Back */}
                  {onMarkAsLearnt && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onMarkAsLearnt(w.id)}
                      aria-label="Mark as mastered"
                      title="Mark as mastered"
                    >
                      <Check />
                    </Button>
                  )}
                  {onMoveBackToLearn && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMoveBackToLearn(w.id)}
                    >
                      move back
                    </Button>
                  )}
                  {/* Then Delete */}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(w.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash />
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WordTable;

