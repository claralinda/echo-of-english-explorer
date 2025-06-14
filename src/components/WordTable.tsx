import { WordEntry } from "@/hooks/useLocalWords";
import { Button } from "@/components/ui/button";
import { BookIcon } from "lucide-react";

type Props = {
  words: WordEntry[];
  onDelete?: (id: string) => void;
};

const WordTable = ({ words, onDelete }: Props) => {
  if (words.length === 0)
    return <div className="py-12 text-muted-foreground text-lg">No words or sayings saved yet.</div>;

  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="p-4 text-left font-bold">Word/Saying</th>
            <th className="p-4 text-left font-bold">Definition</th>
            <th className="p-4 text-left font-bold">Example(s)</th>
            {onDelete && <th className="p-4"></th>}
          </tr>
        </thead>
        <tbody>
          {words.map((w) => (
            <tr key={w.id} className="border-b hover:bg-muted/30 duration-100">
              <td className="p-4 font-medium">
                {w.text}
              </td>
              <td className="p-4 max-w-xs whitespace-pre-line">{w.definition}</td>
              <td className="p-4 max-w-lg">
                <ul className="list-disc list-inside space-y-1">
                  {w.examples.map((ex, idx) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
              </td>
              {onDelete && (
                <td className="p-4">
                  <Button size="sm" variant="destructive" onClick={() => onDelete(w.id)}>
                    Delete
                  </Button>
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
