import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/auth-context";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { motionSpring, motionDurations, motionEasing } from "@/components/shared/motion";

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1 + i * 0.06, ease: motionEasing.out },
  }),
};

export function LoginPage() {
  const navigate = useNavigate();
  const { session, profile, signIn } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFormError("Enter a valid email and password.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email, password, rememberMe);
    if (error) {
      setFormError(error);
    }
    setIsSubmitting(false);
  };

  const errorMessage = formError;

  return (
    <div className="w-full max-w-md space-y-6">
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: motionEasing.out }}
      >
        <h1 className="text-3xl font-heading">Welcome to TUHOP!</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access the flood reporting dashboard.
        </p>
      </motion.div>

      {errorMessage ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: motionDurations.quick, ease: motionEasing.out }}
        >
          <Alert variant="destructive">
            <AlertTitle>Sign in failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <motion.div
          className="space-y-2"
          custom={0}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
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
        </motion.div>

        <motion.div
          className="space-y-2"
          custom={1}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
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
        </motion.div>

        <motion.div
          className="flex flex-nowrap items-center justify-between gap-4 text-xs text-muted-foreground"
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(value) => setRememberMe(Boolean(value))}
            />
            <span>Remember me</span>
          </label>
          <span className="text-accent hover:text-accent/80 transition-colors cursor-pointer whitespace-nowrap">
            Forgot password?
          </span>
        </motion.div>

        <motion.div
          custom={3}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-accent to-[oklch(0.82_0.10_185)] text-accent-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                Signing in
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </motion.div>
      </form>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5, ease: motionEasing.out }}
      >
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-accent hover:text-accent/80 transition-colors">
          Register
        </Link>
      </motion.div>
    </div>
  );
}
