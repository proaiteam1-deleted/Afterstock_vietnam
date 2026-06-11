import { BarChart3, BrainCircuit, Clock4, ShieldCheck } from "lucide-react";

const steps = [
  {
    title: "장 마감 후 투표 오픈",
    description: "정규장이 끝난 뒤 다음 세션 방향에 대한 의견을 받습니다.",
    icon: Clock4,
  },
  {
    title: "상승/하락 심리 수집",
    description: "삼성전자와 SK하이닉스에 집중해 신호를 단순하게 유지합니다.",
    icon: BarChart3,
  },
  {
    title: "쏠림·과열·역방향 시그널 분석",
    description: "군중 심리의 불균형을 참고 지표로 해석합니다.",
    icon: BrainCircuit,
  },
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 text-sm font-medium text-cyan-100">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          3초 안에 이해되는 장 마감 후 심리 지표
        </h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
