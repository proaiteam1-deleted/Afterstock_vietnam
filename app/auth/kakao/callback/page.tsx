import { KakaoCallbackClient } from "./kakao-callback-client";

type KakaoCallbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KakaoCallbackPage({
  searchParams,
}: KakaoCallbackPageProps) {
  const params = await searchParams;
  const code = typeof params.code === "string" ? params.code : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  return <KakaoCallbackClient code={code} error={error} />;
}
