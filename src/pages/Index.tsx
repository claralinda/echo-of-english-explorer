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
import { Star, Check, ListCheck, LogOut } from "lucide-react";
import InstallPrompt from "@/components/InstallPrompt";
import PracticeSection from "@/components/PracticeSection";
const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [tab, setTab] = useState<string>("to-learn");
  const {
    user,
    signOut
  } = useSupabaseAuth();

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
    unstarWord
  } = wordsBackend;

  // Use new API key hook
  const {
    apiKey,
    setApiKey,
    loading: apiKeyLoading,
    isMissing: apiKeyMissing,
    ready: apiKeyReady
  } = useUserApiKey();

  // Handle first-time entry of API key
  const handleApiKeySave = async () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      console.log("Saving API key to Supabase via setApiKey...");
      await setApiKey(trimmed);
      console.log("API key saved to Supabase.");
      setApiKeyInput("");
    }
  };

  // If not logged in, show login prompt
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-card p-8 rounded-xl w-full max-w-md shadow space-y-4 flex flex-col items-center">
          <h1 className="font-extrabold text-2xl">Everyday Sayings</h1>
          <p className="font-medium text-center">
            Please <a href="/auth" className="text-blue-600 underline">log in</a> to access your words.
          </p>
        </div>
      </div>;
  }

  // If still loading API key for user, show loading
  if (!apiKeyReady) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-white">
        Loading...
      </div>;
  }

  // If user has no API key, show prompt for it (first-time)
  if (apiKeyMissing) {
    return <div className="bg-card rounded-lg p-6 max-w-md mx-auto mt-10 shadow flex flex-col gap-2 items-center text-center">
        <p className="font-semibold mb-2">Enter your OpenAI API Key:</p>
        <input className="w-full border rounded-lg px-3 py-2 text-base" type="password" placeholder="sk-..." onChange={e => setApiKeyInput(e.target.value)} value={apiKeyInput} autoFocus />
        <div className="text-xs text-muted-foreground mt-1 mb-0">
          Your API key is securely stored in your account.
        </div>
        <div className="flex gap-2 justify-center mt-2">
          <button className="px-4 py-2 bg-black text-white rounded shadow" disabled={!apiKeyInput.trim() || apiKeyLoading} onClick={handleApiKeySave}>
            {apiKeyLoading ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="text-xs mt-2" style={{
        color: "#000"
      }}>
          <a className="underline text-xs" href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">
            Get your API key
          </a>
        </div>
      </div>;
  }

  // New: For the main (non-first-time) prompt, use a separate local state for input & Save button
  const handleMainApiKeySave = async () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      await setApiKey(trimmed);
      setApiKeyInput("");
    }
  };

  // On AddWordModal "Add", set tab to "to-learn"
  const handleAddWord = async (entry: {
    text: string;
    definition: string;
    examples: {
      answer: string;
      sentence: string;
    }[]; // tipo corretto
  }) => {
    await addWord(entry);
    setTab("to-learn");
  };

  // Helper to render the subtitle (for both mobile and desktop now)
  const renderListSubtitle = () => {
    if (tab === "mastered") {
      return <span className="block text-[1rem] font-semibold mt-0.5 ml-px text-green-700"> mastered</span>;
    }
    if (tab === "starred") {
      return <span className="block text-[1rem] text-yellow-500 font-semibold mt-0.5 ml-px">starred</span>;
    }
    if (tab === "practice") {
      return <span className="block text-[1rem] font-semibold mt-0.5 ml-px text-zinc-500">practice</span>;
    }
    return null;
  };
  return <div className="min-h-screen bg-white flex flex-col relative">
      <InstallPrompt />
      {/* Compact header for mobile, roomy for desktop */}
      <header className="pt-6 pb-0 flex flex-row items-start justify-between gap-4 container w-full max-w-full md:px-0 bg-white px-[13px]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-extrabold truncate mb-0">
              <span>Everyday sayings</span>
            </h1>
          </div>
          {/* subtitle sotto il titolo, sia mobile che desktop */}
          {renderListSubtitle()}
        </div>
        {user && <button onClick={signOut} title="Log Out" aria-label="Log Out" style={{
        marginTop: 0
      }} className="p-1.5 rounded-full hover:bg-accent transition flex items-center justify-center py-[9px]">
            <LogOut size={18} className="text-gray-400" />
          </button>}
      </header>
      {/* MAIN BODY */}
      <main className="flex-1 pb-[80px] pt-2 w-full max-w-full container px-0 md:px-0 bg-white">
        {!apiKey ? <div className="bg-card rounded-lg p-6 max-w-md mx-auto mt-10 shadow flex flex-col gap-4 items-center text-center">
            <p className="font-semibold mb-2">Enter your OpenAI API Key to enable saving new sayings:</p>
            <input className="w-full border rounded-lg px-3 py-2 text-base" type="password" placeholder="sk-..." onChange={e => setApiKeyInput(e.target.value)} value={apiKeyInput} autoFocus />
            <div className="flex gap-2 justify-center mt-2">
              <button className="px-4 py-2 bg-primary text-white rounded shadow" disabled={!apiKeyInput.trim()} onClick={handleMainApiKeySave}>
                Save
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              Your API key is stored only in this browser.
              <br />
              <a className="text-blue-600 underline text-xs" href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer">
                Get your API key
              </a>
            </div>
          </div> : <div className="block md:hidden w-full bg-white"> 
            {/* MOBILE: All tabs in the bottom bar, subtitles now in header */}
            <div className="pt-2 px-2">
              {tab === "to-learn" && (
                <WordList
                  words={words}
                  onDelete={removeWord}
                  onMarkAsLearnt={markAsLearnt}
                  onStar={starWord}
                  showStar={true}
                  learntMode={false}
                />
              )}
              {tab === "mastered" && (
                <WordList
                  words={learntWords}
                  onDelete={removeWord}
                  onMoveBackToLearn={moveBackToLearn}
                  onStar={starWord}
                  showStar={true}
                  learntMode={true}
                />
              )}
              {tab === "starred" && (
                <WordList
                  words={starredWords}
                  onDelete={removeWord}
                  onMoveBackToLearn={moveBackToLearn}
                  onUnstar={unstarWord}
                  showStar={true}
                  starredMode={true}
                />
              )}
              {tab === "practice" && (
                <PracticeSection
                  words={[...words, ...starredWords]} // EXCLUDE learntWords/mastered
                  onMarkAsLearnt={markAsLearnt}
                />
              )}
            </div>
            {/* Floating "Add" button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="fixed z-40 bottom-[88px] right-5 bg-primary text-white rounded-full p-4 flex items-center justify-center active:scale-95 transition-all hover:scale-105 animate-fade-in"
              aria-label="Add saying"
            >
              <Plus className="w-7 h-7" />
            </button>
            {/* Flat, no shadow, light gray bottom bar for tab switching */}
            <nav
              className="fixed z-30 bottom-0 left-0 right-0 h-[80px] bg-[#f7f7f8] border-t flex justify-around items-center animate-fade-in"
              style={{
                boxShadow: "none"
              }}
            >
              <button className={`flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all ${tab === "to-learn" ? "text-primary font-bold" : "text-muted-foreground"}`} onClick={() => setTab("to-learn")} aria-label="To Learn">
-                 <span className="w-6 h-6 flex items-center justify-center pb-1">
+                 <span className="w-6 h-6 flex items-center justify-center pb-1 mb-2">
                    <ListCheck />
                  </span>
                </button>
                <button className={`flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all ${tab === "mastered" ? "text-primary font-bold" : "text-muted-foreground"}`} onClick={() => setTab("mastered")} aria-label="Mastered">
-                 <span className={`w-6 h-6 flex items-center justify-center pb-1 ${tab === "mastered" ? "text-green-700" : ""}`}>
+                 <span className={`w-6 h-6 flex items-center justify-center pb-1 mb-2 ${tab === "mastered" ? "text-green-700" : ""}`}>
                    <Check />
                  </span>
                </button>
                <button className={`flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all ${tab === "starred" ? "text-yellow-500 font-bold" : "text-muted-foreground"}`} onClick={() => setTab("starred")} aria-label="Starred">
-                 <span className="w-6 h-6 flex items-center justify-center pb-1">
+                 <span className="w-6 h-6 flex items-center justify-center pb-1 mb-2">
                    <Star />
                  </span>
                </button>
                <button
                  className={`flex flex-col items-center justify-center flex-1 px-1 py-1 transition-all ${
                    tab === "practice" ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setTab("practice")}
                  aria-label="Practice"
                >
-                 <span
-                   className={
-                     "w-6 h-6 flex items-center justify-center text-2xl pb-1"
-                   }
-                 >
-                   ?
-                 </span>
+                 <span
+                   className={
+                     "w-6 h-6 flex items-center justify-center text-2xl pb-1 mb-2"
+                   }
+                 >
+                   ?
+                 </span>
                </button>
              </nav>
            </div>}
        {/* DESKTOP: mimic classic look, not bottom bar */}
        {apiKey && <div className="hidden md:block bg-white">
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
                <TabsTrigger value="practice" className="w-40">
                  📝 Practice
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
              <TabsContent value="practice">
                <PracticeSection
                  words={[...words, ...starredWords]} // EXCLUDE learntWords/mastered
                  onMarkAsLearnt={markAsLearnt}
                />
              </TabsContent>
            </Tabs>
            {/* Desktop normal FAB */}
            <Button size="lg" onClick={() => setModalOpen(true)} className="fixed right-10 bottom-10 z-50 hidden md:inline-flex">
              + Add saying
            </Button>
          </div>}

        {/* Add Saying Modal */}
        <AddWordModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddWord} apiKey={apiKey} />
      </main>
      {/* Footer with settings link */}
      <footer className="text-xs text-muted-foreground pb-2 pt-2 text-center opacity-80 w-full bg-white">
        Powered by{" "}
        <span className="text-blue-600 underline hover:text-blue-800" style={{
        cursor: "pointer"
      }}>
          ChatGPT
        </span>{" "}
        | Your sayings are saved in your browser.
      </footer>
    </div>;
};
export default Index;
