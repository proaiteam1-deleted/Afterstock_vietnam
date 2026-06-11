import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types";
import { formatPercent } from "@/lib/utils/format";

type PredictorBadgeProps = {
  user: User;
};

const badgeTone: Record<User["badge"], "warning" | "success" | "default" | "danger"> = {
  지존: "warning",
  고수: "success",
  평범: "default",
  똥손: "danger",
};

export function PredictorBadge({ user }: PredictorBadgeProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/18 px-3 py-2">
      <div>
        <div className="text-sm font-medium text-white">{user.nickname}</div>
        <div className="text-xs text-slate-500">
          {user.totalPredictions} predictions · {formatPercent(user.accuracyRate)}
        </div>
      </div>
      <Badge variant={badgeTone[user.badge]}>{user.badge}</Badge>
    </div>
  );
}
