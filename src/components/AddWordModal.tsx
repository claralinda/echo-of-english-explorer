import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: {
    text: string;
  }) => void | Promise<void>;
  apiKey: string;
};

// Funzione che mette la prima lettera in minuscolo (ma non modifica "I" come pronome)
function normalizeSaying(input: string): string {
  if (!input) return input;
  // Se la parola è "I" isolata, lasciala invariata
  if (input.trim() === "I") return input;
  // Se inizia con "I " e intende il pronome, lasciamo la "I" maiuscola
  // Short-circuit per casi tipo "I am..." oppure "I don't..."
  if (input.startsWith("I ")) return input;
  // Se inizia con "I'" (I'm, I've, I'll, I'd)
  if (/^I['']/.test(input)) return input;
  // Se inizia con virgolette poi "I" (es. "I will…")
  if (/^["'""'']?I(\s|[''])/.test(input)) return input;
  // Altrimenti minuscolizza solo la prima lettera
  return input.charAt(0).toLowerCase() + input.slice(1);
}
const AddWordModal = ({
  open,
  onClose,
  onAdd,
  apiKey
}: Props) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleAdd = async () => {
    if (!text.trim()) {
      toast({
        title: "Missing word",
        description: "Please enter a word or saying."
      });
      return;
    }
    setLoading(true);
    try {
      // Normalizza la prima lettera del saying qui (eccetto caso "I")
      const normalizedText = normalizeSaying(text.trim());
      await onAdd({
        text: normalizedText
      });
      setText("");
      toast({
        title: "Added!",
        description: `Saved "${normalizedText}".`,
        duration: 2000
      });
      onClose();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to save word.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md py-[37px]">
        <DialogHeader>
          <DialogTitle className="my-[2px]">Enter the saying</DialogTitle>
          <DialogDescription>Save a saying and let ChatGPT do the rest.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <Input placeholder="Enter saying…" value={text} onChange={e => setText(e.target.value)} autoFocus disabled={loading} />
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={loading} className="bg-zinc-700 hover:bg-zinc-600">
            {loading ? "Saving…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export default AddWordModal;