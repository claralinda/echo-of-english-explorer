import { useState } from "react";
import AddWordModal from "@/components/AddWordModal";
import WordTable from "@/components/WordTable";
import WordList from "@/components/WordList";
import { useLocalWords } from "@/hooks/useLocalWords";
import { useSupabaseWords } from "@/hooks/useSupabaseWords";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Plus } from "lucide-react";
import { useUserApiKey } from "@/hooks/useUserApiKey";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [tab, setTab] = useState<string>("to-learn");
  const { user, signOut } = useSupabaseAuth();

  // For words, only use Supabase for authenticated users
  const supabaseWords = useSupabaseWords(user?.id || "");
  const wordsBackend = supabaseWords;

  const {
    words,
    learntWords,
    starredWords,
    addWord,
    removeWord,
    markAsLearnt,
    moveBackToLearn,
    starWord,
    unstarWord,
  } = wordsBackend;

  // Use new API key hook
  const {
    apiKey,
    setApiKey,
    loading: apiKeyLoading,
    isMissing: apiKeyMissing,
    ready: apiKeyReady,
  } = useUserApiKey();

  // Handle first-time entry of API key
  const handleApiKeySave = async () => {
    await setApiKey(apiKeyInput.trim());
    setApiKeyInput("");
  };

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-card p-8 rounded-xl w-full max-w-md shadow space-y-4 flex flex-col items-center">
          <h1 className="font-extrabold text-2xl">Everyday Sayings</h1>
          <p className="font-medium text-center">
            Please <a href="/auth" className="text-blue-600 underline">log in</a> to access your words.
          </p>
        </div>
      </div>
    );
  }

  // If still loading API key for user, show loading
  if (!apiKeyReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-white">
        Loading...
      </div>
    );
  }

  // If user has no API key, show prompt for it
  if (apiKeyMissing) {
    return (
      <div className="bg-card rounded-lg p-6 max-w-md mx-auto mt-10 shadow flex flex-col gap-4 items-center text-center">
        <p className="font-semibold mb-2">Enter your OpenAI API Key to enable saving new words:</p>
        <input
          className="w-full border rounded-lg px-3 py-2 text-base"
          type="password"
          placeholder="sk-..."
          onChange={e => setApiKeyInput(e.target.value)}
          value={apiKeyInput}
          autoFocus
        />
        <div className="flex gap-2 justify-center mt-2">
          <button
            className="px-4 py-2 bg-primary text-white rounded shadow"
            disabled={!apiKeyInput.trim()}
            onClick={handleApiKeySave}
          >
            Save
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          Your API key is securely stored in your account.<br />
          <a
            className="text-blue-600 underline text-xs"
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
            rel="noopener noreferrer"
          >Get your API key</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Compact header for mobile, roomy for desktop */}
      <header className="pt-6 pb-0 flex items-center justify-between gap-4 container w-full max-w-full px-4 md:px-0 bg-white">
        <h1 className="text-2xl font-extrabold flex-1 truncate">
          <span>Everyday sayings</span>
        </h1>
        {/* Log out button only on mobile in header */}
        {user && (
          <Button
            size="icon"
            variant="ghost"
            onClick={signOut}
            className="ml-1 text-muted-foreground rounded-full hidden md:inline-flex"
            title="Log Out"
            aria-label="Log Out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </Button>
        )}
      </header>
      {/* MAIN BODY */}
      <main className="flex-1 pb-[80px] pt-2 w-full max-w-full container px-0 md:px-0 bg-white">
        {!apiKey ? (
          <div className="bg-card rounded-lg p-6 max-w-md mx-auto mt-10 shadow flex flex-col gap-4 items-center text-center">
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
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get your API key
              </a>
            </div>
          </div>
        ) : (
          <div className="block md:hidden w-full bg-white"> 
            {/* MOBILE: show tabs at the bottom, keep content above */}
            <div className="pt-2 px-2">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsContent value="to-learn">
                  <WordList
                    words={words}
                    onDelete={removeWord}
                    onMarkAsLearnt={markAsLearnt}
                    onStar={starWord}
                    showStar={true}
                    learntMode={false}
                  />
                </TabsContent>
                <TabsContent value="mastered">
                  <WordList
                    words={learntWords}
                    onDelete={removeWord}
                    onMoveBackToLearn={moveBackToLearn}
                    onStar={starWord}
                    showStar={true}
                    learntMode={true}
                  />
                </TabsContent>
                <TabsContent value="starred">
                  <WordList
                    words={starredWords}
                    onDelete={removeWord}
                    onMoveBackToLearn={moveBackToLearn}
                    onUnstar={unstarWord}
                    showStar={true}
                    starredMode={true}
                  />
                </TabsContent>
              </Tabs>
            </div>
            {/* Floating "Add" button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="fixed z-40 bottom-[72px] right-5 bg-primary text-white rounded-full shadow-xl p-4 flex items-center justify-center active:scale-95 transition-all hover:scale-105 animate-fade-in"
              aria-label="Add saying"
            >
              <Plus className="w-7 h-7" />
            </button>
            {/* Sticky footer tab bar */}
            <nav className="fixed z-30 bottom-0 left-0 right-0 h-[64px] bg-white shadow-inner border-t flex justify-around items-center animate-fade-in">
              <button
                className={`flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all ${tab === "to-learn" ? "text-primary font-bold" : "text-muted-foreground"}`}
                onClick={() => setTab("to-learn")}
                aria-label="To Learn"
              >
                <span className="w-6 h-6 flex items-center justify-center"><ListCheck /></span>
                <span className="text-xs mt-0.5">To Learn</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all ${tab === "mastered" ? "text-primary font-bold" : "text-muted-foreground"}`}
                onClick={() => setTab("mastered")}
                aria-label="Mastered"
              >
                <span className="w-6 h-6 flex items-center justify-center"><Check /></span>
                <span className="text-xs mt-0.5">Mastered</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all ${tab === "starred" ? "text-yellow-500 font-bold" : "text-muted-foreground"}`}
                onClick={() => setTab("starred")}
                aria-label="Starred"
              >
                <span className="w-6 h-6 flex items-center justify-center"><Star /></span>
                <span className="text-xs mt-0.5">Starred</span>
              </button>
            </nav>
          </div>
        )}
        {/* DESKTOP: mimic classic look, not bottom bar */}
        {apiKey && (
          <div className="hidden md:block bg-white">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="mb-3 flex w-full justify-center bg-white">
                <TabsTrigger value="to-learn" className="w-40">
                  To Learn
                </TabsTrigger>
                <TabsTrigger value="mastered" className="w-40">
                  Mastered
                </TabsTrigger>
                <TabsTrigger value="starred" className="w-40">
                  ⭐ Starred
                </TabsTrigger>
              </TabsList>
              <TabsContent value="to-learn">
                <WordList
                  words={words}
                  onDelete={removeWord}
                  onMarkAsLearnt={markAsLearnt}
                  onStar={starWord}
                  showStar={true}
                  learntMode={false}
                />
              </TabsContent>
              <TabsContent value="mastered">
                <WordList
                  words={learntWords}
                  onDelete={removeWord}
                  onMoveBackToLearn={moveBackToLearn}
                  onStar={starWord}
                  showStar={true}
                  learntMode={true}
                />
              </TabsContent>
              <TabsContent value="starred">
                <WordList
                  words={starredWords}
                  onDelete={removeWord}
                  onMoveBackToLearn={moveBackToLearn}
                  onUnstar={unstarWord}
                  showStar={true}
                  starredMode={true}
                />
              </TabsContent>
            </Tabs>
            {/* Desktop normal FAB */}
            <Button
              size="lg"
              onClick={() => setModalOpen(true)}
              className="fixed right-10 bottom-10 z-50 hidden md:inline-flex"
            >
              + Add saying
            </Button>
          </div>
        )}

        {/* Add Saying Modal */}
        <AddWordModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addWord} apiKey={apiKey} />
      </main>
      {/* Footer with settings link */}
      <footer className="text-xs text-muted-foreground pb-2 pt-2 text-center opacity-80 w-full bg-white">
        Powered by{" "}
        <span
          className="text-blue-600 underline hover:text-blue-800"
          style={{
            cursor: "pointer",
          }}
        >
          ChatGPT
        </span>{" "}
        | Your words are saved in your browser.
      </footer>
    </div>
  );
};

import { Star, Check, ListCheck } from "lucide-react";

export default Index;
