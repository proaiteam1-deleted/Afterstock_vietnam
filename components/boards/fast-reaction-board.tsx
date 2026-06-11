"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MessageCircle, Send, Sparkles } from "lucide-react";
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
  fastReactionIssues,
  randomNicknames,
  type BoardSection,
  type FastReactionIssue,
  type FastReactionMood,
} from "@/lib/mock/market-community";
import { getOrSeedFastReactionIssues, setFastReactionIssues } from "@/lib/storage";

type FastReactionBoardProps = {
  board: BoardSection;
};

const reactionLabels: Record<FastReactionMood, string> = {
  positive: "호재 같음",
  negative: "악재 같음",
  unknown: "아직 모름",
};

const reactionBarClasses: Record<FastReactionMood, string> = {
  positive: "bg-emerald-400",
  negative: "bg-rose-400",
  unknown: "bg-slate-400",
};

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function createRandomNickname() {
  const baseName = randomNicknames[Math.floor(Math.random() * randomNicknames.length)];
  const suffix = Math.floor(100 + Math.random() * 900);

  return `${baseName}${suffix}`;
}

function getTotalReactions(issue: FastReactionIssue) {
  return issue.reactions.positive + issue.reactions.negative + issue.reactions.unknown;
}

function getReactionPercent(issue: FastReactionIssue, mood: FastReactionMood) {
  const total = getTotalReactions(issue);

  if (total === 0) {
    return 0;
  }

  return Math.round((issue.reactions[mood] / total) * 100);
}

function getLeadingMood(issue: FastReactionIssue) {
  return (Object.keys(issue.reactions) as FastReactionMood[]).reduce((leader, mood) =>
    issue.reactions[mood] > issue.reactions[leader] ? mood : leader,
  );
}

