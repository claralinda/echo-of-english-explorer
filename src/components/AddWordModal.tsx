
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchWordDetails } from "@/lib/chatgpt";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: { text: string; definition: string; examples: string[] }) => void | Promise<void>;
  apiKey: string;
};

const AddWordModal = ({ open, onClose, onAdd, apiKey }: Props) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const details = await fetchWordDetails(apiKey, text.trim());
      await onAdd({
        text: text.trim(),
        definition: details.definition,
        examples: details.examples,
      });
      setText("");
      toast({ title: "Added!", description: `Saved "${text.trim()}" with definition.` });
      onClose();
    } catch (e) {
      toast({ title: "Error", description: "Failed to fetch definition. Check your API key!", variant: "destructive" });
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
            Type an English word or saying to fetch its definition and examples using ChatGPT.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <Input
            placeholder="Enter word or saying…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
            disabled={loading}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Fetching…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddWordModal;
