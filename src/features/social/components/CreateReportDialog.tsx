import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ImagePlus, Loader2, Send, X, CalendarIcon, Check } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  PHYSICAL_REFERENCE_OPTIONS,
  MOBILITY_IMPACT_OPTIONS,
} from "@/lib/constants";
import { useCreateReport } from "@/features/social/hooks/useCreateReport";
import { FormMap } from "@/features/social/components/FormMap";
import { useReportDraftStore } from "@/stores/report-draft-store";
import { reportSchema } from "@/features/social/schemas/report.schema";

const DAVAO_DEFAULT: [number, number] = [7.0633, 125.608];

type CreateReportDialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

function readDraft() {
  try {
    const stored = localStorage.getItem("tuhop-report-draft");
    if (stored) return JSON.parse(stored)?.state as Record<string, string> | undefined;
  } catch { /* silent */ }
  return undefined;
}

export function CreateReportDialog({ open, onOpenChange }: CreateReportDialogProps) {
  const initDraft = readDraft() ?? {};
  const { updateDraft, clearDraft } = useReportDraftStore();

  const [postContent, setPostContent] = useState(initDraft.postContent ?? "");
  const [floodDate, setFloodDate] = useState<Date>(() => new Date(initDraft.floodDate || Date.now()));
  const [streetAddress, setStreetAddress] = useState(initDraft.streetAddress ?? "");
  const [markerPos, setMarkerPos] = useState<[number, number]>(DAVAO_DEFAULT);
  const [locationSet, setLocationSet] = useState(false);
  const [physRef, setPhysRef] = useState(initDraft.physicalReference ?? "");
  const [physRefText, setPhysRefText] = useState(initDraft.physicalReferenceText ?? "");
  const [mobility, setMobility] = useState(initDraft.mobilityImpact ?? "");
  const [mobilityText, setMobilityText] = useState(initDraft.mobilityImpactText ?? "");
  const [relevantComments, setRelevantComments] = useState(initDraft.relevantComments ?? "");
  const maxPhotos = 5;
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);

  const [showDiscard, setShowDiscard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { mutate, isPending } = useCreateReport();

  const resetForm = () => {
    setPostContent(""); setFloodDate(new Date()); setStreetAddress("");
    setMarkerPos(DAVAO_DEFAULT); setLocationSet(false);
    setPhysRef(""); setPhysRefText(""); setMobility(""); setMobilityText("");
    setRelevantComments(""); setFiles([]); setPreviews([]); setUploaded(new Set());
  };

  // Reset on dialog close
  useEffect(() => {
    if (!open) {
      clearDraft(); resetForm(); setErrors([]);
    }
  }, [open]);

    // Persist text fields to sessionStorage on change
  useEffect(() => {
    updateDraft({
      postContent, streetAddress, physicalReference: physRef,
      physicalReferenceText: physRefText, mobilityImpact: mobility,
      mobilityImpactText: mobilityText, relevantComments,
      floodDate: format(floodDate, "yyyy-MM-dd"),
    });
      }, [postContent, streetAddress, physRef, physRefText, mobility, mobilityText, relevantComments, floodDate]);

  // Reset on dialog close
  useEffect(() => {
    if (!open) {
      clearDraft(); resetForm(); setErrors([]);
    }
  }, [open]);

  const updateAddress = useCallback(async (pos: [number, number]) => {
    setMarkerPos(pos);
    setLocationSet(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}&addressdetails=1`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      if (data?.display_name) setStreetAddress(data.display_name.slice(0, 200));
    } catch { /* silent */ }
  }, []);

  const handleSearchSelect = useCallback((pos: [number, number], label: string) => {
    updateAddress(pos);
    if (label) setStreetAddress(label.slice(0, 200));
  }, [updateAddress]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).slice(0, maxPhotos - files.length);
    setFiles((prev) => [...prev, ...selected]);
    for (const f of selected) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    }
    e.target.value = "";
  }, []);

  const removeFile = useCallback((i: number) => {
    setFiles((p) => p.filter((_, j) => j !== i));
    setPreviews((p) => p.filter((_, j) => j !== i));
    setUploaded((p) => { const next = new Set(p); next.delete(i); return next; });
  }, []);

  const handleSubmit = () => {
    // Validate with Zod
    const result = reportSchema.safeParse({
      postContent,
      floodDate: format(floodDate, "yyyy-MM-dd"),
      streetAddress,
      physicalReference: physRef,
      physicalReferenceText: physRefText,
      mobilityImpact: mobility,
      mobilityImpactText: mobilityText,
      relevantComments,
    });

    if (!result.success) {
      setErrors(result.error.issues.map((i: { message: string }) => i.message));
      return;
    }

    if (!locationSet) {
      setErrors(["Please pin a location on the map."]);
      return;
    }

    setErrors([]);
    mutate({
      postContent,
      floodDate: format(floodDate, "yyyy-MM-dd"),
      streetAddress: streetAddress.trim() || `${markerPos[0].toFixed(5)}, ${markerPos[1].toFixed(5)}`,
      latitude: markerPos[0],
      longitude: markerPos[1],
      physicalReference: physRef as never, physicalReferenceText: physRefText,
      mobilityImpact: mobility as never, mobilityImpactText: mobilityText,
      relevantComments, files,
    }, {
      onSuccess: () => { setShowSuccess(true); },
      onError: (err) => { setErrors([err.message]); },
    });
  };

  const resetForm = () => {
    setPostContent(""); setFloodDate(new Date()); setStreetAddress("");
    setMarkerPos(DAVAO_DEFAULT); setLocationSet(false);
    setPhysRef(""); setPhysRefText(""); setMobility(""); setMobilityText("");
    setRelevantComments(""); setFiles([]); setPreviews([]); setUploaded(new Set());
  };

  // Auto-close success dialog and redirect
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => {
      setShowSuccess(false);
      onOpenChange(false);
      resetForm();
    }, 2000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && (postContent.trim() || files.length > 0 || streetAddress || physRef || mobility)) { setShowDiscard(true); } else { onOpenChange(o); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold">Report a Flood Incident</DialogTitle>
          <DialogDescription>Describe the flooding situation in your barangay.</DialogDescription>
        </DialogHeader>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-destructive">{e}</p>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description <span className="text-destructive">*</span></Label>
            <Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)}
              placeholder="Describe the flooding situation, affected areas, water level, etc..."
              className="min-h-24 resize-none rounded-lg text-xs" />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Date of Incident</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex w-48 items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-left text-xs shadow-sm transition-colors hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-ring">
                  <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>{format(floodDate, "MMM d, yyyy")}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={floodDate} disabled={{ after: new Date() }} onSelect={(d) => d && setFloodDate(d)} />
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Pin Location <span className="text-destructive">*</span></Label>
            <FormMap
              markerPos={markerPos}
              onMarkerMove={updateAddress}
              onSearchSelect={handleSearchSelect}
            />
            {streetAddress && (
              <p className="flex items-start gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 size-3.5 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                <span className="line-clamp-2">{streetAddress}</span>
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Water Level</Label>
            <Select value={physRef || "__none__"} onValueChange={(v) => setPhysRef(v === "__none__" ? "" : v)}>
              <SelectTrigger className="rounded-lg text-xs"><SelectValue placeholder="Select CDRRMO category..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" className="text-xs italic text-muted-foreground/60">None — custom description</SelectItem>
                {PHYSICAL_REFERENCE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Textarea value={physRefText} onChange={(e) => setPhysRefText(e.target.value)}
              placeholder={physRef ? PHYSICAL_REFERENCE_OPTIONS.find((o) => o.value === physRef)?.textDefault : "Describe the water level in your own words..."}
              className="min-h-16 resize-none rounded-lg text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Mobility Impact</Label>
            <Select value={mobility || "__none__"} onValueChange={(v) => setMobility(v === "__none__" ? "" : v)}>
              <SelectTrigger className="rounded-lg text-xs"><SelectValue placeholder="Select CDRRMO category..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" className="text-xs italic text-muted-foreground/60">None — custom description</SelectItem>
                {MOBILITY_IMPACT_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Textarea value={mobilityText} onChange={(e) => setMobilityText(e.target.value)}
              placeholder={mobility ? MOBILITY_IMPACT_OPTIONS.find((o) => o.value === mobility)?.textDefault : "Describe mobility conditions in your own words..."}
              className="min-h-16 resize-none rounded-lg text-xs" />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Additional Comments</Label>
            <Textarea value={relevantComments} onChange={(e) => setRelevantComments(e.target.value)}
              placeholder="Any other relevant information..." className="min-h-16 resize-none rounded-lg text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Photos</Label>
            <div className="flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative size-20 overflow-hidden rounded-lg border">
                  <img src={src} alt="" className="size-full object-cover" />
                  {uploaded.has(i) && (
                    <div className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Check className="size-3" />
                    </div>
                  )}
                  <button type="button" onClick={() => removeFile(i)} className="absolute left-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:opacity-100"><X className="size-3" /></button>
                </div>
              ))}
              {files.length < maxPhotos && (
                <label className="flex size-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 hover:bg-muted/50">
                  <ImagePlus className="size-6 text-muted-foreground" />
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                </label>
              )}
              {files.length > 0 && (
                <p className="w-full pt-1 text-[10px] text-muted-foreground">
                  {files.length}/{maxPhotos} photos
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!postContent.trim() || !locationSet || isPending} className="gap-1.5">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
      {/* Success dialog after submission */}
      <AlertDialog open={showSuccess}>
        <AlertDialogContent>
          <div className="flex flex-col items-center gap-5 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
              className="flex size-16 items-center justify-center rounded-full bg-emerald-100"
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="size-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
              >
                <motion.path d="M20 6L9 17l-5-5" />
              </motion.svg>
            </motion.div>
            <div className="space-y-1.5 text-center">
              <AlertDialogTitle className="font-sans text-base font-semibold">Report Submitted</AlertDialogTitle>
              <AlertDialogDescription>
                Thank you for reporting! Your flood report has been submitted for AI analysis.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-base font-semibold">Discard report?</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved changes. Your draft is saved and you can resume later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscard(false)}>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => { clearDraft(); resetForm(); setShowDiscard(false); onOpenChange(false); }}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
