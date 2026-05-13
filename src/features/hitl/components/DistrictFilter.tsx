import { Button } from "@/components/ui/button";

const DISTRICTS = [
  "Agdao", "Baguio", "Buhangin", "Bunawan", "Calinan",
  "Marilog", "Paquibato", "Poblacion", "Talomo", "Toril", "Tugbok",
] as const;

type DistrictFilterProps = {
  selected: string[];
  onToggle: (district: string) => void;
};

export function DistrictFilter({ selected, onToggle }: DistrictFilterProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Filter by district
      </p>
      <div className="flex flex-wrap gap-2">
        {DISTRICTS.map((district) => {
          const isActive = selected.includes(district);
          return (
            <Button
              key={district}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-8 rounded-lg text-[11px]"
              onClick={() => onToggle(district)}
            >
              {district}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
