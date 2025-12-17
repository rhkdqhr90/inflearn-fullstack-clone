"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChallengeForm } from "@/components/challenges/challenge-form";
import { Button } from "@/components/ui/button";
import {
  createCourseChallenge,
  updateCourseChallenge,
  deleteCourseChallenge,
} from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface ChallengeManageUIProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  existingChallenge: {
    id: string;
    maxParticipants: number;
    recruitStartAt: string;
    recruitEndAt: string;
    challengeStartAt: string;
    challengeEndAt: string;
    description?: string;
  } | null;
}

export default function UI({
  courseId,
  courseSlug,
  courseTitle,
  existingChallenge,
}: ChallengeManageUIProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // datetime-local 형식으로 변환 (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        maxParticipants: values.maxParticipants,
        recruitStartAt: new Date(values.recruitStartAt).toISOString(),
        recruitEndAt: new Date(values.recruitEndAt).toISOString(),
        challengeStartAt: new Date(values.challengeStartAt).toISOString(),
        challengeEndAt: new Date(values.challengeEndAt).toISOString(),
        description: values.description,
      };

      let result;
      if (existingChallenge) {
        // 수정
        result = await updateCourseChallenge(courseId, payload);
      } else {
        // 생성
        result = await createCourseChallenge(courseId, payload);
      }

      if (result.error) {
        toast.error(
          (result.error as any).message || "챌린지 저장에 실패했습니다"
        );
        return;
      }

      toast.success(
        existingChallenge
          ? "챌린지가 수정되었습니다"
          : "챌린지가 생성되었습니다"
      );

      router.push(`/challenges/${courseSlug}`);
    } catch (error) {
      console.error("챌린지 저장 에러:", error);
      toast.error("챌린지 저장 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteCourseChallenge(courseId);

      if (result.error) {
        toast.error(
          (result.error as any).message || "챌린지 삭제에 실패했습니다"
        );
        return;
      }

      toast.success("챌린지가 삭제되었습니다");

      router.push("/instructor/courses");
    } catch (error) {
      console.error("챌린지 삭제 에러:", error);
      toast.error("챌린지 삭제 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 헤더 */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          {existingChallenge ? "챌린지 수정" : "챌린지 생성"}
        </h1>
        <p className="text-muted-foreground">{courseTitle}</p>
      </div>

      {/* 폼 */}
      <div className="bg-white rounded-lg border p-6">
        <ChallengeForm
          defaultValues={
            existingChallenge
              ? {
                  maxParticipants: existingChallenge.maxParticipants,
                  recruitStartAt: formatDateTimeLocal(
                    existingChallenge.recruitStartAt
                  ),
                  recruitEndAt: formatDateTimeLocal(
                    existingChallenge.recruitEndAt
                  ),
                  challengeStartAt: formatDateTimeLocal(
                    existingChallenge.challengeStartAt
                  ),
                  challengeEndAt: formatDateTimeLocal(
                    existingChallenge.challengeEndAt
                  ),
                  description: existingChallenge.description,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onDelete={existingChallenge ? handleDelete : undefined}
          isSubmitting={isSubmitting}
          submitLabel={existingChallenge ? "수정하기" : "생성하기"}
          showDeleteButton={!!existingChallenge}
        />
      </div>
    </div>
  );
}
