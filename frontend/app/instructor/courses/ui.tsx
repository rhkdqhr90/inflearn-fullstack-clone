"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, X, Trophy, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Course } from "@/generated/openapi-client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UI({ courses }: { courses: Course[] }) {
  const router = useRouter();

  // 챌린지 관리 버튼 렌더링 로직
  const renderChallengeButton = (course: any) => {
    const challenge = course.challenge;

    // 챌린지가 없는 경우 - 생성 가능
    if (!challenge) {
      return (
        <Button
          onClick={() => router.push(`/course/${course.id}/challenge`)}
          variant="secondary"
          size="sm"
        >
          <Trophy className="w-4 h-4 mr-1" /> 챌린지 생성
        </Button>
      );
    }

    // 챌린지 상태별 처리
    const status = challenge.status;
    const isRecruiting = status === "RECRUITING";
    const isOngoing = status === "ONGOING";
    const isCompleted = status === "COMPLETED";

    // 진행중이거나 종료된 챌린지 - 수정/삭제 불가
    if (isOngoing || isCompleted) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  className="w-full"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {isOngoing ? "진행중" : "종료됨"}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isOngoing
                  ? "진행 중인 챌린지는 수정/삭제할 수 없습니다"
                  : "종료된 챌린지는 수정/삭제할 수 없습니다"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // 모집중인 챌린지 - 수정/삭제 가능
    if (isRecruiting) {
      return (
        <Button
          onClick={() => router.push(`/course/${course.id}/challenge`)}
          variant="secondary"
          size="sm"
        >
          <Trophy className="w-4 h-4 mr-1" /> 챌린지 수정
        </Button>
      );
    }

    // 기타 상태 - 기본 관리 버튼
    return (
      <Button
        onClick={() => router.push(`/course/${course.id}/challenge`)}
        variant="secondary"
        size="sm"
      >
        <Trophy className="w-4 h-4 mr-1" /> 챌린지 관리
      </Button>
    );
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-6">강의 관리</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이미지</TableHead>
            <TableHead>강의명</TableHead>
            <TableHead>평점</TableHead>
            <TableHead>총 수강생</TableHead>
            <TableHead>질문</TableHead>
            <TableHead>가격 (할인가)</TableHead>
            <TableHead>총 수입</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses && courses.length > 0 ? (
            courses.map((course: Course) => {
              const avgRating = 0;
              const totalStudents = 0;
              const totalQuestions = 0;
              const price = course.price;
              const discountPrice = course.discountPrice;
              const totalRevenue = 0;
              const status =
                course.status === "PUBLISHED" ? "게시중" : "임시저장";
              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <Image
                      src={
                        course.thumbnailUrl ||
                        "/images/inflearn_public_logo.svg"
                      }
                      alt={course.title}
                      width={80}
                      height={80}
                      className="rounded bg-white border object-contain"
                    />
                  </TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{avgRating}</TableCell>
                  <TableCell>{totalStudents}</TableCell>
                  <TableCell>{totalQuestions}</TableCell>
                  <TableCell>
                    {discountPrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          ₩{price.toLocaleString()}
                        </span>
                        <span className="text-green-700 font-bold">
                          ₩{discountPrice.toLocaleString()}
                        </span>
                      </>
                    ) : price ? (
                      `₩${price.toLocaleString()}`
                    ) : (
                      "미설정"
                    )}
                  </TableCell>
                  <TableCell>₩{totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell className="flex flex-col gap-2 justify-center h-full">
                    <Button
                      onClick={() => {
                        const confirmed =
                          window.confirm("정말 삭제하시겠습니까?");
                        console.log(confirmed);
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-1" /> 강의 삭제
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(`/course/${course.id}/edit/course_info`)
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Pencil className="w-4 h-4 mr-1" /> 강의 수정
                    </Button>
                    {renderChallengeButton(course)}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-gray-400">
                강의가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
