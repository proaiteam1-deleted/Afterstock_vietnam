"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, PenLine, ThumbsDown, ThumbsUp } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

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
  randomNicknames,
  stockOpinionPosts,
  type BoardSection,
  type StockOpinion,
  type StockOpinionPost,
} from "@/lib/mock/market-community";
import { getOrSeedStockOpinions, setStockOpinions } from "@/lib/storage";
const quickTags = ["반도체", "AI", "플랫폼", "방산", "원전", "2차전지", "수급", "테마"];

type StockOpinionBoardProps = {
  board: BoardSection;
};

type OpinionFormState = {
  stockName: string;
  opinion: StockOpinion;
  note: string;
  tag: string;
};

const initialFormState: OpinionFormState = {
  stockName: "",
  opinion: "neutral",
  note: "",
  tag: "",
};

const opinionLabels: Record<StockOpinion, string> = {
  good: "좋게 봄",
  neutral: "애매함",
  bad: "안 좋게 봄",
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

function getOpinionVariant(opinion: StockOpinion) {
  if (opinion === "good") {
    return "success" as const;
  }

  if (opinion === "bad") {
    return "danger" as const;
  }

  return "warning" as const;
}

function StockOpinionCard({
  post,
  onReact,
}: {
  post: StockOpinionPost;
  onReact: (postId: string, reaction: "likes" | "dislikes") => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{post.stockName}</CardTitle>
              <Badge variant={getOpinionVariant(post.opinion)}>
                {opinionLabels[post.opinion]}
              </Badge>
              {post.tag ? <Badge>{post.tag}</Badge> : null}
            </div>
            <CardDescription>
              {post.author} · {post.createdAt}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />한 줄 의견
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-200">{post.note}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => onReact(post.id, "likes")}>
            <ThumbsUp className="h-4 w-4" aria-hidden="true" />
            공감 {post.likes.toLocaleString("ko-KR")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onReact(post.id, "dislikes")}
          >
            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            비공감 {post.dislikes.toLocaleString("ko-KR")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function StockOpinionBoard({ board }: StockOpinionBoardProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [form, setForm] = useState<OpinionFormState>(initialFormState);
  const [posts, setPosts] = useState<StockOpinionPost[]>(stockOpinionPosts);
  const [stockFilter, setStockFilter] = useState("");
  const [opinionFilter, setOpinionFilter] = useState<"all" | StockOpinion>("all");
  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        const matchesStock = post.stockName
          .toLowerCase()
          .includes(stockFilter.trim().toLowerCase());
        const matchesOpinion =
          opinionFilter === "all" ? true : post.opinion === opinionFilter;

        return matchesStock && matchesOpinion;
      }),
    [opinionFilter, posts, stockFilter],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setPosts(getOrSeedStockOpinions());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function updateForm(field: keyof OpinionFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function persistPosts(nextPosts: StockOpinionPost[]) {
    setPosts(nextPosts);
    setStockOpinions(nextPosts);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.stockName.trim() || !form.note.trim()) {
      return;
    }

    const nextPost: StockOpinionPost = {
      id: `stock-opinion-local-${Date.now()}`,
      stockName: form.stockName.trim(),
      opinion: form.opinion,
      note: form.note.trim(),
      tag: form.tag.trim(),
      author: createRandomAuthor(),
      createdAt: getCurrentTimeLabel(),
      likes: 0,
      dislikes: 0,
    };

    persistPosts([nextPost, ...posts]);
    setForm(initialFormState);
    setIsWriting(false);
  }

  function handleReact(postId: string, reaction: "likes" | "dislikes") {
    persistPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, [reaction]: post[reaction] + 1 } : post,
      ),
    );
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
            <Badge variant="accent">종목 한마디</Badge>
            <Badge>직접 입력</Badge>
            <Badge>한 줄 의견</Badge>
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {board.title}
            </h1>
            <p className="text-base leading-7 text-slate-300">{board.description}</p>
            <p className="text-sm leading-6 text-slate-500">
              긴 분석보다 오늘의 체감 의견을 남기는 공간입니다. 모든 내용은 개인 의견이며
              투자 조언이 아닙니다.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>오늘의 한마디</CardTitle>
            <CardDescription>종목별 짧은 의견을 모아보는 공간</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">표시 중</span>
              <span className="font-semibold text-white">
                {filteredPosts.length.toLocaleString("ko-KR")}개
              </span>
            </div>
            <Button
              className="w-full"
              onClick={() => setIsWriting((current) => !current)}
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              한마디 쓰기
            </Button>
          </CardContent>
        </Card>
      </section>

      {isWriting ? (
        <Card>
          <CardHeader>
            <CardTitle>종목 한마디 쓰기</CardTitle>
            <CardDescription>
              매수·매도 추천이 아니라 오늘의 체감 의견만 짧게 남겨주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <label className="space-y-2 text-sm text-slate-300">
                  종목명
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.stockName}
                    placeholder="예: 삼성전자"
                    onChange={(event) => updateForm("stockName", event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  의견 선택
                  <select
                    className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.opinion}
                    onChange={(event) =>
                      updateForm("opinion", event.target.value as StockOpinion)
                    }
                  >
                    <option value="good">좋게 봄</option>
                    <option value="neutral">애매함</option>
                    <option value="bad">안 좋게 봄</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-300">
                한마디 내용
                <input
                  className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                  value={form.note}
                  placeholder="긴 분석 말고 오늘 느낌 한 줄"
                  maxLength={120}
                  onChange={(event) => updateForm("note", event.target.value)}
                />
              </label>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  태그 선택 또는 직접 입력
                  <input
                    className="mt-2 w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
                    value={form.tag}
                    placeholder="예: 반도체"
                    onChange={(event) => updateForm("tag", event.target.value)}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => updateForm("tag", tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
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

      <section className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[1fr_180px]">
        <label className="space-y-2 text-sm text-slate-300">
          종목명 필터
          <input
            className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
            value={stockFilter}
            placeholder="예: 삼성전자"
            onChange={(event) => setStockFilter(event.target.value)}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          의견별 필터
          <select
            className="w-full rounded-md border border-white/10 bg-black/24 px-3 py-2 text-white outline-none transition focus:border-cyan-300/50"
            value={opinionFilter}
            onChange={(event) =>
              setOpinionFilter(event.target.value as "all" | StockOpinion)
            }
          >
            <option value="all">전체</option>
            <option value="good">좋게 봄</option>
            <option value="neutral">애매함</option>
            <option value="bad">안 좋게 봄</option>
          </select>
        </label>
      </section>

      <section className="space-y-3">
        {filteredPosts.map((post) => (
          <StockOpinionCard key={post.id} post={post} onReact={handleReact} />
        ))}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        투자 조언 아님: 이 게시판의 내용은 사용자 개인 의견이며 실제 투자 판단 근거로
        사용할 수 없습니다.
      </p>
    </div>
  );
}
