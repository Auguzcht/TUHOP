import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, UserCheck, UserX, Building2 } from "lucide-react";

import { StatCard } from "@/components/shared/StatCard";
import { PageTransition } from "@/components/shared/motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingUsersTab } from "@/features/admin/pages/PendingUsersTab";
import { ApprovedUsersTab } from "@/features/admin/pages/ApprovedUsersTab";
import { RejectedUsersTab } from "@/features/admin/pages/RejectedUsersTab";
import { BarangayDirectoryTab } from "@/features/admin/pages/BarangayDirectoryTab";
import { useUserStats } from "@/features/admin/hooks/useUserStats";

const TABS = [
  { value: "users", label: "Pending", icon: Users },
  { value: "approved", label: "Approved", icon: UserCheck },
  { value: "rejected", label: "Rejected", icon: UserX },
  { value: "directory", label: "Directory", icon: Building2 },
] as const;

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stats } = useUserStats();

  // Determine active tab from URL
  const activeTab = TABS.find((t) => location.pathname.endsWith(t.value))?.value ?? "users";

  const handleTabChange = (value: string) => {
    navigate(`/settings/${value}`, { replace: true });
  };

  // Redirect /settings to /settings/users
  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/users", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Approve, manage, and review user accounts across the platform.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Approved"
            value={stats?.activeTotal ?? "—"}
            subtext="Active accounts"
            delay={0}
          />
          <StatCard
            icon={Users}
            label="Pending Review"
            value={stats?.pendingTotal ?? "—"}
            subtext="Awaiting approval"
            delay={0.05}
          />
          <StatCard
            icon={UserCheck}
            label="Approved This Month"
            value={stats?.approvedThisMonth ?? "—"}
            subtext="New this period"
            delay={0.1}
          />
          <StatCard
            icon={UserX}
            label="Rejected This Month"
            value={stats?.rejectedThisMonth ?? "—"}
            subtext="Declined applications"
            delay={0.15}
          />
        </div>

        {/* Tab navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full overflow-x-auto">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Tab content */}
        <div>
          {activeTab === "users" && <PendingUsersTab />}
          {activeTab === "approved" && <ApprovedUsersTab />}
          {activeTab === "rejected" && <RejectedUsersTab />}
          {activeTab === "directory" && <BarangayDirectoryTab />}
        </div>
      </div>
    </PageTransition>
  );
}
