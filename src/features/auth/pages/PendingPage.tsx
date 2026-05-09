import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export function PendingPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, session } = useAuthStore();

  useEffect(() => {
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    if (profile?.status && profile.status !== "pending_review") {
      navigate("/", { replace: true });
    }
  }, [navigate, profile?.status, session]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Your account is being reviewed by a CDRRMO administrator. You will
            gain access once your account is approved.
          </p>
          <Button variant="outline" onClick={() => signOut()}>
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
