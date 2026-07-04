"use client";

import { FileSearch } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSupabaseClient } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

type AuthFormProps = {
  callbackError?: string;
};

function getAuthCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

function getErrorMessage(error: { message: string }): string {
  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }

  if (message.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }

  if (message.includes("user already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }

  if (message.includes("password")) {
    return "Password must be at least 6 characters.";
  }

  return "Something went wrong. Please try again.";
}

export function AuthForm({ callbackError }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    callbackError === "auth_callback_failed"
      ? "Email confirmation failed. Try signing in or resend the verification email."
      : null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const resetFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setIsLoading(true);

    const supabase = createSupabaseClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(getErrorMessage(signInError));
      setIsLoading(false);
      return;
    }

    if (data.user && !data.user.email_confirmed_at) {
      setError("Please verify your email before signing in.");
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const trimmedFullName = fullName.trim();

    if (!trimmedFullName) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    const supabase = createSupabaseClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
        data: {
          full_name: trimmedFullName,
        },
      },
    });

    if (signUpError) {
      setError(getErrorMessage(signUpError));
      setIsLoading(false);
      return;
    }

    setMessage("Check your email for a verification link to activate your account.");
    setMode("sign-in");
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setIsLoading(false);
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (!email) {
      setError("Enter your email address to reset your password.");
      return;
    }

    setIsLoading(true);

    const supabase = createSupabaseClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAuthCallbackUrl()}?next=/login`,
    });

    if (resetError) {
      setError(getErrorMessage(resetError));
      setIsLoading(false);
      return;
    }

    setMessage("If an account exists for that email, a password reset link is on its way.");
    setMode("sign-in");
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    resetFeedback();

    if (!email) {
      setError("Enter your email address to resend the verification email.");
      return;
    }

    setIsLoading(true);

    const supabase = createSupabaseClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (resendError) {
      setError(getErrorMessage(resendError));
      setIsLoading(false);
      return;
    }

    setMessage("Verification email sent. Check your inbox.");
    setIsLoading(false);
  };

  const activeTab = mode === "sign-up" ? "sign-up" : "sign-in";

  return (
    <FadeIn className="w-full max-w-md">
      <div className="glass rounded-2xl border border-border p-8 shadow-card">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent-light">
            <FileSearch className="size-6 text-accent-dark" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Resume Analyzer</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {mode === "forgot-password"
              ? "Reset your password"
              : "Sign in to analyze your resume"}
          </p>
        </div>

        {mode === "forgot-password" ? (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="forgot-email"
                className="text-xs font-medium tracking-wide text-text-secondary uppercase"
              >
                Email address
              </Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-10 border-border bg-surface"
              />
            </div>

            {error ? (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="text-sm text-success-foreground" role="status">
                {message}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="brand"
              className="h-10 w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending…" : "Send reset link"}
            </Button>

            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode("sign-in");
              }}
              className="w-full text-center text-sm font-medium text-accent-dark transition-colors hover:text-accent"
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              resetFeedback();
              setMode(value as AuthMode);
            }}
            className="gap-6"
          >
            <TabsList
              variant="line"
              className="h-auto w-full justify-center gap-8 bg-transparent p-0"
            >
              <TabsTrigger
                value="sign-in"
                className="flex-none px-0 pb-3 text-sm font-medium text-text-secondary data-active:text-accent-dark after:bg-accent-dark"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="sign-up"
                className="flex-none px-0 pb-3 text-sm font-medium text-text-secondary data-active:text-accent-dark after:bg-accent-dark"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="sign-in-email"
                    className="text-xs font-medium tracking-wide text-text-secondary uppercase"
                  >
                    Email address
                  </Label>
                  <Input
                    id="sign-in-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-10 border-border bg-surface"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor="sign-in-password"
                      className="text-xs font-medium tracking-wide text-text-secondary uppercase"
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        resetFeedback();
                        setMode("forgot-password");
                      }}
                      className="text-xs font-medium text-accent-dark transition-colors hover:text-accent"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="sign-in-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-10 border-border bg-surface"
                  />
                </div>

                {error ? (
                  <p className="text-sm text-error" role="alert">
                    {error}
                  </p>
                ) : null}
                {message ? (
                  <p className="text-sm text-success-foreground" role="status">
                    {message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="brand"
                  className="h-10 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in…" : "Sign In"}
                </Button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className={cn(
                    "w-full text-center text-sm font-medium text-text-secondary transition-colors hover:text-accent-dark",
                    isLoading && "pointer-events-none opacity-50",
                  )}
                >
                  Resend verification email
                </button>
              </form>
            </TabsContent>

            <TabsContent value="sign-up">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="sign-up-full-name"
                    className="text-xs font-medium tracking-wide text-text-secondary uppercase"
                  >
                    Full name
                  </Label>
                  <Input
                    id="sign-up-full-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    className="h-10 border-border bg-surface"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sign-up-email"
                    className="text-xs font-medium tracking-wide text-text-secondary uppercase"
                  >
                    Email address
                  </Label>
                  <Input
                    id="sign-up-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-10 border-border bg-surface"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sign-up-password"
                    className="text-xs font-medium tracking-wide text-text-secondary uppercase"
                  >
                    Password
                  </Label>
                  <Input
                    id="sign-up-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    className="h-10 border-border bg-surface"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sign-up-confirm-password"
                    className="text-xs font-medium tracking-wide text-text-secondary uppercase"
                  >
                    Confirm password
                  </Label>
                  <Input
                    id="sign-up-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={6}
                    className="h-10 border-border bg-surface"
                  />
                </div>

                {error ? (
                  <p className="text-sm text-error" role="alert">
                    {error}
                  </p>
                ) : null}
                {message ? (
                  <p className="text-sm text-success-foreground" role="status">
                    {message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="brand"
                  className="h-10 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link href="/" className="font-medium text-accent-dark transition-colors hover:text-accent">
          Back to homepage
        </Link>
      </p>
    </FadeIn>
  );
}
