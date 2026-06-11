import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500 shadow-sm">
      <div className="flex items-start gap-2">
        <ShieldAlert
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
          aria-hidden="true"
        />
        <p>Dịch vụ này chỉ cung cấp thông tin dựa trên tham gia cộng đồng và không phải tư vấn đầu tư.</p>
      </div>
    </div>
  );
}
