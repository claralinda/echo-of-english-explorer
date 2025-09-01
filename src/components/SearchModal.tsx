import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SupabaseWordEntry } from "@/hooks/useSupabaseWords";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  allWords: SupabaseWordEntry[];
  onSelectWord: (wordId: string, list: "to_learn" | "learnt" | "starred") => void;
}

const SearchModal = ({ open, onClose, allWords, onSelectWord }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SupabaseWordEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = allWords.filter(word => 
      word.text.toLowerCase().includes(query) ||
      word.definition.toLowerCase().includes(query) ||
      word.examples.some(example => 
        typeof example === 'string' 
          ? example.toLowerCase().includes(query)
          : (example.sentence && example.sentence.toLowerCase().includes(query)) ||
            (example.answer && example.answer.toLowerCase().includes(query))
      )
    );
    
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  const handleSelectWord = (word: SupabaseWordEntry) => {
    onSelectWord(word.id, word.list);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto translate-y-[-20vh] md:translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle>Search Sayings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search in sayings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-3 py-2 bg-white text-black rounded-md border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <Button onClick={handleSearch} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600">
              <Search size={16} />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((word) => (
                <div 
                  key={word.id} 
                  className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSelectWord(word)}
                >
                  <div className="font-medium text-sm mb-1">{word.text}</div>
                  <div className="text-xs text-gray-600 mb-2">{word.definition}</div>
                  {word.examples.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {word.examples.slice(0, 1).map((example, i) => (
                        <div key={i}>
                          {typeof example === 'string' ? example : example.sentence}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasSearched && searchQuery && searchResults.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No sayings found matching "{searchQuery}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;