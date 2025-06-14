
import { useState } from "react";
import AddWordModal from "@/components/AddWordModal";
import WordTable from "@/components/WordTable";
import { useLocalWords } from "@/hooks/useLocalWords";
import { Button } from "@/components/ui/button";
import { BookIcon } from "lucide-react";

const API_KEY_STORAGE = "openai_apikey";

function useOpenAIApiKey(): [string, (key: string) => void] {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(API_KEY_STORAGE) || "");
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };
  return [apiKey, setApiKey];
}

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { words, addWord, removeWord } = useLocalWords();
  const [apiKey, setApiKey] = useOpenAIApiKey();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 dark:from-background dark:to-card">
      <header className="pt-10 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 container">
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
          <BookIcon className="w-8 h-8 text-accent" />
          Words & Sayings Journal
        </h1>
        <Button size="lg" onClick={() => setModalOpen(true)}>
          + Add Word or Saying
        </Button>
      </header>
      <main className="container pb-12">
        {!apiKey ? (
          <div className="bg-card rounded-lg p-6 max-w-md mx-auto mt-20 shadow flex flex-col gap-4 items-center">
            <p className="font-semibold mb-2">Enter your OpenAI API Key to enable saving new words:</p>
            <input
              className="w-full border rounded-lg px-3 py-2 text-base"
              type="password"
              placeholder="sk-..."
              onChange={e => setApiKey(e.target.value)}
              value={apiKey}
              autoFocus
            />
            <div className="text-xs text-muted-foreground">
              Your API key is stored only in this browser.
              <br />
              <a
                className="text-blue-600 underline text-xs"
                href="https://platform.openai.com/account/api-keys" target="_blank"
                rel="noopener noreferrer"
              >
                Get your API key
              </a>
            </div>
          </div>
        ) : (
          <WordTable words={words} onDelete={removeWord} />
        )}

        <AddWordModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addWord} apiKey={apiKey} />
      </main>
      <footer className="text-xs text-muted-foreground pb-4 pt-6 text-center opacity-80">
        Powered by ChatGPT | Your words are saved locally.
      </footer>
    </div>
  );
};

export default Index;
