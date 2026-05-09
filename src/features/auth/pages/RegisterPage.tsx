import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/auth-context";
import { registerSchema } from "@/features/auth/schemas/register.schema";

export function RegisterPage() {
  const navigate = useNavigate();
  const { session, profile, signUp } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const result = registerSchema.safeParse({
      full_name: fullName,
      email,
      password,
    });

    if (!result.success) {
      setFormError("Fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, { full_name: fullName });
    if (error) {
      setFormError(error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    navigate("/account-pending", { replace: true });
  };

  const errorMessage = formError;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading">Create your TUHOP account</h1>
        <p className="text-sm text-muted-foreground">
          Registration requires admin approval before access.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Sign up failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder="Juan Dela Cruz"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="pl-10"
              autoComplete="name"
              required
            />
          </div>
        </div>

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
              placeholder="Create a secure password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pl-10"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-accent to-[oklch(0.82_0.10_185)] text-accent-foreground"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-accent">
          Login
        </Link>
      </div>
    </div>
  );
}
