import { ImagePlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ImageUploadPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          Image upload placeholder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <label className="flex min-h-40 cursor-not-allowed flex-col items-center justify-center rounded-lg border border-dashed border-white/14 bg-black/18 px-6 text-center text-sm text-slate-500">
          <ImagePlus className="mb-3 h-7 w-7" aria-hidden="true" />
          차트 캡처, 뉴스 이미지, 근거 자료 업로드 UI 예정
          <input className="sr-only" type="file" accept="image/*" disabled />
        </label>
      </CardContent>
    </Card>
  );
}
