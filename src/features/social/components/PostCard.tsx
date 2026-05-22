import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MapPinIcon, ClockIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { FeedPost } from "@/features/social/hooks/useFeed";

type PostCardProps = {
  post: FeedPost;
};

export function PostCard({ post }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);

  const initials = post.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const longContent = post.postContent.length > 300;

  return (
    <Card size="sm" className="overflow-hidden">
      <CardContent className="p-4 md:p-5">
        {/* Author row */}
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-1 ring-border">
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{post.authorName}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{post.barangayName}</span>
              {post.districtName && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{post.districtName}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {post.severity ? (
              <SeverityBadge severity={post.severity} />
            ) : post.stage === "awaiting_inference" || (!post.severity && !post.validatedAt) ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground animate-pulse">
                <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                Analyzing...
              </span>
            ) : null}
          </div>
        </div>

        {/* Post content with truncation */}
        <div className="mt-3">
          <p
            style={{
              display: expanded ? "block" : "-webkit-box",
              WebkitLineClamp: expanded ? "unset" : "4",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="whitespace-pre-wrap text-sm leading-relaxed"
          >
            {post.postContent}
          </p>
          {longContent && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs font-medium text-accent hover:underline"
            >
              {expanded ? "Show less" : "See more"}
            </button>
          )}
        </div>

        {/* Images */}
        {post.images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {post.images.map((img) => (
              <img
                key={img.id}
                src={img.imageUrl}
                alt=""
                className="h-40 w-full rounded-lg object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* Street address */}
        {post.streetAddress && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPinIcon className="size-3.5" />
            {post.streetAddress}
          </p>
        )}

        {/* Timestamp */}
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ClockIcon className="size-3" />
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          {post.validatedAt && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>
                Validated {formatDistanceToNow(new Date(post.validatedAt), { addSuffix: true })}
              </span>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
