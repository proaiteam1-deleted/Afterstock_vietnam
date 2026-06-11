const previewStocks = [
  {
    name: "삼성전자",
    symbol: "005930",
    percent: "68%",
    label: "Bullish crowding",
    hint: "상승 심리 우세",
  },
  {
    name: "SK하이닉스",
    symbol: "000660",
    percent: "53%",
    label: "Neutral",
    hint: "방향성 관찰",
  },
];

const heroBars = [34, 44, 39, 58, 62, 49, 71, 68, 55, 61, 48, 66];

export function HeroSentimentPreview() {
  return (
    <div className="relative z-10 min-h-[440px] lg:min-h-[540px]">
      <div className="absolute inset-0 rounded-lg border border-white/10 bg-[#090d16]/82 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              live sentiment board
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              After-close retail imbalance
            </p>
          </div>
          <div className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
            20:45 KST
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {previewStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{stock.name}</p>
                  <p className="text-sm text-slate-500">{stock.symbol} · KOSPI</p>
                </div>
                <p className="text-3xl font-semibold text-cyan-100">{stock.percent}</p>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: stock.percent }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-300">{stock.label}</span>
                <span className="text-slate-500">{stock.hint}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-12 items-end gap-2">
          {heroBars.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="rounded-t bg-cyan-300/40"
              style={{ height: `${value * 2}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
