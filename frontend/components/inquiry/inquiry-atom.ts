// components/inquiry/inquiry-atom.ts
import { atom } from "jotai";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  category: string;
}

// 드로어 열림/닫힘 상태
export const inquiryDrawerOpenAtom = atom(false);

// 채팅 메시지 목록
export const messagesAtom = atom<Message[]>([]);

// 현재 입력 중인 메시지
export const currentInputAtom = atom("");

// 선택된 카테고리
export const selectedCategoryAtom = atom<string | null>(null);

// 빠른 액션 버튼 목록
export const quickActionsAtom = atom<QuickAction[]>([
  { id: "1", label: "서비스 이용 문의", category: "service" },
  { id: "2", label: "모바일앱 이용 문의", category: "mobile" },
  { id: "3", label: "국가 및 지역번호지", category: "region" },
  { id: "4", label: "영상 및 재생오류", category: "video" },
  { id: "5", label: "그 외 서비스 오류 및 버그", category: "bug" },
  { id: "6", label: "챌린지 라이브 참여 방법", category: "challenge" },
]);
