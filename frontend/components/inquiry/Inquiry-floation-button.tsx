"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function InquiryFloatingButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/channeltalk");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#00c875] hover:bg-[#00b469] text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
      aria-label="문의하기"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="font-medium">문의하기</span>
    </button>
  );
}
