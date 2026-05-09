import { PageTransition } from "@/components/shared/motion";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export function MapPage() {
  return (
    <PageTransition>
      <PlaceholderPage
        title="Geohazard Map"
        description="Validated flood reports rendered on an interactive map."
      />
    </PageTransition>
  );
}
