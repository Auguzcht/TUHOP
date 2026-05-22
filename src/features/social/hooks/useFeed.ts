import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type FeedPost = {
  id: string;
  postContent: string;
  severity: "low" | "moderate" | "high" | null;
  status: string;
  stage: string;
  streetAddress: string | null;
  authorName: string;
  barangayName: string;
  districtName: string | null;
  createdAt: string;
  validatedAt: string | null;
  images: { id: string; imageUrl: string }[];
};

export type FeedData = {
  posts: FeedPost[];
  totalCount: number;
  pageCount: number;
};

export function useFeed(page: number, pageSize = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery<FeedData>({
    queryKey: ["social", "feed", page, pageSize],
    queryFn: async () => {
      const [countRes, postsRes, imagesRes] = await Promise.all([
        supabase
          .from("flood_reports")
          .select("*", { count: "exact", head: true })
          .not("post_content", "is", null),
        supabase
          .from("flood_reports")
          .select(
            `id, post_content, model_severity, human_severity, status, stage, street_address, created_at, validated_at, author:users_profile!author_id(full_name), barangay:barangays!inner(name, district:districts(name))`,
          )
          .not("post_content", "is", null)
          .order("created_at", { ascending: false })
          .range(from, to),
        supabase.from("flood_images").select("id, image_url, report_id"),
      ]);

      if (countRes.error) throw countRes.error;
      if (postsRes.error) throw postsRes.error;

      const totalCount = countRes.count ?? 0;
      const imageMap = new Map<string, { id: string; imageUrl: string }[]>();
      for (const img of imagesRes.data ?? []) {
        const list = imageMap.get(img.report_id) ?? [];
        list.push({ id: img.id, imageUrl: img.image_url });
        imageMap.set(img.report_id, list);
      }

      const posts: FeedPost[] = (postsRes.data ?? []).map((r) => {
        const a = r.author as { full_name: string } | null;
        const b = r.barangay as { name: string; district: { name: string } | null } | null;
        return {
          id: r.id,
          postContent: r.post_content ?? "",
          severity: (r.human_severity ?? r.model_severity) as "low" | "moderate" | "high" | null,
          status: r.status ?? "",
          stage: r.stage ?? "",
          streetAddress: r.street_address,
          authorName: a?.full_name ?? "Unknown",
          barangayName: b?.name ?? "Unknown",
          districtName: b?.district?.name ?? null,
          createdAt: r.created_at ?? "",
          validatedAt: r.validated_at,
          images: imageMap.get(r.id) ?? [],
        };
      });

      return { posts, totalCount, pageCount: Math.ceil(totalCount / pageSize) };
    },
    staleTime: 30_000,
    gcTime: 60_000,
  });
}
