import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/auth-context";
import { loginSchema } from "@/features/auth/schemas/login.schema";

export function LoginPage() {
  const navigate = useNavigate();
  const { session, profile, signIn } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!session) return;
    if (profile?.status === "pending_review") {
      navigate("/account-pending", { replace: true });
      return;
    }
    navigate("/", { replace: true });
  }, [navigate, profile?.status, session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFormError("Enter a valid email and password.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      setFormError(error);
    }
    setIsSubmitting(false);
  };

  const errorMessage = formError;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading">Welcome to TUHOP!</h1>
        <p className="text-sm text-muted-foreground">
          Turning Data into Direction, Hope into Action.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Sign in failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@barangay.gov.ph"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pl-10"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pl-10"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(value) => setRememberMe(Boolean(value))}
            />
            Remember me
          </label>
          <span className="text-accent">Forgot password?</span>
        </div>

        <Button
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-accent to-[oklch(0.82_0.10_185)] text-accent-foreground"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-accent">
          Register
        </Link>
      </div>
    </div>
  );
}
