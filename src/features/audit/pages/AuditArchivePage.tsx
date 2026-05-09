import { PageTransition } from "@/components/shared/motion";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export function AuditArchivePage() {
  return (
    <PageTransition>
      <PlaceholderPage
        title="Audit Archive"
        description="Review historical model audit logs here."
      />
    </PageTransition>
  );
}
