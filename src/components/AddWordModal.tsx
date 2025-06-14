import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { fetchWordDetails } from "@/lib/fetchWordDetails";

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
    if (!text.trim()) {
      toast({ title: "Missing word", description: "Please enter a word or saying." });
      return;
    }
    if ((!definition.trim() || !examples.trim()) && !apiKey) {
      toast({
        title: "OpenAI API Key needed",
        description: "Please set your OpenAI API Key in the footer first for auto-filling.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    let _definition = definition.trim();
    let _examples = examples
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e);

    try {
      // If missing, use OpenAI to fill
      if ((!_definition || _examples.length === 0) && apiKey) {
        toast({ title: "Fetching info…", description: "Getting definition & examples from OpenAI for you." });
        const wordDetails = await fetchWordDetails({
          apiKey,
          text: text.trim(),
        });
        if (!_definition) _definition = wordDetails.definition || "";
        if (_examples.length === 0) _examples = wordDetails.examples || [];
      }
      if (!_definition) {
        toast({ title: "Missing info", description: "Definition could not be generated for this word.", variant: "destructive" });
        setLoading(false);
        return;
      }
      await onAdd({
        text: text.trim(),
        definition: _definition,
        examples: _examples,
      });
      setText("");
      setDefinition("");
      setExamples("");
      toast({ title: "Added!", description: `Saved "${text.trim()}" with definition.` });
      onClose();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to save word.", variant: "destructive" });
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
            Enter the word/saying, its definition, and examples.<br />
            <span className="text-xs text-muted-foreground">
              If you leave definition or examples empty, we'll try to generate them automatically using OpenAI.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Enter saying…"
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
          <Textarea
            placeholder="Examples (one per line)…"
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
