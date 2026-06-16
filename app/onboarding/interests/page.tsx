import Link from "next/link";

export default function InterestsOnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/70">
        <p className="text-sm font-black text-blue-500">AfterStock</p>
        <h1 className="mt-3 text-2xl font-black tracking-normal text-slate-950">
          Thiết lập mã quan tâm đang được chuẩn bị.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sau đăng ký Kakao Sync, bước này sẽ mở rộng sang chọn mã quan tâm, thông báo và tạo hồ sơ.
        </p>
        <Link
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          href="/"
        >
          Về trang chính
        </Link>
      </section>
    </main>
  );
}
