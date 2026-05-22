import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type MapDatePickerProps = {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
};

export function MapDatePicker({ startDate, endDate, onStartChange, onEndChange }: MapDatePickerProps) {
  const date = React.useMemo(() => {
    const from = startDate ? new Date(startDate) : undefined;
    const to = endDate ? new Date(endDate) : undefined;
    return from && to ? { from, to } : { from: from ?? new Date(), to: to ?? new Date() };
  }, [startDate, endDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* Plain button — no framer-motion to avoid jitter with popover anchoring */}
        <button
          className="flex w-full items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-left text-xs shadow-sm transition-colors hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {format(date.from, "MMM d, yyyy")} — {format(date.to, "MMM d, yyyy")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={date}
          onSelect={(range) => {
            if (range?.from) onStartChange(format(range.from, "yyyy-MM-dd"));
            if (range?.to) onEndChange(format(range.to, "yyyy-MM-dd"));
            if (range?.from && !range?.to) onEndChange(format(range.from, "yyyy-MM-dd"));
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
