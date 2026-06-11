"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  ImagePlus,
  MessageCircle,
  PenLine,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserCircle,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { UpbitStyleChartLayout } from "@/components/stocks/upbit-style-chart-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getOrCreateUserProfile,
  getUserProfile,
  setUserProfile,
} from "@/lib/profile/profileStorage";
import { boardCategories, getStockAssetBySymbol } from "@/lib/stocks/mockStocks";
import {
  getOrSeedStockBoardPostsBySymbol,
  getOrSeedStockOpinionsBySymbol,
  setStockBoardPostsBySymbol,
  setStockOpinionsBySymbol,
} from "@/lib/stocks/stockStorage";
import { cn } from "@/lib/utils/cn";
import type {
  StockAsset,
  StockBoardCategory,
  StockBoardPost,
  StockComment,
  StockOpinion,
  StockOpinionDirection,
  StockOpinionReason,
  StockOpinionTimeHorizon,
  UserProfile,
} from "@/types/stock";

type StockDetailPageProps = {
  symbol: string;
};

type DetailedOpinionFormState = {
  body: string;
  direction: StockOpinionDirection;
  reasons: StockOpinionReason[];
  tag: string;
  timeHorizon: StockOpinionTimeHorizon;
  title: string;
};

type QuickOpinionFormState = {
  body: string;
  direction: StockOpinionDirection;
};

type BoardPostFormState = {
  body: string;
  category: StockBoardCategory;
  title: string;
};

const timeHorizonOptions: StockOpinionTimeHorizon[] = [
  "오늘",
  "이번 주",
  "이번 달",
  "장기",
];

const reasonOptions: StockOpinionReason[] = [
  "차트",
  "수급",
  "뉴스",
  "실적",
  "감",
  "커뮤니티 분위기",
];

const initialDetailedOpinionForm: DetailedOpinionFormState = {
  body: "",
  direction: "neutral",
  reasons: ["커뮤니티 분위기"],
  tag: "",
  timeHorizon: "오늘",
  title: "",
};

const initialQuickOpinionForm: QuickOpinionFormState = {
  body: "",
  direction: "neutral",
};

const initialBoardPostForm: BoardPostFormState = {
  body: "",
  category: "일반",
  title: "",
};

const directionLabels: Record<StockOpinionDirection, string> = {
  bearish: "안 좋게 봄",
  bullish: "좋게 봄",
  neutral: "애매함",
};

const directionVariants: Record<StockOpinionDirection, "danger" | "success" | "warning"> =
  {
    bearish: "danger",
    bullish: "success",
    neutral: "warning",
  };

const avatarLabels: Record<UserProfile["avatarType"], string> = {
  ai: "AI",
  chart: "차",
  flame: "불",
  moon: "달",
  seed: "개",
  wave: "관",
};

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).format(new Date());
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function StockAvatar({
  avatarType,
  compact = false,
}: {
  avatarType: UserProfile["avatarType"];
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
        compact ? "h-9 w-9" : "h-12 w-12",
        avatarType === "ai"
          ? "border-slate-200 bg-slate-950 text-white"
          : "border-slate-200 bg-slate-50 text-slate-900",
      )}
      aria-label={`${avatarLabels[avatarType]} 아바타`}
    >
      {avatarLabels[avatarType]}
    </div>
  );
}

function ProfileSummary({ profile }: { profile: UserProfile | null }) {
  if (!profile) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-400">
        랜덤 프로필을 준비하는 중입니다.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <StockAvatar compact avatarType={profile.avatarType} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-950">
            {profile.nickname}
          </p>
          <Badge variant="accent">{profile.investorType}</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-400">로그인 없는 종목 의견 프로필</p>
      </div>
    </div>
  );
}

