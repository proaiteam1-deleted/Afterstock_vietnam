import { Activity, CalendarClock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MarketStatusCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10">
          <CalendarClock className="h-5 w-5 text-cyan-100" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Market status</CardTitle>
          <p className="mt-1 text-sm text-slate-400">
            투표 오픈: 장 마감 후 20:00 ~ 익일 08:00
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/18 p-3">
          <p className="text-xs text-slate-500">Session</p>
          <p className="mt-1 text-lg font-semibold text-white">After Close</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/18 p-3">
          <p className="text-xs text-slate-500">Coverage</p>
          <p className="mt-1 text-lg font-semibold text-white">2 mega-caps</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/18 p-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            Signal mode
          </p>
          <p className="mt-1 text-lg font-semibold text-white">Reference indicator</p>
        </div>
      </CardContent>
    </Card>
  );
}
