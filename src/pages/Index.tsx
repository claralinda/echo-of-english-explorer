import { useState, useEffect } from "react";
import AddWordModal from "@/components/AddWordModal";
import WordTable from "@/components/WordTable";
import { useSupabaseWords } from "@/hooks/useSupabaseWords";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Plus } from "lucide-react";
import { useUserApiKey } from "@/hooks/useUserApiKey";
import { Star, Check, ListCheck } from "lucide-react";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [tab, setTab] = useState<string>("to-learn");
  const { user, signOut } = useSupabaseAuth();

  // If user is not logged in, app shouldn't render anything (router will redirect instead)
  if (!user) {
    return null;
  }

  // Backend always: Supabase (no more demo/local option)
  const wordsBackend = useSupabaseWords(user?.id || null);

  // OpenAI API key logic: always Supabase
  const {
    apiKey: userApiKey,
    setApiKey: saveUserApiKey,
    loading: loadingUserApiKey,
  } = useUserApiKey(user?.id || null);

  // This will be either loaded from Supabase or is blank while waiting/loading
  const apiKey = userApiKey;
  const setApiKey = saveUserApiKey;

  // All word list actions
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

  // Dialog management for entering API key
  // - Show dialog on first login and whenever the key is not set.
  useEffect(() => {
    if (!loadingUserApiKey && !apiKey) {
      setApiKeyDialogOpen(true);
      setApiKeyInput("");
    } else if (apiKey) {
      setApiKeyDialogOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, loadingUserApiKey]);

  const handleApiKeySave = () => {
    setApiKey(apiKeyInput.trim());
    setApiKeyDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 dark:from-background dark:to-card flex flex-col relative">
      {/* Header */}
      <header className="pt-6 pb-3 flex items-center justify-between gap-4 container w-full max-w-full px-4 md:px-0">
        <h1 className="text-2xl font-extrabold flex-1 truncate">
          <span>Everyday sayings</span>
        </h1>
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
      <main className="flex-1 pb-[80px] pt-2 w-full max-w-full container px-0 md:px-0">
        {!apiKey || loadingUserApiKey ? (
          <div className="bg-card rounded-lg p-6 max-w-md mx-auto mt-10 shadow flex flex-col gap-4 items-center text-center">
            {loadingUserApiKey ? (
              <p className="font-semibold mb-2">Loading...</p>
            ) : (
              <>
                <p className="font-semibold mb-2">Enter your OpenAI API Key to enable saving new words:</p>
                <Button onClick={() => setApiKeyDialogOpen(true)}>Enter API Key</Button>
              </>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              You must enter your API key to get started.
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
          <>
          <div className="block md:hidden w-full"> 
            <div className="pt-2 px-2">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsContent value="to-learn">
                  <WordTable
                    words={words}
                    onDelete={removeWord}
                    onMarkAsLearnt={markAsLearnt}
                    onStar={starWord}
                    showStar={true}
                    learntMode={false}
                  />
                </TabsContent>
                <TabsContent value="mastered">
                  <WordTable
                    words={learntWords}
                    onDelete={removeWord}
                    onMoveBackToLearn={moveBackToLearn}
                    onStar={starWord}
                    showStar={true}
                    learntMode={true}
                  />
                </TabsContent>
                <TabsContent value="starred">
                  <WordTable
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
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="fixed z-40 bottom-[72px] right-5 bg-primary text-white rounded-full shadow-xl p-4 flex items-center justify-center active:scale-95 transition-all hover:scale-105 animate-fade-in"
              aria-label="Add saying"
            >
              <Plus className="w-7 h-7" />
            </button>
            <nav className="fixed z-30 bottom-0 left-0 right-0 h-[64px] bg-card shadow-inner border-t flex justify-around items-center animate-fade-in">
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
          <div className="hidden md:block">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="mb-3 flex w-full justify-center">
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
                <WordTable
                  words={words}
                  onDelete={removeWord}
                  onMarkAsLearnt={markAsLearnt}
                  onStar={starWord}
                  showStar={true}
                  learntMode={false}
                />
              </TabsContent>
              <TabsContent value="mastered">
                <WordTable
                  words={learntWords}
                  onDelete={removeWord}
                  onMoveBackToLearn={moveBackToLearn}
                  onStar={starWord}
                  showStar={true}
                  learntMode={true}
                />
              </TabsContent>
              <TabsContent value="starred">
                <WordTable
                  words={starredWords}
                  onDelete={removeWord}
                  onMoveBackToLearn={moveBackToLearn}
                  onUnstar={unstarWord}
                  showStar={true}
                  starredMode={true}
                />
              </TabsContent>
            </Tabs>
            <Button
              size="lg"
              onClick={() => setModalOpen(true)}
              className="fixed right-10 bottom-10 z-50 hidden md:inline-flex"
            >
              + Add saying
            </Button>
          </div>
          {/* Add Modal */}
          <AddWordModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addWord} apiKey={apiKey} />
          </>
        )}
        {/* API Key Management Dialog */}
        <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set your OpenAI API Key</DialogTitle>
              <DialogDescription>
                Enter your OpenAI API key for ChatGPT features.
                <br />
                <span className="text-xs text-muted-foreground">
                  Your API key is encrypted and stored in your account.
                </span>
              </DialogDescription>
            </DialogHeader>
            <input
              className="w-full border rounded-lg px-3 py-2 text-base"
              type="password"
              placeholder="sk-..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              autoFocus
              spellCheck={false}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setApiKeyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApiKeySave} disabled={!apiKeyInput.trim()}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      {/* Footer */}
      <footer className="text-xs text-muted-foreground pb-2 pt-2 text-center opacity-80 w-full">
        Powered by{" "}
        <button
          className="text-blue-600 underline hover:text-blue-800"
          style={{
            cursor: "pointer",
          }}
          type="button"
          onClick={() => setApiKeyDialogOpen(true)}
        >
          ChatGPT
        </button>{" "}
        | Your words are saved in your account.
      </footer>
    </div>
  );
};

export default Index;
