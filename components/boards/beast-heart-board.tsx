"use client";

import Link from "next/link";
import { ArrowLeft, Eye, Flame, PenLine, RadioTower, ShieldAlert } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { BeastProofUploadPlaceholder } from "@/components/boards/beast-proof-upload-placeholder";
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
  beastHeartPosts,
  randomNicknames,
  type BeastHeartAssetType,
  type BeastHeartDirection,
  type BeastHeartLeverage,
  type BeastHeartPost,
  type BeastHeartReaction,
  type BoardSection,
} from "@/lib/mock/market-community";
import { getOrSeedBeastHeartPosts, setBeastHeartPosts } from "@/lib/storage";

type BeastHeartBoardProps = {
  board: BoardSection;
};

type BeastHeartFormState = {
  title: string;
  assetType: BeastHeartAssetType;
  assetName: string;
  direction: BeastHeartDirection;
  entryPrice: string;
  leverage: BeastHeartLeverage;
  note: string;
};

const initialFormState: BeastHeartFormState = {
  title: "",
  assetType: "stock",
  assetName: "",
  direction: "long",
  entryPrice: "",
  leverage: "none",
  note: "",
};

const assetTypeLabels: Record<BeastHeartAssetType, string> = {
  stock: "주식",
  coin: "코인",
  index: "지수",
  "etf-etn": "ETF/ETN",
  other: "기타",
};

const directionLabels: Record<BeastHeartDirection, string> = {
  long: "롱/상승",
  short: "숏/하락",
  spot: "현물 매수",
  "break-watch": "관망 깨고 진입",
};

const leverageLabels: Record<BeastHeartLeverage, string> = {
  none: "없음",
  "2x": "2배",
  "3x": "3배",
  "5x": "5배",
  "10x": "10배",
  "20x": "20배",
  "50x": "50배",
  "100x-plus": "100배 이상",
};

const reactionLabels: Record<BeastHeartReaction, string> = {
  watching: "관전중",
  respect: "심장 인정",
  concern: "위험해 보임",
};

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function createRandomAuthor() {
  const baseName = randomNicknames[Math.floor(Math.random() * randomNicknames.length)];
  const suffix = Math.floor(100 + Math.random() * 900);

  return `${baseName}${suffix}`;
}

function getLeverageMultiplier(leverage: BeastHeartLeverage) {
  if (leverage === "none") {
    return 1;
  }

  if (leverage === "100x-plus") {
    return 100;
  }

  return Number(leverage.replace("x", ""));
}

function getRiskLabel(leverage: BeastHeartLeverage) {
  if (leverage === "none") {
    return "관전";
  }

  if (["2x", "3x", "5x"].includes(leverage)) {
    return "긴장";
  }

  if (["10x", "20x"].includes(leverage)) {
    return "야수";
  }

  if (leverage === "50x") {
    return "광기";
  }

  return "전설";
}

function getRiskVariant(leverage: BeastHeartLeverage) {
  if (leverage === "none") {
    return "accent" as const;
  }

  if (["2x", "3x", "5x"].includes(leverage)) {
    return "warning" as const;
  }

  if (["10x", "20x", "50x"].includes(leverage)) {
    return "danger" as const;
  }

  return "warning" as const;
}

function formatPrice(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  });
}

function getMockCurrentPrice(entryPrice: number, direction: BeastHeartDirection) {
  const drift = direction === "short" ? -0.012 : 0.012;
  const randomMove = Math.random() * 0.06 - 0.03;

  return Math.max(entryPrice * (1 + drift + randomMove), 0);
}

function getProfitRate(post: BeastHeartPost) {
  const priceMove =
    post.direction === "short"
      ? (post.entryPrice - post.currentPrice) / post.entryPrice
      : (post.currentPrice - post.entryPrice) / post.entryPrice;

  return priceMove * getLeverageMultiplier(post.leverage) * 100;
}

function getTotalReactions(post: BeastHeartPost) {
  return post.reactions.watching + post.reactions.respect + post.reactions.concern;
}

