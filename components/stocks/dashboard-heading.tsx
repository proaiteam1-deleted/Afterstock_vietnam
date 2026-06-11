import { MarketSessionBadge } from "@/components/market-session-badge";

export function DashboardHeading() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-cyan-100">After-close dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
          오늘의 투자자 심리
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          첫 버전은 삼성전자와 SK하이닉스에 집중해 상승·하락 의견, 군중 쏠림, 역방향
          가능성을 빠르게 보여줍니다.
        </p>
      </div>
      <MarketSessionBadge />
    </div>
  );
}
