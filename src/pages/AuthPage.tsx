import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
const AuthPage = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Get session using our hook -- this lets us detect a logged in session
  const {
    session
  } = useSupabaseAuth();

  // Auto-redirect away from /auth if already signed in
  useEffect(() => {
    if (session) {
      navigate("/", {
        replace: true
      });
    }
  }, [session, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        const redirect = `${window.location.origin}/`;
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirect
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      if (err?.message) {
        // Common auth error messages
        if (err.message?.toLowerCase().includes("invalid login credentials") || err.message?.toLowerCase().includes("invalid email or password")) {
          setError("Invalid email or password.");
        } else if (err.message?.toLowerCase().includes("email not confirmed")) {
          setError("Email not confirmed. Please check your inbox.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Authentication error");
      }
    }
    setLoading(false);
  };

  // Password reset logic
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);
    setResetSent(false);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(resetEmail || email, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) {
        setError(error.message || "Could not send password reset email.");
      } else {
        setResetSent(true);
        toast({
          title: "Password reset email sent",
          description: "Check your inbox for the reset link.",
          variant: "default"
        });
      }
    } catch {
      setError("Could not send password reset email.");
    }
    setResetLoading(false);
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-violet-100 dark:from-background dark:to-card">
      <div className="bg-card p-6 rounded-xl w-full max-w-md shadow space-y-4 flex flex-col items-center">
        <h1 className="font-extrabold text-2xl">Everyday Sayings</h1>
        <div className="flex gap-4 w-full mb-2 justify-center">
          <Button variant={mode === "signin" ? "default" : "outline"} onClick={() => {
          setMode("signin");
          setError(null);
        }} className="w-1/2" disabled={loading}>
            Sign In
          </Button>
          <Button variant={mode === "signup" ? "default" : "outline"} onClick={() => {
          setMode("signup");
          setError(null);
        }} className="w-1/2" disabled={loading}>
            Sign Up
          </Button>
        </div>

        {/* Show error prominently above the form */}
        {error && <div className="w-full text-center bg-red-500/10 border border-red-200 text-red-600 py-2 px-4 rounded mb-1 text-sm">
            {error}
          </div>}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <Input autoFocus type="email" required placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
          <Input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          <Button type="submit" disabled={loading} className="mt-2 w-full bg-zinc-700 hover:bg-zinc-600">
            {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        {/* Password reset link */}
        {mode === "signin" && <div className="w-full text-right text-xs mt-1">
            <button onClick={() => {
          setShowReset(true);
          setError(null);
          setResetEmail(email);
          setResetSent(false);
        }} type="button" disabled={loading} className="hover:underline text-gray-500">
              Forgot password?
            </button>
          </div>}

        {/* Reset password mini modal-like area */}
        {showReset && <div className="w-full bg-muted border p-4 mt-3 rounded shadow flex flex-col gap-2 items-center">
            <form onSubmit={handleResetPassword} className="w-full flex flex-col items-center gap-2">
              <div className="text-sm font-medium mb-1">Reset your password</div>
              <Input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Enter your email" required className="w-full" disabled={resetLoading} />
              <Button className="w-full" type="submit" disabled={resetLoading || !resetEmail}>
                {resetLoading ? "Sending..." : "Send reset email"}
              </Button>
            </form>
            {resetSent && <div className="text-green-600 text-xs">If this email exists, you will receive reset instructions.</div>}
            <Button variant="ghost" className="mt-1 text-xs" type="button" onClick={() => setShowReset(false)}>
              Cancel
            </Button>
          </div>}

        {mode === "signup" && <div className="text-xs text-muted-foreground text-center">
            After sign up, check your inbox for an email to confirm your address.
          </div>}
      </div>
    </div>;
};
export default AuthPage;