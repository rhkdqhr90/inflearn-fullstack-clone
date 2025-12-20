"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface MentoringApplyUIProps {
  mentoring: any;
}

export function MentoringApplyUI({ mentoring }: MentoringApplyUIProps) {
  const router = useRouter();
  const m = mentoring;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    scheduleId: "",
    message: "",
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("필수 정보를 입력해주세요.");
      return;
    }

    if (!formData.scheduleId) {
      toast.error("희망 일정을 선택해주세요.");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("이용약관에 동의해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("=== 신청 시작 ===");
      console.log("멘토링 ID:", m.id);
      console.log("폼 데이터:", formData);

      // 실제 신청 API 호출
      const { applyForMentoring } = await import("@/lib/api");

      // 선택한 스케줄 정보 가져오기
      const selectedSchedule = m.schedules?.find(
        (s: any) =>
          (s.id || `${m.schedules.indexOf(s)}`) === formData.scheduleId
      );

      console.log("선택한 스케줄:", selectedSchedule);

      // 다음 해당 요일의 날짜 계산
      const getNextDateForDay = (dayOfWeek: number) => {
        const today = new Date();
        const currentDay = today.getDay();
        const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntilTarget);

        // 시간 설정
        if (selectedSchedule?.startTime) {
          const [hours, minutes] = selectedSchedule.startTime.split(":");
          targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        return targetDate;
      };

      const scheduledDate = selectedSchedule
        ? getNextDateForDay(selectedSchedule.dayOfWeek)
        : new Date();

      const applicationData = {
        scheduledDate: scheduledDate.toISOString(),
        phoneNumber: formData.phone,
        email: formData.email,
        message: formData.message || "",
      };

      console.log("신청 데이터:", applicationData);

      const { data, error } = await applyForMentoring(m.id, applicationData);

      console.log("API 응답 - data:", data);
      console.log("API 응답 - error:", error);

      if (error) {
        console.error("API 에러 상세:", error);
        toast.error(`신청 중 오류가 발생했습니다: ${JSON.stringify(error)}`);
        setIsSubmitting(false);
        return;
      }

      toast.success("멘토링 신청이 완료되었습니다!");
      router.push(`/mentoring/${m.id}`);
    } catch (error) {
      console.error("신청 오류 (catch):", error);
      toast.error(`신청 중 오류가 발생했습니다: ${error}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[800px] mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <Link
          href={`/mentoring/${m.id}`}
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>뒤로가기</span>
        </Link>

        <h1 className="text-3xl font-bold mb-8">멘토링 신청</h1>

        {/* 멘토링 정보 요약 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={m.user?.image} alt={m.name} />
                <AvatarFallback>{m.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{m.title}</h2>
                <div className="text-sm text-gray-600 mb-2">
                  멘토: {m.name} · {m.jobRole}
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₩{m.pricePerSession?.toLocaleString()}
                  <span className="text-sm text-gray-600 font-normal ml-2">
                    / 1시간
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 신청 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 신청자 정보 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>신청자 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">
                  이름 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="홍길동"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">
                  이메일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  연락처 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="010-1234-5678"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 일정 선택 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>희망 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="schedule">
                일정 선택 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.scheduleId}
                onValueChange={(value) =>
                  setFormData({ ...formData, scheduleId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="일정을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {m.schedules?.map((schedule: any, index: number) => (
                    <SelectItem
                      key={schedule.id || index}
                      value={schedule.id || `${index}`}
                    >
                      {dayNames[schedule.dayOfWeek]}요일 {schedule.startTime} -{" "}
                      {schedule.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 신청 사유 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>신청 사유 / 질문사항</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="멘토링을 신청하는 이유나 궁금한 점을 자유롭게 작성해주세요."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* 약관 동의 */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeTerms: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="terms" className="cursor-pointer">
                    <span className="text-red-500">*</span> 멘토링 이용약관 및
                    개인정보 처리방침에 동의합니다.
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    멘토링 신청 시 입력한 정보는 멘토에게 전달되며, 멘토링 진행
                    목적으로만 사용됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신청 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1dc078] hover:bg-[#1ab06a] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "신청 중..." : "신청하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
