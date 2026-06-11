"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type { VoteDirection, VoteFormInput } from "@/lib/types";
import { voteFormSchema } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type VotePanelProps = {
  stockSymbol: string;
  compact?: boolean;
  onVote?: (direction: VoteDirection) => void;
};

export function VotePanel({ stockSymbol, compact, onVote }: VotePanelProps) {
  const [submittedDirection, setSubmittedDirection] = useState<VoteDirection | null>(
    null,
  );
  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<VoteFormInput>({
    resolver: zodResolver(voteFormSchema),
  });
  const selectedDirection = useWatch({ control, name: "direction" });

  function submitVote(input: VoteFormInput) {
    if (submittedDirection) {
      return;
    }

    setSubmittedDirection(input.direction);
    onVote?.(input.direction);
  }

  return (
    <form
      className={cn(
        "rounded-lg border border-white/10 bg-black/18 p-3",
        compact ? "space-y-3" : "space-y-4",
      )}
      onSubmit={handleSubmit(submitVote)}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">내일 방향 투표</div>
          <div className="text-xs text-slate-500">{stockSymbol} after-close session</div>
        </div>
        {submittedDirection ? (
          <div className="flex items-center gap-1.5 text-xs text-cyan-100">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            반영됨
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="bullish"
          className={cn(
            "h-11",
            selectedDirection === "up" && "ring-2 ring-emerald-200/60",
          )}
          disabled={Boolean(submittedDirection)}
          onClick={() => setValue("direction", "up", { shouldValidate: true })}
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          상승
        </Button>
        <Button
          type="button"
          variant="bearish"
          className={cn(
            "h-11",
            selectedDirection === "down" && "ring-2 ring-rose-200/60",
          )}
          disabled={Boolean(submittedDirection)}
          onClick={() => setValue("direction", "down", { shouldValidate: true })}
        >
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
          하락
        </Button>
      </div>

      {errors.direction ? (
        <p className="text-xs text-amber-200">상승 또는 하락 중 하나를 선택하세요.</p>
      ) : null}

      <Button
        type="submit"
        variant="secondary"
        className="w-full"
        disabled={!selectedDirection || Boolean(submittedDirection)}
      >
        {submittedDirection ? "오늘 세션 투표 완료" : "투표 반영하기"}
      </Button>
    </form>
  );
}