function StockHeader({ stock }: { stock: StockAsset }) {
  const [isWatching, setIsWatching] = useState(false);
  const isPositive = stock.changeRate >= 0;

  return (
    <section className="premium-card rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/stocks">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              종목 목록
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{stock.market}</Badge>
            <Badge>{stock.symbol}</Badge>
            <Badge variant={isPositive ? "success" : "danger"}>
              {isPositive ? "+" : ""}
              {stock.changeRate.toFixed(2)}%
            </Badge>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {stock.displayName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              차트와 투자자 의견, 종목 게시판을 한 화면에서 확인하는 커뮤니티
              페이지입니다.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_160px]">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">현재가 mock</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{stock.price}</p>
          </div>
          <Button
            type="button"
            variant={isWatching ? "bullish" : "secondary"}
            className="h-full min-h-16"
            onClick={() => setIsWatching((current) => !current)}
          >
            <Star className="h-4 w-4" aria-hidden="true" />
            {isWatching ? "관심 등록됨" : "관심 종목"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function getOpinionSummary(opinions: StockOpinion[]) {
  const total = opinions.length;
  const bullish = opinions.filter((opinion) => opinion.direction === "bullish").length;
  const neutral = opinions.filter((opinion) => opinion.direction === "neutral").length;
  const bearish = opinions.filter((opinion) => opinion.direction === "bearish").length;

  if (total === 0) {
    return { bearishPercent: 0, bullishPercent: 0, neutralPercent: 0, total };
  }

  return {
    bearishPercent: Math.round((bearish / total) * 100),
    bullishPercent: Math.round((bullish / total) * 100),
    neutralPercent: Math.round((neutral / total) * 100),
    total,
  };
}

function LiveOpinionListItem({ opinion }: { opinion: StockOpinion }) {
  return (
    <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <StockAvatar compact avatarType={opinion.avatarType} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">
            {opinion.nickname}
          </span>
          <Badge variant={directionVariants[opinion.direction]}>
            {directionLabels[opinion.direction]}
          </Badge>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-700">
          {opinion.body}
        </p>
        <p className="mt-2 text-xs text-slate-500">{opinion.createdAt}</p>
      </div>
    </div>
  );
}

function LiveOpinionPanel({
  mobileTab,
  onMobileTabChange,
  onQuickSubmit,
  opinions,
  profile,
  quickForm,
  setQuickForm,
}: {
  mobileTab: "write" | "list";
  onMobileTabChange: (tab: "write" | "list") => void;
  onQuickSubmit: (event: FormEvent<HTMLFormElement>) => void;
  opinions: StockOpinion[];
  profile: UserProfile | null;
  quickForm: QuickOpinionFormState;
  setQuickForm: (
    updater: (current: QuickOpinionFormState) => QuickOpinionFormState,
  ) => void;
}) {
  const summary = getOpinionSummary(opinions);
  const recentOpinions = opinions.slice(0, 8);

  return (
    <Card className="h-full lg:sticky lg:top-28">
      <CardHeader>
        <CardTitle>프로필 의견</CardTitle>
        <CardDescription>차트를 보면서 바로 읽고 남기는 종목 분위기</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProfileSummary profile={profile} />

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">전체 의견</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">
              {summary.total.toLocaleString("ko-KR")}개
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-red-500">좋게 봄</p>
            <p className="mt-1 text-xl font-semibold text-red-600">
              {summary.bullishPercent}%
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-amber-600">애매함</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">
              {summary.neutralPercent}%
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-blue-500">안 좋게 봄</p>
            <p className="mt-1 text-xl font-semibold text-blue-600">
              {summary.bearishPercent}%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="bg-red-400" style={{ width: `${summary.bullishPercent}%` }} />
            <div
              className="bg-amber-300"
              style={{ width: `${summary.neutralPercent}%` }}
            />
            <div
              className="bg-blue-400"
              style={{ width: `${summary.bearishPercent}%` }}
            />
          </div>
          <p className="text-xs leading-5 text-slate-500">
            차트를 보면서 바로 남긴 의견 기준의 커뮤니티 분위기입니다.
          </p>
        </div>

        <div className="flex gap-2 lg:hidden">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn(
              "flex-1",
              mobileTab === "write" && "border-slate-950 bg-slate-950 text-white",
            )}
            onClick={() => onMobileTabChange("write")}
          >
            의견 작성
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn(
              "flex-1",
              mobileTab === "list" && "border-slate-950 bg-slate-950 text-white",
            )}
            onClick={() => onMobileTabChange("list")}
          >
            의견 리스트
          </Button>
        </div>

        <form
          className={cn(
            "space-y-3",
            mobileTab === "write" ? "block" : "hidden",
            "lg:block",
          )}
          onSubmit={onQuickSubmit}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">빠른 의견 작성</p>
            <span className="text-xs text-slate-500">종목별 localStorage 저장</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["bullish", "neutral", "bearish"] as const).map((direction) => (
              <Button
                key={direction}
                type="button"
                variant="secondary"
                size="sm"
                className={cn(
                  quickForm.direction === direction &&
                    "border-slate-950 bg-slate-950 text-white",
                )}
                onClick={() => setQuickForm((current) => ({ ...current, direction }))}
              >
                {directionLabels[direction]}
              </Button>
            ))}
          </div>
          <textarea
            className="min-h-24 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            value={quickForm.body}
            placeholder="차트 보면서 드는 생각을 짧게 남겨보세요."
            maxLength={160}
            onChange={(event) =>
              setQuickForm((current) => ({ ...current, body: event.target.value }))
            }
          />
          <Button type="submit" className="w-full">
            <PenLine className="h-4 w-4" aria-hidden="true" />
            빠른 의견 등록
          </Button>
        </form>

        <div
          className={cn(
            "space-y-2",
            mobileTab === "list" ? "block" : "hidden",
            "lg:block",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">최신 프로필 의견</p>
            <span className="text-xs text-slate-500">
              최근 {recentOpinions.length.toLocaleString("ko-KR")}개
            </span>
          </div>
          {recentOpinions.map((opinion) => (
            <LiveOpinionListItem key={opinion.id} opinion={opinion} />
          ))}
          {recentOpinions.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-400">
              아직 의견이 없습니다. 첫 분위기를 남겨보세요.
            </p>
          ) : null}
        </div>

        <Button asChild variant="outline" className="w-full">
          <a href="#stock-opinion-expanded">전체 의견 보기</a>
        </Button>
      </CardContent>
    </Card>
  );
}

