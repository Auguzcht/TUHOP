import { PageTransition } from "@/components/shared/motion";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export function IncidentArchivePage() {
  return (
    <PageTransition>
      <PlaceholderPage
        title="Incident Reports Archive"
        description="Search and review past flood reports here."
      />
    </PageTransition>
  );
}
