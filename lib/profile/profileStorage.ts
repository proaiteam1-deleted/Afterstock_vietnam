import type { UserProfile } from "@/types/stock";

export const PROFILE_STORAGE_KEYS = {
  userProfile: "afterstock:stock-user-profile:v1",
} as const;

const nicknameBases = [
  "장기투자자",
  "반등기원",
  "관망투자자",
  "분할매수",
  "차트분석가",
  "오늘도관망",
];

const avatarTypes: UserProfile["avatarType"][] = [
  "seed",
  "chart",
  "flame",
  "wave",
  "ai",
  "moon",
];

const investorTypes: UserProfile["investorType"][] = [
  "일반투자자",
  "단타",
  "장투",
  "관망",
  "과열주의",
  "AI분석",
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readProfile(): UserProfile | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(PROFILE_STORAGE_KEYS.userProfile);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as UserProfile;
  } catch {
    return null;
  }
}

export function createRandomUserProfile(): UserProfile {
  const baseName = nicknameBases[Math.floor(Math.random() * nicknameBases.length)];
  const suffix = Math.floor(100 + Math.random() * 900);

  return {
    id: createId("stock-user"),
    nickname: `${baseName}${suffix}`,
    avatarType: avatarTypes[Math.floor(Math.random() * avatarTypes.length)],
    investorType: investorTypes[Math.floor(Math.random() * investorTypes.length)],
    createdAt: new Date().toISOString(),
  };
}

export function getUserProfile() {
  return readProfile();
}

export function setUserProfile(profile: UserProfile) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEYS.userProfile, JSON.stringify(profile));
}

export function getOrCreateUserProfile() {
  const savedProfile = getUserProfile();

  if (savedProfile) {
    return savedProfile;
  }

  const profile = createRandomUserProfile();
  setUserProfile(profile);

  return profile;
}
