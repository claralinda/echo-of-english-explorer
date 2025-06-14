
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuthPage = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Submit handler for signin/signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const redirect = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirect }
        });
        if (error) throw error;
      }
      // Auth state listener will handle redirect
    } catch (err: any) {
      setError(err.message || "Authentication error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-violet-100 dark:from-background dark:to-card">
      <div className="bg-card p-6 rounded-xl w-full max-w-md shadow space-y-4 flex flex-col items-center">
        <h1 className="font-extrabold text-2xl">Everyday Sayings</h1>
        <div className="flex gap-4 w-full mb-2 justify-center">
          <Button
            variant={mode === "signin" ? "default" : "outline"}
            onClick={() => setMode("signin")}
            className="w-1/2"
          >
            Sign In
          </Button>
          <Button
            variant={mode === "signup" ? "default" : "outline"}
            onClick={() => setMode("signup")}
            className="w-1/2"
          >
            Sign Up
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <Input
            autoFocus
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <Input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        {mode === "signup" && (
          <div className="text-xs text-muted-foreground text-center">
            After sign up, check your inbox for an email to confirm your address.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
