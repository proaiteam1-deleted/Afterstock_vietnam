import { Heart, ImagePlus, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommunityPost, Stock, User } from "@/lib/types";
import { formatShortDateTime } from "@/lib/utils/format";

type CommunityPostCardProps = {
  post: CommunityPost;
  author?: User;
  stock?: Stock;
};

export function CommunityPostCard({ post, author, stock }: CommunityPostCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{post.title}</CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{author?.nickname ?? "익명"}</span>
              {author ? <Badge>{author.badge}</Badge> : null}
              {stock ? <Badge variant="accent">{stock.nameKo}</Badge> : null}
              <span>{formatShortDateTime(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-slate-300">{post.body}</p>
        {post.imageUrl ? (
          <div className="min-h-36 rounded-md border border-white/10 bg-white/[0.04]" />
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-white/14 bg-black/18 px-4 text-center text-sm text-slate-500">
            <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
            이미지·차트 캡처 업로드 예정
          </div>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" aria-hidden="true" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            의견
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
