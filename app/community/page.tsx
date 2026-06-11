import { CommunityPageHeading } from "@/components/community/community-page-heading";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { CommunitySidebar } from "@/components/community/community-sidebar";
import { AppShell } from "@/components/layout/app-shell";
import {
  getCommunityPosts,
  getStocks,
  getTopPredictors,
  getUserProfiles,
} from "@/server/services/afterstock-service";

export const metadata = {
  title: "Community",
};

export default async function CommunityPage() {
  const [posts, stocks, users, topPredictors] = await Promise.all([
    getCommunityPosts(),
    getStocks(),
    getUserProfiles(),
    getTopPredictors(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <CommunityPageHeading />

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.75fr]">
          <div className="space-y-4">
            {posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                author={users.find((user) => user.id === post.userId)}
                stock={stocks.find((stock) => stock.symbol === post.stockSymbol)}
              />
            ))}
          </div>

          <CommunitySidebar users={topPredictors} />
        </div>
      </div>
    </AppShell>
  );
}
