import { z } from "zod";

export const reportSchema = z.object({
  postContent: z.string().min(10, "Description must be at least 10 characters"),
  floodDate: z.string().min(1, "Select a date"),
  streetAddress: z.string().optional(),
  physicalReference: z.string().optional(),
  physicalReferenceText: z.string().optional(),
  mobilityImpact: z.string().optional(),
  mobilityImpactText: z.string().optional(),
  relevantComments: z.string().optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;
