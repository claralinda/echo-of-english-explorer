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
  onAdd: (entry: {
    text: string;
    definition: string;
    examples: {
      answer: string;
      sentence: string;
    }[];
  }) => void | Promise<void>;
  apiKey: string;
};

// Copiata da fetchWordDetails per coerenza nella detection:
function extractExampleAnswer(sentence: string, phrase: string): string {
  const targetWords = phrase.split(/\s+/).filter(Boolean);
  if (targetWords.length < 2) {
    // fallback: una singola parola, cerca match case-insensitive
    const re = new RegExp(targetWords[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
    const match = sentence.match(re);
    return match ? match[0] : phrase;
  }
  // Prova a trovare da più parole a meno (almeno 2 parole consecutive)
  for (let len = targetWords.length; len >= 2; len--) {
    for (let start = 0; start <= targetWords.length - len; start++) {
      const candidate = targetWords.slice(start, start + len).join(" ");
      const re = new RegExp(candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      const match = sentence.match(re);
      if (match) return match[0];
    }
  }
  // Prova la frase intera
  const phraseRe = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
  const phraseMatch = sentence.match(phraseRe);
  if (phraseMatch) return phraseMatch[0];
  // fallback
  return phrase;
}
const AddWordModal = ({
  open,
  onClose,
  onAdd,
  apiKey
}: Props) => {
  const [text, setText] = useState("");
  const [definition, setDefinition] = useState("");
  const [examples, setExamples] = useState("");
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
    if ((!definition.trim() || !examples.trim()) && !apiKey) {
      toast({
        title: "OpenAI API Key needed",
        description: "Please set your OpenAI API Key in the footer first for auto-filling.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    let _definition = definition.trim();
    let _examples: {
      answer: string;
      sentence: string;
    }[] = [];
    try {
      // Se mancano, usa OpenAI per compilarli (che restituisce già la forma giusta)
      if ((!_definition || !examples.trim()) && apiKey) {
        toast({
          title: "Fetching info…",
          description: "Getting definition & examples from OpenAI for you."
        });
        const wordDetails = await fetchWordDetails({
          apiKey,
          text: text.trim()
        });
        if (!_definition) _definition = wordDetails.definition || "";
        if (!_examples.length) {
          // Se la risposta OpenAI contiene oggetti già giusti li usiamo
          if (Array.isArray(wordDetails.examples) && wordDetails.examples.length && typeof wordDetails.examples[0] === "object" && typeof wordDetails.examples[0].sentence === "string") {
            _examples = wordDetails.examples;
          } else if (Array.isArray(wordDetails.examples)) {
            // fallback (dovrebbe mai accadere): estraiamo answer per ognuno
            _examples = wordDetails.examples.map((ex: any) => ({
              answer: extractExampleAnswer(typeof ex === "string" ? ex : ex.sentence ?? "", text.trim()),
              sentence: typeof ex === "string" ? ex : ex.sentence ?? ""
            }));
          }
        }
      }

      // Se utente inserisce esempi a mano (riga per riga)
      if (!_examples.length && examples.trim()) {
        _examples = examples.split("\n").map(str => str.trim()).filter(str => str).map(sentence => ({
          answer: extractExampleAnswer(sentence, text.trim()),
          sentence
        }));
      }
      if (!_definition) {
        toast({
          title: "Missing info",
          description: "Definition could not be generated for this word.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      if (!_examples.length) {
        toast({
          title: "Missing info",
          description: "No example sentences provided or generated.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      await onAdd({
        text: text.trim(),
        definition: _definition,
        examples: _examples
      });
      setText("");
      setDefinition("");
      setExamples("");
      toast({
        title: "Added!",
        description: `Saved "${text.trim()}" with definition.`,
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
          <DialogDescription>
            If you leave definition or examples empty,<br />
            we'll generate them using ChatGPT.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <Input placeholder="Enter saying…" value={text} onChange={e => setText(e.target.value)} autoFocus disabled={loading} />
          <Input placeholder="Definition…" value={definition} onChange={e => setDefinition(e.target.value)} disabled={loading} />
          <Textarea placeholder="Examples (one per line)…" value={examples} rows={3} onChange={e => setExamples(e.target.value)} disabled={loading} />
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
