export function CommunityPageHeading() {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-medium text-cyan-100">Community base</p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
          장 마감 후 의견 흐름
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          매매 추천이 아닌 관점 공유와 사후 예측 정확도 기반의 신뢰 배지를 위한 초기
          화면입니다.
        </p>
      </div>
    </div>
  );
}