function OpinionCard({
  opinion,
  onReact,
}: {
  opinion: StockOpinion;
  onReact: (opinionId: string, reaction: "likes" | "dislikes") => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3">
          <StockAvatar avatarType={opinion.avatarType} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{opinion.title}</CardTitle>
              <Badge variant={directionVariants[opinion.direction]}>
                {directionLabels[opinion.direction]}
              </Badge>
              <Badge>{opinion.investorType}</Badge>
            </div>
            <CardDescription>
              {opinion.nickname} · {opinion.createdAt}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-800">{opinion.body}</p>

        <div className="flex flex-wrap gap-2 text-xs">
          {opinion.tags.map((tag) => (
            <Badge key={tag} variant="accent">
              #{tag}
            </Badge>
          ))}
          <Badge>목표 기간 {opinion.timeHorizon}</Badge>
          {opinion.reasons.map((reason) => (
            <Badge key={reason}>{reason}</Badge>
          ))}
          <Badge>
            <MessageCircle className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            댓글 {opinion.commentCount}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onReact(opinion.id, "likes")}
          >
            <ThumbsUp className="h-4 w-4" aria-hidden="true" />
            공감 {opinion.likes.toLocaleString("ko-KR")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onReact(opinion.id, "dislikes")}
          >
            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            비공감 {opinion.dislikes.toLocaleString("ko-KR")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StockBoardSection({
  boardComment,
  boardForm,
  boardPosts,
  boardSort,
  onBoardCommentChange,
  onBoardCommentSubmit,
  onBoardFormChange,
  onBoardPostSubmit,
  onBoardReaction,
  onBoardSortChange,
  onBoardPostSelect,
  selectedPost,
}: {
  boardComment: string;
  boardForm: BoardPostFormState;
  boardPosts: StockBoardPost[];
  boardSort: "latest" | "popular";
  onBoardCommentChange: (value: string) => void;
  onBoardCommentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBoardFormChange: (
    updater: (current: BoardPostFormState) => BoardPostFormState,
  ) => void;
  onBoardPostSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBoardReaction: (
    postId: string,
    reaction: "likes" | "dislikes",
    commentId?: string,
  ) => void;
  onBoardSortChange: (sort: "latest" | "popular") => void;
  onBoardPostSelect: (postId: string) => void;
  selectedPost: StockBoardPost | undefined;
}) {
  const totalComments = boardPosts.reduce((sum, post) => sum + post.comments.length, 0);
  const totalLikes = boardPosts.reduce((sum, post) => sum + post.likes, 0);

  return (
    <section className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>종목 게시판</CardTitle>
              <CardDescription>
                종목별로 자유롭게 글을 쓰고 댓글을 다는 커뮤니티 의견 게시판입니다.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn(
                  boardSort === "latest" && "border-slate-950 bg-slate-950 text-white",
                )}
                onClick={() => onBoardSortChange("latest")}
              >
                최신순
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn(
                  boardSort === "popular" && "border-slate-950 bg-slate-950 text-white",
                )}
                onClick={() => onBoardSortChange("popular")}
              >
                추천순
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">종목 게시글</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {boardPosts.length.toLocaleString("ko-KR")}개
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">댓글 반응</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {totalComments.toLocaleString("ko-KR")}개
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">추천 합계</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {totalLikes.toLocaleString("ko-KR")}개
              </p>
            </div>
          </div>

          <form className="grid gap-3" onSubmit={onBoardPostSubmit}>
            <div className="grid gap-3 md:grid-cols-[140px_1fr]">
              <label className="space-y-2 text-sm text-slate-700">
                말머리
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-slate-400"
                  value={boardForm.category}
                  onChange={(event) =>
                    onBoardFormChange((current) => ({
                      ...current,
                      category: event.target.value as StockBoardCategory,
                    }))
                  }
                >
                  {boardCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                제목
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                  value={boardForm.title}
                  placeholder="제목 중심으로 가볍게 올려보세요."
                  maxLength={80}
                  onChange={(event) =>
                    onBoardFormChange((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              본문
              <textarea
                className="min-h-28 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                value={boardForm.body}
                placeholder="자유롭게 의견을 남겨주세요. 투자 권유가 아닌 커뮤니티 의견으로 작성해주세요."
                maxLength={800}
                onChange={(event) =>
                  onBoardFormChange((current) => ({
                    ...current,
                    body: event.target.value,
                  }))
                }
              />
            </label>

            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 text-slate-700">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                이미지 첨부 영역
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                실제 업로드는 아직 연결하지 않은 UI입니다. 추후 스토리지 연동 시 이 영역만
                교체합니다.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                TODO: 욕설/비속어 필터는 추후 DB/API 연동 단계에서 적용합니다.
              </p>
              <Button type="submit">게시글 등록</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">게시글 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs text-slate-500">
                  <tr>
                    <th className="w-24 px-4 py-3 font-medium">말머리</th>
                    <th className="px-4 py-3 font-medium">제목</th>
                    <th className="w-32 px-4 py-3 font-medium">닉네임</th>
                    <th className="w-20 px-4 py-3 font-medium">조회</th>
                    <th className="w-20 px-4 py-3 font-medium">댓글</th>
                    <th className="w-20 px-4 py-3 font-medium">추천</th>
                    <th className="w-20 px-4 py-3 font-medium">시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {boardPosts.map((post) => (
                    <tr
                      key={post.id}
                      className={cn(
                        "transition hover:bg-white",
                        selectedPost?.id === post.id && "bg-slate-100",
                      )}
                    >
                      <td className="px-4 py-3">
                        <Badge>{post.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="max-w-[360px] truncate text-left font-medium text-slate-900 hover:text-slate-950"
                          onClick={() => onBoardPostSelect(post.id)}
                        >
                          {post.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{post.nickname}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {post.views.toLocaleString("ko-KR")}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {post.comments.length.toLocaleString("ko-KR")}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {post.likes.toLocaleString("ko-KR")}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{post.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {boardPosts.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">
                아직 게시글이 없습니다. 첫 글을 남겨보세요.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>게시글 상세</CardTitle>
            <CardDescription>
              제목을 누르면 본문과 댓글을 바로 확인할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPost ? (
              <>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{selectedPost.category}</Badge>
                    <Badge>
                      <Eye className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      {selectedPost.views.toLocaleString("ko-KR")}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold leading-7 text-slate-950">
                    {selectedPost.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedPost.nickname} · {selectedPost.createdAt}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                    {selectedPost.body}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onBoardReaction(selectedPost.id, "likes")}
                  >
                    <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                    추천 {selectedPost.likes.toLocaleString("ko-KR")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onBoardReaction(selectedPost.id, "dislikes")}
                  >
                    <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                    비추천 {selectedPost.dislikes.toLocaleString("ko-KR")}
                  </Button>
                </div>

                <form className="grid gap-3" onSubmit={onBoardCommentSubmit}>
                  <textarea
                    className="min-h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    value={boardComment}
                    placeholder="댓글을 빠르게 남겨보세요."
                    maxLength={240}
                    onChange={(event) => onBoardCommentChange(event.target.value)}
                  />
                  <Button type="submit">댓글 등록</Button>
                </form>

                <div className="space-y-2">
                  {selectedPost.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800">
                          {comment.nickname}
                        </span>
                        <span className="text-xs text-slate-500">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {comment.body}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            onBoardReaction(selectedPost.id, "likes", comment.id)
                          }
                        >
                          공감 {comment.likes}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            onBoardReaction(selectedPost.id, "dislikes", comment.id)
                          }
                        >
                          비공감 {comment.dislikes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
                게시글 제목을 선택하면 상세와 댓글이 표시됩니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function StockDetailPage({ symbol }: StockDetailPageProps) {
  const stock = getStockAssetBySymbol(symbol);
  const [boardComment, setBoardComment] = useState("");
  const [boardForm, setBoardForm] = useState<BoardPostFormState>(initialBoardPostForm);
  const [boardPosts, setBoardPosts] = useState<StockBoardPost[]>([]);
  const [boardSort, setBoardSort] = useState<"latest" | "popular">("latest");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [opinions, setOpinions] = useState<StockOpinion[]>([]);
  const [detailedForm, setDetailedForm] = useState<DetailedOpinionFormState>(
    initialDetailedOpinionForm,
  );
  const [quickForm, setQuickForm] = useState<QuickOpinionFormState>(
    initialQuickOpinionForm,
  );
  const [opinionSort, setOpinionSort] = useState<"latest" | "popular">("latest");
  const [mobileOpinionTab, setMobileOpinionTab] = useState<"write" | "list">("list");
  const [selectedBoardPostId, setSelectedBoardPostId] = useState("");

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const nextProfile = getUserProfile() ?? getOrCreateUserProfile();

      setProfile(nextProfile);
      setUserProfile(nextProfile);

      if (stock) {
        const nextBoardPosts = getOrSeedStockBoardPostsBySymbol(stock.symbol);

        setBoardPosts(nextBoardPosts);
        setOpinions(getOrSeedStockOpinionsBySymbol(stock.symbol));
        setSelectedBoardPostId((current) => current || nextBoardPosts[0]?.id || "");
      }
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [stock]);

  const stockOpinions = useMemo(() => {
    if (opinionSort === "popular") {
      return opinions
        .slice()
        .sort((a, b) => b.likes + b.dislikes - (a.likes + a.dislikes));
    }

    return opinions;
  }, [opinionSort, opinions]);
  const sortedBoardPosts = useMemo(() => {
    if (boardSort === "popular") {
      return boardPosts
        .slice()
        .sort((a, b) => b.likes + b.comments.length - (a.likes + a.comments.length));
    }

    return boardPosts;
  }, [boardPosts, boardSort]);
  const selectedBoardPost = useMemo(
    () => boardPosts.find((post) => post.id === selectedBoardPostId) ?? boardPosts[0],
    [boardPosts, selectedBoardPostId],
  );

  if (!stock) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-slate-700">지원하지 않는 종목입니다.</p>
          <Button asChild className="mt-4" variant="secondary">
            <Link href="/stocks">종목 목록으로 이동</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeStock = stock;

  function getActiveProfile() {
    const currentProfile = profile ?? getOrCreateUserProfile();

    if (!profile) {
      setProfile(currentProfile);
    }

    return currentProfile;
  }

  function persistOpinions(nextOpinions: StockOpinion[]) {
    setOpinions(nextOpinions);
    setStockOpinionsBySymbol(activeStock.symbol, nextOpinions);
  }

  function persistBoardPosts(nextPosts: StockBoardPost[]) {
    setBoardPosts(nextPosts);
    setStockBoardPostsBySymbol(activeStock.symbol, nextPosts);
  }

  function toggleReason(reason: StockOpinionReason) {
    setDetailedForm((current) => {
      const hasReason = current.reasons.includes(reason);
      const nextReasons = hasReason
        ? current.reasons.filter((item) => item !== reason)
        : [...current.reasons, reason];

      return {
        ...current,
        reasons: nextReasons.length > 0 ? nextReasons : ["커뮤니티 분위기"],
      };
    });
  }

  function addOpinion(nextOpinion: StockOpinion) {
    persistOpinions([nextOpinion, ...opinions]);
    setOpinionSort("latest");
    setMobileOpinionTab("list");
  }

  function createOpinionFromProfile(
    currentProfile: UserProfile,
    values: {
      body: string;
      direction: StockOpinionDirection;
      reasons: StockOpinionReason[];
      tags: string[];
      timeHorizon: StockOpinionTimeHorizon;
      title: string;
    },
  ): StockOpinion {
    return {
      id: createId(`stock-opinion-${activeStock.symbol}`),
      symbol: activeStock.symbol,
      userId: currentProfile.id,
      nickname: currentProfile.nickname,
      avatarType: currentProfile.avatarType,
      investorType: currentProfile.investorType,
      direction: values.direction,
      title: values.title,
      body: values.body,
      tags: values.tags,
      timeHorizon: values.timeHorizon,
      reasons: values.reasons,
      likes: 0,
      dislikes: 0,
      createdAt: getCurrentTimeLabel(),
      commentCount: 0,
    };
  }

  function handleQuickOpinionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!quickForm.body.trim()) {
      return;
    }

    const body = quickForm.body.trim();
    const title = body.length > 34 ? `${body.slice(0, 34)}...` : body;
    const nextOpinion = createOpinionFromProfile(getActiveProfile(), {
      body,
      direction: quickForm.direction,
      reasons: ["커뮤니티 분위기"],
      tags: ["프로필의견"],
      timeHorizon: "오늘",
      title,
    });

    addOpinion(nextOpinion);
    setQuickForm(initialQuickOpinionForm);
  }

  function handleDetailedOpinionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!detailedForm.title.trim() || !detailedForm.body.trim()) {
      return;
    }

    const nextOpinion = createOpinionFromProfile(getActiveProfile(), {
      body: detailedForm.body.trim(),
      direction: detailedForm.direction,
      reasons: detailedForm.reasons,
      tags: detailedForm.tag.trim() ? [detailedForm.tag.trim()] : [],
      timeHorizon: detailedForm.timeHorizon,
      title: detailedForm.title.trim(),
    });

    addOpinion(nextOpinion);
    setDetailedForm(initialDetailedOpinionForm);
  }

  function handleBoardPostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!boardForm.title.trim() || !boardForm.body.trim()) {
      return;
    }

    const nextPost: StockBoardPost = {
      id: createId(`stock-board-${activeStock.symbol}`),
      symbol: activeStock.symbol,
      category: boardForm.category,
      title: boardForm.title.trim(),
      body: boardForm.body.trim(),
      nickname: getActiveProfile().nickname,
      comments: [],
      views: Math.floor(20 + Math.random() * 180),
      likes: 0,
      dislikes: 0,
      createdAt: getCurrentTimeLabel(),
    };

    persistBoardPosts([nextPost, ...boardPosts]);
    setBoardForm(initialBoardPostForm);
    setBoardSort("latest");
    setSelectedBoardPostId(nextPost.id);
  }

  function handleBoardPostSelect(postId: string) {
    setSelectedBoardPostId(postId);
    persistBoardPosts(
      boardPosts.map((post) =>
        post.id === postId ? { ...post, views: post.views + 1 } : post,
      ),
    );
  }

  function handleBoardCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBoardPost || !boardComment.trim()) {
      return;
    }

    const nextComment: StockComment = {
      id: createId(`stock-comment-${selectedBoardPost.id}`),
      postId: selectedBoardPost.id,
      nickname: getActiveProfile().nickname,
      body: boardComment.trim(),
      likes: 0,
      dislikes: 0,
      createdAt: getCurrentTimeLabel(),
    };

    persistBoardPosts(
      boardPosts.map((post) =>
        post.id === selectedBoardPost.id
          ? { ...post, comments: [...post.comments, nextComment] }
          : post,
      ),
    );
    setBoardComment("");
  }

  function handleBoardReaction(
    postId: string,
    reaction: "likes" | "dislikes",
    commentId?: string,
  ) {
    persistBoardPosts(
      boardPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        if (!commentId) {
          return { ...post, [reaction]: post[reaction] + 1 };
        }

        return {
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, [reaction]: comment[reaction] + 1 }
              : comment,
          ),
        };
      }),
    );
  }

  function handleOpinionReaction(opinionId: string, reaction: "likes" | "dislikes") {
    persistOpinions(
      opinions.map((opinion) =>
        opinion.id === opinionId
          ? { ...opinion, [reaction]: opinion[reaction] + 1 }
          : opinion,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <StockHeader stock={activeStock} />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
        <UpbitStyleChartLayout stock={activeStock} />
        <LiveOpinionPanel
          mobileTab={mobileOpinionTab}
          opinions={stockOpinions}
          profile={profile}
          quickForm={quickForm}
          setQuickForm={setQuickForm}
          onMobileTabChange={setMobileOpinionTab}
          onQuickSubmit={handleQuickOpinionSubmit}
        />
      </section>

      <section
        id="stock-opinion-expanded"
        className="grid scroll-mt-28 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]"
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>전체 프로필 의견</CardTitle>
                  <CardDescription>
                    차트 옆 패널에서 남긴 의견을 더 자세히 모아보는 영역입니다.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={cn(
                      opinionSort === "latest" &&
                        "border-slate-950 bg-slate-950 text-white",
                    )}
                    onClick={() => setOpinionSort("latest")}
                  >
                    최신순
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={cn(
                      opinionSort === "popular" &&
                        "border-slate-950 bg-slate-950 text-white",
                    )}
                    onClick={() => setOpinionSort("popular")}
                  >
                    인기순
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <UserCircle className="h-4 w-4" aria-hidden="true" />
                의견 {stockOpinions.length.toLocaleString("ko-KR")}개
              </div>
            </CardContent>
          </Card>

          {stockOpinions.map((opinion) => (
            <OpinionCard
              key={opinion.id}
              opinion={opinion}
              onReact={handleOpinionReaction}
            />
          ))}
          {stockOpinions.length === 0 ? (
            <Card>
              <CardContent className="p-5 text-sm text-slate-400">
                아직 등록된 프로필 의견이 없습니다.
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>상세 의견 작성</CardTitle>
              <CardDescription>
                태그, 목표 기간, 근거까지 남기는 프로필 의견입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileSummary profile={profile} />

              <form className="grid gap-4" onSubmit={handleDetailedOpinionSubmit}>
                <label className="space-y-2 text-sm text-slate-700">
                  의견 방향
                  <select
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-slate-400"
                    value={detailedForm.direction}
                    onChange={(event) =>
                      setDetailedForm((current) => ({
                        ...current,
                        direction: event.target.value as StockOpinionDirection,
                      }))
                    }
                  >
                    <option value="bullish">좋게 봄</option>
                    <option value="neutral">애매함</option>
                    <option value="bearish">안 좋게 봄</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  제목
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    value={detailedForm.title}
                    placeholder="오늘 이 종목을 보는 한 줄 제목"
                    onChange={(event) =>
                      setDetailedForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  한마디 본문
                  <textarea
                    className="min-h-24 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    value={detailedForm.body}
                    placeholder="종목을 어떻게 보고 있는지 의견 중심으로 남겨주세요."
                    maxLength={240}
                    onChange={(event) =>
                      setDetailedForm((current) => ({
                        ...current,
                        body: event.target.value,
                      }))
                    }
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
                  <label className="space-y-2 text-sm text-slate-700">
                    태그
                    <input
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                      value={detailedForm.tag}
                      placeholder="예: 반도체, 실적, 변동성"
                      onChange={(event) =>
                        setDetailedForm((current) => ({
                          ...current,
                          tag: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    목표 기간
                    <select
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-slate-400"
                      value={detailedForm.timeHorizon}
                      onChange={(event) =>
                        setDetailedForm((current) => ({
                          ...current,
                          timeHorizon: event.target.value as StockOpinionTimeHorizon,
                        }))
                      }
                    >
                      {timeHorizonOptions.map((timeHorizon) => (
                        <option key={timeHorizon} value={timeHorizon}>
                          {timeHorizon}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-700">근거 선택</p>
                  <div className="flex flex-wrap gap-2">
                    {reasonOptions.map((reason) => {
                      const selected = detailedForm.reasons.includes(reason);

                      return (
                        <Button
                          key={reason}
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={cn(
                            selected && "border-slate-950 bg-slate-950 text-white",
                          )}
                          onClick={() => toggleReason(reason)}
                        >
                          {reason}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  본 영역은 사용자 의견 기록용이며 투자 조언이나 판단 근거로 사용할 수
                  없습니다.
                </p>
                <Button type="submit" className="w-full">
                  <PenLine className="h-4 w-4" aria-hidden="true" />
                  상세 의견 등록
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <StockBoardSection
        boardComment={boardComment}
        boardForm={boardForm}
        boardPosts={sortedBoardPosts}
        boardSort={boardSort}
        selectedPost={selectedBoardPost}
        onBoardCommentChange={setBoardComment}
        onBoardCommentSubmit={handleBoardCommentSubmit}
        onBoardFormChange={setBoardForm}
        onBoardPostSelect={handleBoardPostSelect}
        onBoardPostSubmit={handleBoardPostSubmit}
        onBoardReaction={handleBoardReaction}
        onBoardSortChange={setBoardSort}
      />
    </div>
  );
}
