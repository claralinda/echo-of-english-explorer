
import { WordEntry } from "@/hooks/useLocalWords";
import { Button } from "@/components/ui/button";
import { Check, Delete } from "lucide-react";

type Props = {
  words: WordEntry[];
  onDelete?: (id: string) => void;
  onMarkAsLearnt?: (id: string) => void;
  onMoveBackToLearn?: (id: string) => void;
  learntMode?: boolean;
};

const WordTable = ({ words, onDelete, onMarkAsLearnt, onMoveBackToLearn, learntMode = false }: Props) => {
  if (words.length === 0)
    return <div className="py-12 text-muted-foreground text-lg">{learntMode ? "No learnt words yet." : "No words or sayings saved yet."}</div>;

  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="p-4 text-left font-bold">Word/Saying</th>
            <th className="p-4 text-left font-bold">Definition</th>
            <th className="p-4 text-left font-bold">Example(s)</th>
            {(onDelete || onMarkAsLearnt || onMoveBackToLearn) && <th className="p-4"></th>}
          </tr>
        </thead>
        <tbody>
          {words.map((w) => (
            <tr key={w.id} className="border-b hover:bg-muted/30 duration-100">
              <td className="p-4 font-medium">{w.text}</td>
              <td className="p-4 max-w-xs whitespace-pre-line">{w.definition}</td>
              <td className="p-4 max-w-lg">
                <ul className="list-disc list-inside space-y-1">
                  {w.examples.map((ex, idx) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
              </td>
              {(onDelete || onMarkAsLearnt || onMoveBackToLearn) && (
                <td className="p-4 space-x-2">
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(w.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Delete />
                    </Button>
                  )}
                  {onMarkAsLearnt && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onMarkAsLearnt(w.id)}
                      aria-label="Mark as Learnt"
                      title="Mark as Learnt"
                    >
                      <Check />
                    </Button>
                  )}
                  {onMoveBackToLearn && (
                    <Button size="sm" variant="outline" onClick={() => onMoveBackToLearn(w.id)}>
                      Move back
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

