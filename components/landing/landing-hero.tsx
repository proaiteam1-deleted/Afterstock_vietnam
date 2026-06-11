import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroSentimentPreview } from "@/components/landing/hero-sentiment-preview";
import { MarketSessionBadge } from "@/components/market-session-badge";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="financial-grid noise-surface relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
      <div className="mx-auto grid min-h-[92vh] w-full max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
        <div className="relative z-10 max-w-3xl">
          <MarketSessionBadge />
          <h1 className="mt-8 text-6xl font-semibold tracking-normal text-white sm:text-7xl lg:text-8xl">
            AfterStock
          </h1>
          <p className="mt-5 text-2xl font-medium text-cyan-100">
            장 끝난 뒤, 투자자들의 방향을 본다.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            삼성전자와 SK하이닉스의 장 마감 후 투자자 심리를 모아 다음 장의 쏠림과 역방향
            가능성을 읽는 AI 투자 심리 지표.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                오늘의 심리 보기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/community">커뮤니티 미리보기</Link>
            </Button>
          </div>
        </div>

        <HeroSentimentPreview />
      </div>
    </section>
  );
}
