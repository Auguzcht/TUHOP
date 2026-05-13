import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/auth-context";
import { registerSchema } from "@/features/auth/schemas/register.schema";
import { motionEasing, motionDurations } from "@/components/shared/motion";

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1 + i * 0.06, ease: motionEasing.out },
  }),
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { session, profile, signUp } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      passwordConfirm,
    });

    if (!result.success) {
      const first = result.error.issues[0];
      setFormError(first?.message ?? "Fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    const startTime = Date.now();
    const { error } = await signUp(email, password, { full_name: fullName });
    if (error) {
      setFormError(error);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 600 - elapsed);
      setTimeout(() => setIsSubmitting(false), remaining);
      return;
    }

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 600 - elapsed);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/account-pending", { replace: true });
    }, remaining);
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
        <h1 className="text-3xl font-heading">Create your TUHOP account</h1>
        <p className="text-sm text-muted-foreground">
          Registration requires admin approval before access.
        </p>
      </motion.div>

      {errorMessage ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: motionDurations.quick, ease: motionEasing.out }}
        >
          <Alert variant="destructive">
            <AlertTitle>Sign up failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Full Name */}
        <motion.div
          className="space-y-2"
          custom={0}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
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
        </motion.div>

        {/* Email */}
        <motion.div
          className="space-y-2"
          custom={1}
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

        {/* Password */}
        <motion.div
          className="space-y-2"
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <Label htmlFor="password">Password</Label>
          <InputGroup>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a secure password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-0 pl-10 shadow-none focus-visible:ring-0"
              autoComplete="new-password"
              required
            />
            <InputGroupAddon align="inline-start">
              <Lock className="size-4" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                tabIndex={-1}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </motion.div>

        {/* Confirm Password */}
        <motion.div
          className="space-y-2"
          custom={3}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <Label htmlFor="passwordConfirm">Confirm Password</Label>
          <InputGroup>
            <Input
              id="passwordConfirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className="border-0 pl-10 shadow-none focus-visible:ring-0"
              autoComplete="new-password"
              required
            />
            <InputGroupAddon align="inline-start">
              <Lock className="size-4" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                tabIndex={-1}
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </motion.div>

        {/* Submit */}
        <motion.div
          custom={4}
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
                Signing up
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              "Sign Up"
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
        Already have an account?{" "}
        <Link to="/login" className="text-accent hover:text-accent/80 transition-colors">
          Login
        </Link>
      </motion.div>
    </div>
  );
}
