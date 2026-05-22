import { useNavigate } from "react-router-dom";
import { PlusCircle, User, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";

type FeedSidebarProps = {
  onAddReport: () => void;
};

export function FeedSidebar({ onAddReport }: FeedSidebarProps) {
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel =
    profile?.role === "admin"
      ? "Admin"
      : profile?.role === "hitl_validator"
        ? "Validator"
        : profile?.role === "barangay_official"
          ? "Barangay Official"
          : "";

  return (
    <Card size="sm">
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="size-16 ring-2 ring-border">
            <AvatarFallback className="text-lg font-semibold">{initials ?? "TU"}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-sm font-semibold">{profile?.full_name ?? "TUHOP User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{roleLabel}</p>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 text-xs font-normal"
            onClick={onAddReport}
          >
            <PlusCircle className="size-4 text-accent" />
            <span className="text-accent">Add Report</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 text-xs font-normal"
            onClick={() => navigate("#")}
            disabled
          >
            <User className="size-4 text-muted-foreground" />
            Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 text-xs font-normal"
            onClick={() => navigate("/map")}
          >
            <MapPin className="size-4 text-muted-foreground" />
            Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
