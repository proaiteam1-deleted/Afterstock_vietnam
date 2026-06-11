import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BoardDetailPage } from "@/components/boards/board-detail-page";
import { AppShell } from "@/components/layout/app-shell";
import { getBoardSectionBySlug, getBoardStaticSlugs } from "@/lib/mock/market-community";

type BoardDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getBoardStaticSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BoardDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const board = getBoardSectionBySlug(slug);

  return {
    title: board ? board.title : "게시판",
  };
}

export default async function BoardDetailRoute({ params }: BoardDetailRouteProps) {
  const { slug } = await params;
  const board = getBoardSectionBySlug(slug);

  if (!board) {
    notFound();
  }

  return (
    <AppShell>
      <BoardDetailPage board={board} />
    </AppShell>
  );
}