function BeastHeartPostCard({
  post,
  onReact,
}: {
  post: BeastHeartPost;
  onReact: (postId: string, reaction: BeastHeartReaction) => void;
}) {
  const profitRate = getProfitRate(post);
  const isPositive = profitRate >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{post.title}</CardTitle>
              <Badge variant={getRiskVariant(post.leverage)}>
                {getRiskLabel(post.leverage)}
              </Badge>
              <Badge>{assetTypeLabels[post.assetType]}</Badge>
            </div>
            <CardDescription>
              {post.author} · {post.createdAt}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
            <Eye className="h-4 w-4 text-cyan-200" aria-hidden="true" />
            관전 {post.viewers.toLocaleString("ko-KR")}명
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="text-xs text-slate-500">종목/자산명</div>
            <div className="mt-1 text-sm font-semibold text-white">{post.assetName}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="text-xs text-slate-500">방향</div>
            <div className="mt-1">
              <Badge variant={post.direction === "short" ? "danger" : "success"}>
                {directionLabels[post.direction]}
              </Badge>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="text-xs text-slate-500">레버리지</div>
            <div className="mt-1">
              <Badge variant={getRiskVariant(post.leverage)}>
                {leverageLabels[post.leverage]}
              </Badge>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="text-xs text-slate-500">반응 수</div>
            <div className="mt-1 text-sm font-semibold text-white">
              {getTotalReactions(post).toLocaleString("ko-KR")}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-500">진입가</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {formatPrice(post.entryPrice)}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-500">mock 현재가</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {formatPrice(post.currentPrice)}
            </div>
          </div>
          <div
            className={
              isPositive
                ? "rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-3"
                : "rounded-lg border border-rose-300/20 bg-rose-400/10 p-3"
            }
          >
            <div
              className={
                isPositive ? "text-xs text-emerald-200" : "text-xs text-rose-200"
              }
            >
              현재 손익률
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {isPositive ? "+" : ""}
              {profitRate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}%
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <div className="text-xs text-slate-500">인증 한마디</div>
          <p className="mt-1 text-sm leading-6 text-slate-300">{post.note}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onReact(post.id, "watching")}
          >
            <RadioTower className="h-4 w-4" aria-hidden="true" />
            {reactionLabels.watching} {post.reactions.watching.toLocaleString("ko-KR")}
          </Button>
          <Button
            type="button"
            variant="bullish"
            size="sm"
            onClick={() => onReact(post.id, "respect")}
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            {reactionLabels.respect} {post.reactions.respect.toLocaleString("ko-KR")}
          </Button>
          <Button
            type="button"
            variant="bearish"
            size="sm"
            onClick={() => onReact(post.id, "concern")}
          >
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            {reactionLabels.concern} {post.reactions.concern.toLocaleString("ko-KR")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function BeastHeartBoard({ board }: BeastHeartBoardProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [form, setForm] = useState<BeastHeartFormState>(initialFormState);
  const [posts, setPosts] = useState<BeastHeartPost[]>(beastHeartPosts);
  const totalViewers = useMemo(
    () => posts.reduce((total, post) => total + post.viewers, 0),
    [posts],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setPosts(getOrSeedBeastHeartPosts());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function updateForm(field: keyof BeastHeartFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function persistPosts(nextPosts: BeastHeartPost[]) {
    setPosts(nextPosts);
    setBeastHeartPosts(nextPosts);
  }

  function handleReact(postId: string, reaction: BeastHeartReaction) {
    persistPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [reaction]: post.reactions[reaction] + 1,
              },
            }
          : post,
      ),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entryPrice = Number(form.entryPrice);

    if (
      !form.title.trim() ||
      !form.assetName.trim() ||
      !form.entryPrice.trim() ||
      !Number.isFinite(entryPrice) ||
      entryPrice <= 0 ||
      !form.note.trim()
    ) {
      return;
    }

    const nextPost: BeastHeartPost = {
      id: `beast-local-${Date.now()}`,
      title: form.title.trim(),
      assetType: form.assetType,
      assetName: form.assetName.trim(),
      direction: form.direction,
      entryPrice,
      leverage: form.leverage,
      currentPrice: getMockCurrentPrice(entryPrice, form.direction),
      note: form.note.trim(),
      author: createRandomAuthor(),
      createdAt: getCurrentTimeLabel(),
      viewers: Math.floor(40 + Math.random() * 120),
      reactions: {
        watching: 0,
        respect: 0,
        concern: 0,
      },
    };

    persistPosts([nextPost, ...posts]);
    setForm(initialFormState);
    setIsWriting(false);
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/boards">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          게시판 목록
        </Link>
      </Button>

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="danger">고위험 인증</Badge>
            <Badge>실시간 관전</Badge>
            <Badge>거래 권유 아님</Badge>
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {board.title}
            </h1>
            <p className="text-base leading-7 text-slate-300">{board.description}</p>
            <p className="text-sm leading-6 text-slate-500">
              {board.concept}. 공격적인 포지션을 인증하고 관전 반응을 남기는 커뮤니티
              기록용 게시판입니다.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>오늘의 관전판</CardTitle>
            <CardDescription>위험한 선택은 기록으로, 반응은 가볍게</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">인증글</span>
              <span className="font-semibold text-white">
                {posts.length.toLocaleString("ko-KR")}개
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">관전 중</span>
              <span className="font-semibold text-white">
                {totalViewers.toLocaleString("ko-KR")}명
              </span>
            </div>
            <Button
              className="w-full"
              onClick={() => setIsWriting((current) => !current)}
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              인증 올리기
            </Button>
          </CardContent>
        </Card>
      </section>

      {isWriting ? (
        <Card>
          <CardHeader>
            <CardTitle>야수 인증 작성</CardTitle>
            <CardDescription>
              본 게시판은 커뮤니티 인증/기록용이며 투자 조언이나 거래 권유가 아닙니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  제목
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.title}
                    placeholder="예: 비트코인 120배 롱 진입"
                    onChange={(event) => updateForm("title", event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  자산 종류
                  <select
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.assetType}
                    onChange={(event) =>
                      updateForm("assetType", event.target.value as BeastHeartAssetType)
                    }
                  >
                    <option value="stock">주식</option>
                    <option value="coin">코인</option>
                    <option value="index">지수</option>
                    <option value="etf-etn">ETF/ETN</option>
                    <option value="other">기타</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  종목/자산명
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.assetName}
                    placeholder="예: BTCUSDT, 테슬라, 삼성전자"
                    onChange={(event) => updateForm("assetName", event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  방향
                  <select
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.direction}
                    onChange={(event) =>
                      updateForm("direction", event.target.value as BeastHeartDirection)
                    }
                  >
                    <option value="long">롱/상승</option>
                    <option value="short">숏/하락</option>
                    <option value="spot">현물 매수</option>
                    <option value="break-watch">관망 깨고 진입</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  진입가
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.entryPrice}
                    inputMode="decimal"
                    placeholder="예: 105000"
                    onChange={(event) => updateForm("entryPrice", event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  레버리지
                  <select
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.leverage}
                    onChange={(event) =>
                      updateForm("leverage", event.target.value as BeastHeartLeverage)
                    }
                  >
                    <option value="none">없음</option>
                    <option value="2x">2배</option>
                    <option value="3x">3배</option>
                    <option value="5x">5배</option>
                    <option value="10x">10배</option>
                    <option value="20x">20배</option>
                    <option value="50x">50배</option>
                    <option value="100x-plus">100배 이상</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-300">
                한마디
                <input
                  className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                  value={form.note}
                  placeholder="예: 오늘 아니면 기회 없다"
                  maxLength={140}
                  onChange={(event) => updateForm("note", event.target.value)}
                />
              </label>

              <BeastProofUploadPlaceholder />

              <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3 text-sm leading-6 text-amber-100">
                본 게시판은 커뮤니티 인증/기록용이며 투자 조언이나 거래 권유가 아닙니다.
                실제 주문이나 거래 기능은 제공하지 않습니다.
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsWriting(false)}
                >
                  취소
                </Button>
                <Button type="submit">작성 완료</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        {posts.map((post) => (
          <BeastHeartPostCard key={post.id} post={post} onReact={handleReact} />
        ))}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        본 게시판은 커뮤니티 인증/기록용이며 투자 조언이나 거래 권유가 아닙니다.
      </p>
    </div>
  );
}
