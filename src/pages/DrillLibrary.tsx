import { AppLayout } from "@/components/AppLayout";
import { DrillLibrary as DrillLibraryComponent } from "@/components/analysis/DrillLibrary";

export default function DrillLibrary() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-gold">Training Drill Library</h1>
          <p className="text-muted-foreground mt-2">
            Browse drills organized by the 4B System pillars
          </p>
        </div>
        <DrillLibraryComponent />
      </div>
    </AppLayout>
  );
}
