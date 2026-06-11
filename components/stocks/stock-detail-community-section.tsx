import { UsersRound } from "lucide-react";

import { CommunityPostCard } from "@/components/community/community-post-card";
import { PredictorBadge } from "@/components/community/predictor-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommunityPost, Stock, User } from "@/lib/types";

type StockDetailCommunitySectionProps = {
  posts: CommunityPost[];
  predictors: User[];
  stock: Stock;
  users: User[];
};

export function StockDetailCommunitySection({
  posts,
  predictors,
  stock,
  users,
}: StockDetailCommunitySectionProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-cyan-200" aria-hidden="true" />
            Community preview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {posts.slice(0, 2).map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              author={users.find((user) => user.id === post.userId)}
              stock={stock}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top predictors preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {predictors.map((user) => (
            <PredictorBadge key={user.id} user={user} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
