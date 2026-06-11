import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function MarketSessionBadge() {
  return (
    <Badge variant="accent" className="gap-2">
      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
      투표 오픈: 장 마감 후 20:00 ~ 익일 08:00
    </Badge>
  );
}
