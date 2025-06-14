
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: { text: string; definition: string; examples: string[] }) => void | Promise<void>;
  apiKey: string;
};

const AddWordModal = ({ open, onClose, onAdd, apiKey }: Props) => {
  const [text, setText] = useState("");
  const [definition, setDefinition] = useState("");
  const [examples, setExamples] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!text.trim() || !definition.trim()) {
      toast({ title: "Missing info", description: "Please enter a word and definition." });
      return;
    }
    setLoading(true);
    try {
      await onAdd({
        text: text.trim(),
        definition: definition.trim(),
        examples: examples
          .split("\n")
          .map((e) => e.trim())
          .filter((e) => e),
      });
      setText("");
      setDefinition("");
      setExamples("");
      toast({ title: "Added!", description: `Saved "${text.trim()}" with definition.` });
      onClose();
    } catch (e) {
      toast({ title: "Error", description: "Failed to save word.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Word or Saying</DialogTitle>
          <DialogDescription>
            Enter the word/saying, its definition, and examples. No API is used.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Enter word or saying…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <Input
            placeholder="Definition…"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            disabled={loading}
          />
          <textarea
            placeholder="Examples (one per line)…"
            className="w-full border rounded-lg px-3 py-2 text-base"
            value={examples}
            rows={3}
            onChange={(e) => setExamples(e.target.value)}
            disabled={loading}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Saving…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddWordModal;
