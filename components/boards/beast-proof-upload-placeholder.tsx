import { ImagePlus } from "lucide-react";

export function BeastProofUploadPlaceholder() {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.035] p-4 text-center">
      <ImagePlus className="h-6 w-6 text-slate-400" aria-hidden="true" />
      <div className="mt-2 text-sm font-medium text-slate-200">인증 이미지 영역</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">
        실제 업로드는 아직 연결하지 않고 UI만 제공합니다.
      </div>
    </div>
  );
}
