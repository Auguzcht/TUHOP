import { useMemo, useState } from "react";

import { format, isToday, isYesterday } from "date-fns";

import { PageTransition } from "@/components/shared/motion";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  getPageNumbers,
} from "@/components/ui/pagination";
import { useAuthStore } from "@/stores/auth-store";
import { useFeed } from "@/features/social/hooks/useFeed";
import { PostCard } from "@/features/social/components/PostCard";
import { FeedSidebar } from "@/features/social/components/FeedSidebar";
import { FeedStats } from "@/features/social/components/FeedStats";
import { LiveReports } from "@/features/social/components/LiveReports";
import { CreateReportDialog } from "@/features/social/components/CreateReportDialog";

const PAGE_SIZE = 10;

export function HomePage() {
  const [page, setPage] = useState(1);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const { profile } = useAuthStore();
  const isAdminOrValidator = profile?.role === "admin" || profile?.role === "hitl_validator";
  const { data, isLoading } = useFeed(page, PAGE_SIZE);

  const posts = data?.posts ?? [];
  const pageCount = data?.pageCount ?? 1;

  // Group posts by date for timeline feel
  const grouped = useMemo(() => {
    const groups: Record<string, typeof posts> = {};
    for (const p of posts) {
      const d = new Date(p.createdAt);
      let key: string;
      if (isToday(d)) key = "Today";
      else if (isYesterday(d)) key = "Yesterday";
      else key = format(d, "MMMM d, yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    return groups;
  }, [posts]);

  if (isLoading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" label="Loading feed..." />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading">Home</h1>
            <p className="text-sm text-muted-foreground">Social timeline feed of flood reports</p>
          </div>
          <Button onClick={() => setReportDialogOpen(true)} className="mt-2 sm:mt-0">
            <PlusCircle className="mr-2 size-4" />
            Create Report
          </Button>
        </div>

        {/* Grid: sidebar | feed | stats */}
        <div className="grid gap-6 lg:grid-cols-[200px_1fr_240px]">
          {/* Left: Profile */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <FeedSidebar onAddReport={() => setReportDialogOpen(true)} />
            </div>
          </aside>

          {/* Center: Feed */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports yet"
                description="Flood reports will appear here as they come in."
              />
            ) : (
              <>
                <div className="space-y-6">
                  {Object.entries(grouped).map(([dateLabel, datePosts]) => (
                    <div key={dateLabel} className="space-y-3">
                      {/* Timeline date header */}
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/60" />
                        <span className="shrink-0 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                          {dateLabel}
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                      </div>
                      <div className="space-y-4">
                        {datePosts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                  <Pagination className="pt-2">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) {
                              setPage(page - 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={page <= 1 ? "pointer-events-none opacity-40" : ""}
                        />
                      </PaginationItem>
                      {getPageNumbers(page, pageCount).map((p, i) =>
                        p === "..." ? (
                          <PaginationItem key={`e-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={p === page}
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < pageCount) {
                              setPage(page + 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={page >= pageCount ? "pointer-events-none opacity-40" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>

          {/* Right: Stats (admin/validator only) */}
          {isAdminOrValidator && (
            <aside className="hidden xl:block">
              <div className="space-y-4">
                <FeedStats />
                <LiveReports />
              </div>
            </aside>
          )}
        </div>
      </div>
      <CreateReportDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen} />
    </PageTransition>
  );
}
