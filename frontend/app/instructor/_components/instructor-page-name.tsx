"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyMentoring, toggleActive } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InstructorPageName() {
  const pathname = usePathname();
  const router = useRouter();
  const [title, setTitle] = useState(" ");
  const [mentoring, setMentoring] = useState<any>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    switch (pathname) {
      case "/instructor":
        setTitle("대시보드");
        break;
      case "/instructor/courses":
        setTitle("강의 관리");
        break;
      case "/instructor/questions":
        setTitle("질문 관리");
        break;
      case "/instructor/mentoring":
        setTitle("멘토링 관리");
        // 멘토링 데이터 자동 페칭
        fetchMentoring();
        break;
      default:
        setTitle("대시보드");
    }

    // ✅ 리페치 이벤트 리스너 등록 (생성 성공 시에만)
    const handleRefetch = (e: any) => {
      if (pathname === "/instructor/mentoring") {
        console.log("🔄 멘토링 데이터 리페치");
        fetchMentoring();
      }
    };

    window.addEventListener("mentoring-refetch", handleRefetch);

    return () => {
      window.removeEventListener("mentoring-refetch", handleRefetch);
    };
  }, [pathname]);

  const fetchMentoring = async () => {
    try {
      const result = await getMyMentoring();
      console.log("📦 API 응답:", result);

      if (
        result.data &&
        typeof result.data === "object" &&
        "id" in result.data
      ) {
        console.log("✅ 멘토링 데이터:", result.data);
        setMentoring(result.data);
      } else {
        console.log("❌ 멘토링 없음");
        setMentoring(null);
      }
    } catch (error) {
      console.error("❌ 멘토링 조회 에러:", error);
      setMentoring(null);
    }
  };

  const handleToggle = async (checked: boolean) => {
    console.log("🔥 handleToggle called:", { checked, mentoring });

    if (!mentoring) {
      if (checked) {
        console.log("🎯 토글 ON - 이벤트 발생");
        toast.info("아래에서 멘토링 정보를 입력해주세요.");
        // 생성 폼을 보여주기 위해 이벤트 발생
        window.dispatchEvent(
          new CustomEvent("mentoring-create-toggle", { detail: checked })
        );
        console.log("✅ 이벤트 발생 완료");
      } else {
        // 토글 OFF로 돌리면 폼 닫기
        window.dispatchEvent(
          new CustomEvent("mentoring-create-toggle", { detail: false })
        );
      }
      return;
    }

    setIsToggling(true);
    const result = await toggleActive(mentoring.id);

    if (result.error) {
      const error = result.error as any;
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "멘토링 상태 변경에 실패했습니다.";
      toast.error(errorMessage);
    } else {
      const updatedMentoring = result.data as any;
      toast.success(
        updatedMentoring?.isActive
          ? "멘토링 신청 받기가 시작되었습니다."
          : "멘토링 신청 받기가 중단되었습니다."
      );
      setMentoring(result.data);
      router.refresh();
    }
    setIsToggling(false);
  };

  const handleMentoringAction = (action: "setting" | "delete") => {
    // 이벤트 발생으로 ui.tsx에 알림
    window.dispatchEvent(
      new CustomEvent("mentoring-action", { detail: action })
    );
  };

  const isMentoringPage = pathname === "/instructor/mentoring";
  const m = mentoring as any;

  return (
    <div className="w-full bg-gray-700">
      <div className="max-w-6xl mx-auto text-white py-4 px-8">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 타이틀 + 토글 (멘토링 페이지일 때만) */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{title}</h1>

            {isMentoringPage && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!(mentoring && m?.isActive)}
                  onCheckedChange={handleToggle}
                  disabled={isToggling}
                  className="data-[state=checked]:bg-green-500"
                />
                <Badge
                  variant={mentoring && m?.isActive ? "default" : "secondary"}
                  className={
                    mentoring && m?.isActive
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                >
                  {mentoring && m?.isActive ? "ON" : "OFF"}
                </Badge>
              </div>
            )}
          </div>

          {/* 오른쪽: 액션 버튼들 (멘토링 페이지 + 멘토링 있을 때만) */}
          {isMentoringPage && mentoring && mentoring.id && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-600"
                onClick={() => handleMentoringAction("setting")}
              >
                멘토링 설정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-600"
                onClick={() => handleMentoringAction("delete")}
              >
                삭제
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
