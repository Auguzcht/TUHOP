import { PageTransition } from "@/components/shared/motion";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

export function HomePage() {
  return (
    <PageTransition>
      <PlaceholderPage
        title="Home Feed"
        description="The social feed experience will go here post-MVP."
      />
    </PageTransition>
  );
}
