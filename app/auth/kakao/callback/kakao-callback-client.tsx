"use client";

import Link from "next/link";
import { useEffect } from "react";

type KakaoCallbackClientProps = {
  code?: string;
  error?: string;
};

type CallbackStatus = "checking" | "error" | "success";

export function KakaoCallbackClient({ code, error }: KakaoCallbackClientProps) {
  const status: CallbackStatus = error || !code ? "error" : "success";

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    // TODO: Send Kakao authorization code to the backend callback API.
    // TODO: Exchange access_token and fetch Kakao user profile on the backend.
    // TODO: Create profile and move new users to interest setup.
    // TODO: Issue server session/JWT for returning users before redirecting home.
    localStorage.setItem(
      "afterstock_mock_user",
      JSON.stringify({
        loggedInAt: new Date().toISOString(),
        nickname: "Người dùng Kakao",
        provider: "kakao",
      }),
    );

  }, [status]);

  const isSuccess = status === "success";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/70">
        <p className="text-sm font-black text-yellow-600">AfterStock Kakao</p>
        <h1 className="mt-3 text-2xl font-black tracking-normal text-slate-950">
          {isSuccess ? "Đăng nhập Kakao thành công" : "Cần kiểm tra đăng nhập Kakao"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {isSuccess
            ? "Trạng thái người dùng tạm thời đã được lưu. Khi vận hành thật, phần này sẽ được thay bằng trao đổi token và tạo hồ sơ qua backend."
            : "Không có mã xác thực hoặc đã xảy ra lỗi trong quá trình đăng nhập Kakao."}
        </p>
        <div className="mt-6 grid gap-2">
          <Link
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
            href="/"
          >
            Về trang chính
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
            href="/onboarding/interests"
          >
            Màn hình chuẩn bị chọn mã quan tâm
          </Link>
        </div>
      </section>
    </main>
  );
}
