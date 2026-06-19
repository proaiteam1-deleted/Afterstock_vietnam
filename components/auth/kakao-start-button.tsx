"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type KakaoStartButtonProps = {
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
  locale: "ko" | "vi";
};

type KakaoSdk = {
  Auth?: {
    authorize: (options: { redirectUri: string }) => void;
  };
  init: (key: string) => void;
  isInitialized: () => boolean;
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const KAKAO_SDK_SRC = "https://developers.kakao.com/sdk/js/kakao.js";
const KAKAO_SDK_SCRIPT_ID = "kakao-javascript-sdk";

const kakaoCopy = {
  ko: {
    button: "카카오로 시작하기",
    loading: "카카오 연결 확인 중",
    notReady: "카카오 로그인 설정이 준비 중입니다.",
    sdkFailed: "카카오 로그인 연결을 잠시 후 다시 시도해 주세요.",
  },
  vi: {
    button: "Bắt đầu với Kakao",
    loading: "Đang kiểm tra Kakao",
    notReady: "Đăng nhập Kakao đang được chuẩn bị.",
    sdkFailed: "Vui lòng thử đăng nhập Kakao lại sau.",
  },
} as const;

function getKakaoRedirectUri() {
  if (process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
  }

  if (typeof window === "undefined") {
    return "/auth/kakao/callback";
  }

  const routePrefix = window.location.pathname.startsWith("/vn") ? "/vn" : "";

  return `${window.location.origin}${routePrefix}/auth/kakao/callback`;
}

function loadKakaoSdk() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (window.Kakao) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(KAKAO_SDK_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Kakao SDK failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_SDK_SCRIPT_ID;
    script.async = true;
    script.src = KAKAO_SDK_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Kakao SDK failed"));
    document.head.appendChild(script);
  });
}

async function ensureKakaoSdkReady() {
  const kakaoJavascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  if (!kakaoJavascriptKey || typeof window === "undefined") {
    return false;
  }

  await loadKakaoSdk();

  if (!window.Kakao) {
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoJavascriptKey);
  }

  return Boolean(window.Kakao.Auth);
}

export function KakaoStartButton({
  className,
  compact = false,
  fullWidth = false,
  locale,
}: KakaoStartButtonProps) {
  const copy = kakaoCopy[locale];
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(null);

    window.setTimeout(() => {
      setToastMessage(message);
    }, 0);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY) {
      return;
    }

    void ensureKakaoSdkReady().catch(() => undefined);

    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleKakaoLogin = async () => {
    if (!process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY) {
      showToast(copy.notReady);
      return;
    }

    setIsChecking(true);

    try {
      const isReady = await ensureKakaoSdkReady();

      if (!isReady || !window.Kakao?.Auth) {
        showToast(copy.sdkFailed);
        return;
      }

      // TODO: Kakao Sync consent items and backend token exchange will be connected here.
      window.Kakao.Auth.authorize({
        redirectUri: getKakaoRedirectUri(),
      });
    } catch {
      showToast(copy.sdkFailed);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <button
        aria-label={copy.button}
        className={cn(
          "kakaoLoginButton",
          compact && "isCompact",
          fullWidth && "isFullWidth",
          className,
        )}
        onClick={handleKakaoLogin}
        type="button"
      >
        <span className="kakaoLoginButtonMark" aria-hidden="true">
          <MessageCircle className="h-4 w-4" />
        </span>
        <span>{isChecking ? copy.loading : copy.button}</span>
      </button>

      {toastMessage ? (
        <div className="kakaoLoginToast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