function ReactionBar({ issue }: { issue: FastReactionIssue }) {
  const moods: FastReactionMood[] = ["positive", "negative", "unknown"];

  return (
    <div className="space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.08]">
        {moods.map((mood) => {
          const percent = getReactionPercent(issue, mood);

          return (
            <div
              key={mood}
              className={reactionBarClasses[mood]}
              style={{ width: `${percent}%` }}
              aria-label={`${reactionLabels[mood]} ${percent}%`}
            />
          );
        })}
      </div>
      <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
        {moods.map((mood) => (
          <div key={mood} className="flex items-center justify-between gap-2">
            <span>{reactionLabels[mood]}</span>
            <span className="font-medium text-slate-200">
              {getReactionPercent(issue, mood)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FastReactionCard({
  issue,
  commentValue,
  onCommentChange,
  onReact,
  onSubmitComment,
}: {
  issue: FastReactionIssue;
  commentValue: string;
  onCommentChange: (issueId: string, value: string) => void;
  onReact: (issueId: string, mood: FastReactionMood) => void;
  onSubmitComment: (issueId: string) => void;
}) {
  const leadingMood = getLeadingMood(issue);
  const totalReactions = getTotalReactions(issue);

  function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmitComment(issue.id);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{issue.title}</CardTitle>
              <Badge variant="accent">{issue.sector}</Badge>
              <Badge>{reactionLabels[leadingMood]} 우세</Badge>
            </div>
            <CardDescription className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {issue.createdAt} 감지
            </CardDescription>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
            참여자 {totalReactions.toLocaleString("ko-KR")}명
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ReactionBar issue={issue} />

        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            variant="bullish"
            size="sm"
            onClick={() => onReact(issue.id, "positive")}
          >
            {reactionLabels.positive} {issue.reactions.positive.toLocaleString("ko-KR")}
          </Button>
          <Button
            variant="bearish"
            size="sm"
            onClick={() => onReact(issue.id, "negative")}
          >
            {reactionLabels.negative} {issue.reactions.negative.toLocaleString("ko-KR")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onReact(issue.id, "unknown")}
          >
            {reactionLabels.unknown} {issue.reactions.unknown.toLocaleString("ko-KR")}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            최신 한마디
          </div>
          <div className="space-y-2">
            {issue.comments.slice(0, 3).map((comment) => (
              <div
                key={comment.id}
                className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-300">{comment.nickname}</span>
                  <span>{comment.timeLabel}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-300">{comment.message}</p>
              </div>
            ))}
          </div>
        </div>

        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleCommentSubmit}>
          <input
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/50"
            value={commentValue}
            placeholder="이 이슈에 대한 체감 한마디"
            maxLength={120}
            onChange={(event) => onCommentChange(issue.id, event.target.value)}
          />
          <Button type="submit" variant="secondary">
            <Send className="h-4 w-4" aria-hidden="true" />
            남기기
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function FastReactionBoard({ board }: FastReactionBoardProps) {
  const [issues, setIssues] = useState<FastReactionIssue[]>(fastReactionIssues);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const totalParticipants = useMemo(
    () => issues.reduce((total, issue) => total + getTotalReactions(issue), 0),
    [issues],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setIssues(getOrSeedFastReactionIssues());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function persistIssues(nextIssues: FastReactionIssue[]) {
    setIssues(nextIssues);
    setFastReactionIssues(nextIssues);
  }

  function updateCommentDraft(issueId: string, value: string) {
    setCommentDrafts((current) => ({ ...current, [issueId]: value }));
  }

  function handleReact(issueId: string, mood: FastReactionMood) {
    persistIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              reactions: {
                ...issue.reactions,
                [mood]: issue.reactions[mood] + 1,
              },
            }
          : issue,
      ),
    );
  }

  function handleSubmitComment(issueId: string) {
    const message = commentDrafts[issueId]?.trim();

    if (!message) {
      return;
    }

    persistIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              comments: [
                {
                  id: `fast-comment-local-${issueId}-${Date.now()}`,
                  nickname: createRandomNickname(),
                  message,
                  timeLabel: getCurrentTimeLabel(),
                },
                ...issue.comments,
              ],
            }
          : issue,
      ),
    );
    updateCommentDraft(issueId, "");
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
            <Badge variant="accent">커뮤니티 이슈 반응</Badge>
            <Badge>실제 뉴스 아님</Badge>
            <Badge>체감 분위기</Badge>
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {board.title}
            </h1>
            <p className="text-base leading-7 text-slate-300">
              뉴스 뜨기 전에 커뮤니티에서 먼저 느껴지는 분위기를 빠르게 모아봅니다.
            </p>
            <p className="text-sm leading-6 text-slate-500">
              실제 기사나 출처 기반 뉴스 데이터가 아니라, 사용자들이 체감하는 이슈 온도를
              호재·악재·아직 모름으로 가볍게 남기는 공간입니다.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>오늘의 체감 이슈</CardTitle>
            <CardDescription>출처 대신 분위기를 보는 커뮤니티 지표</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">감지 이슈</span>
              <span className="font-semibold text-white">
                {issues.length.toLocaleString("ko-KR")}개
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">반응 참여</span>
              <span className="font-semibold text-white">
                {totalParticipants.toLocaleString("ko-KR")}명
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-cyan-300/15 bg-cyan-300/8 px-3 py-2 text-xs leading-5 text-cyan-100">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              기사처럼 확정된 사실이 아니라 커뮤니티 체감 반응입니다.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        {issues.map((issue) => (
          <FastReactionCard
            key={issue.id}
            issue={issue}
            commentValue={commentDrafts[issue.id] ?? ""}
            onCommentChange={updateCommentDraft}
            onReact={handleReact}
            onSubmitComment={handleSubmitComment}
          />
        ))}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        투자 조언 아님: 이 페이지는 실제 뉴스 기사나 금융 데이터가 아닌 커뮤니티 참여 기반
        체감 반응이며, 투자 판단 근거로 사용할 수 없습니다.
      </p>
    </div>
  );
}
