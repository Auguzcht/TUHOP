import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { supabase } from "@/lib/supabase";
import { storage } from "@/lib/firebase";
import type { PHYSICAL_REFERENCE_OPTIONS, MOBILITY_IMPACT_OPTIONS } from "@/lib/constants";

type PhysRef = (typeof PHYSICAL_REFERENCE_OPTIONS)[number]["value"];
type Mobility = (typeof MOBILITY_IMPACT_OPTIONS)[number]["value"];

export type CreateReportPayload = {
  postContent: string;
  floodDate: string;
  streetAddress: string;
  latitude: number;
  longitude: number;
  physicalReference: PhysRef | "";
  physicalReferenceText: string;
  mobilityImpact: Mobility | "";
  mobilityImpactText: string;
  relevantComments: string;
  files: File[];
};

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReportPayload) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("users_profile")
        .select("barangay_id")
        .eq("id", user.user.id)
        .single();

      if (!profile?.barangay_id) throw new Error("No barangay assigned");

      // Step 1: Upload all images to Firebase first (staging path).
      // If this fails, no DB changes are made — safe.
      const stagingId = crypto.randomUUID();
      const uploadResults = await Promise.allSettled(
        payload.files.map(async (file, i) => {
          const path = `TUHOP/post-images/staging/${stagingId}/${i}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        }),
      );

      const imageUrls: string[] = [];
      const uploadErrors: string[] = [];
      for (const result of uploadResults) {
        if (result.status === "fulfilled") {
          imageUrls.push(result.value);
        } else {
          uploadErrors.push(result.reason?.message ?? "Upload failed");
        }
      }

      // If any upload failed, throw with all errors — no DB changes
      if (uploadErrors.length > 0) {
        throw new Error(`Image upload failed: ${uploadErrors.join("; ")}`);
      }

      // Step 2: All images uploaded — insert the report
      const { data: report, error: reportErr } = await supabase
        .from("flood_reports")
        .insert({
          author_id: user.user.id,
          barangay_id: profile.barangay_id,
          post_content: payload.postContent,
          street_address: payload.streetAddress || null,
          flood_date: payload.floodDate,
          location: `SRID=4326;POINT(${payload.longitude} ${payload.latitude})`,
          physical_reference: payload.physicalReference || null,
          physical_reference_text: payload.physicalReferenceText || null,
          mobility_impact: payload.mobilityImpact || null,
          mobility_impact_text: payload.mobilityImpactText || null,
          relevant_comments: payload.relevantComments || null,
        } as never)
        .select("id")
        .single();

      if (reportErr) {
        // Report insert failed — staging files become garbage (can be TTL-cleaned)
        throw reportErr;
      }

      // Step 3: Insert image records
      if (imageUrls.length > 0) {
        const { error: imgErr } = await supabase.from("flood_images").insert(
          imageUrls.map((url, i) => ({
            report_id: report.id,
            image_url: url,
            display_order: i,
          })),
        );
        if (imgErr) throw imgErr;
      }

      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["social", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["map", "validated-data"] });
    },
  });
}
