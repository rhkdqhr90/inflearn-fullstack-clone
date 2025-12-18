"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, Plus, Link as LinkIcon, Heart } from "lucide-react";
import { joinChallenge } from "@/lib/api";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getFavorite, addFavorite, removeFavorite } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { User } from "next-auth";
import { ChallengeResponseDto } from "@/generated/openapi-client";

interface ChallengeDetailUIProps {
  challenge: ChallengeResponseDto;
  user?: User;
}

export default function ChallengeDetailUI({
  challenge,
  user,
}: ChallengeDetailUIProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<"intro" | "curriculum" | "review">(
    "intro"
  );
  const [showShareDialog, setShowShareDialog] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: "intro" | "curriculum" | "review") => {
    setActiveTab(section);
    const refs = {
      intro: introRef,
      curriculum: curriculumRef,
      review: reviewRef,
    };
    refs[section].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (!challenge.course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">
          챌린지 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const course = challenge.course as any;

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "yyyy. MM. dd.");
  };

  const now = new Date();
  const recruitStart = new Date(challenge.recruitStartAt);
  const recruitEnd = new Date(challenge.recruitEndAt);

  const isBeforeRecruit = now < recruitStart;
  const isRecruiting =
    now >= recruitStart &&
    now <= recruitEnd &&
    challenge.status === "RECRUITING";
  const isFull = challenge.currentParticipants >= challenge.maxParticipants;

  const daysLeft = Math.ceil(
    (recruitEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleJoinChallenge = useCallback(async () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      router.push("/signin");
      return;
    }

    if (!isRecruiting || isFull) {
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinChallenge(course.slug);
      const response = result.data as any;

      if (result.error) {
        toast.error(
          (result.error as any).message || "챌린지 신청에 실패했습니다."
        );
        return;
      }

      if (response.message) {
        toast.success(response.message);
        if (response.redirect) {
          router.push(response.redirect);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("챌린지 신청 중 오류가 발생했습니다.");
    } finally {
      setIsJoining(false);
    }
  }, [user, course.slug, isRecruiting, isFull, router]);

  const discountRate =
    course.discountPrice && course.price > 0
      ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
      : 0;

  const getFavoriteQuery = useQuery({
    queryKey: ["favorite", course.id],
    queryFn: () => getFavorite(course.id),
  });

  const addFavoriteMutation = useMutation({
    mutationFn: () => addFavorite(course.id),
    onSuccess: () => {
      getFavoriteQuery.refetch();
      toast.success("찜 목록에 추가되었습니다.");
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: () => removeFavorite(course.id),
    onSuccess: () => {
      getFavoriteQuery.refetch();
      toast.success("찜 목록에서 제거되었습니다.");
    },
  });

  const handleFavorite = useCallback(() => {
    if (!user) {
      toast.error("로그인 후 이용해주세요.");
      router.push("/signin");
      return;
    }

    if (getFavoriteQuery.data?.data?.isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  }, [
    user,
    getFavoriteQuery.data,
    addFavoriteMutation,
    removeFavoriteMutation,
    router,
  ]);

  const isFavoriteDisabled =
    addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 클립보드에 복사되었습니다!"); // Dialog 대신 Toast
    } catch (error) {
      toast.error("URL 복사에 실패했습니다.");
    }
  }, []);

  return (
    <div>
      {/* 헤더 - 그라데이션 배경 (전체 너비) */}
      <div
        className="bg-gradient-to-b from-teal-50 via-blue-50 to-white border-b"
        style={{
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
        }}
      >
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 강의 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 상단 레이블 */}
              <div className="flex items-center gap-3">
                <span className="text-teal-600 font-semibold">Challenge</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500">모집 중</span>
              </div>

              {/* 제목 */}
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                {course.title}
              </h1>

              {/* 설명 */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {course.shortDescription}
              </p>

              {/* 강사 정보 */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm text-gray-500">슈크림마을 노슈니</span>
                {course.instructor?.name && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500">
                      지식공유자: {course.instructor.name}
                    </span>
                  </>
                )}
              </div>

              {/* 태그 */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white border border-gray-200"
                >
                  Notion
                </Badge>
              </div>
            </div>

            {/* 오른쪽: 썸네일 */}
            <div className="lg:col-span-1">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border-4 border-white">
                <Image
                  src={
                    course.thumbnailUrl || "/images/inflearn_public_logo.svg"
                  }
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 */}
      <div
        className="border-b border-gray-200 mb-10"
        style={{
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
        }}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* 왼쪽: 설명 */}
            <div className="lg:col-span-2 space-y-6 pt-8">
              {/* 강의 소개 탭 */}
              <div className="border-b border-gray-200 mb-10">
                <nav className="flex gap-8 -mb-px">
                  <button
                    onClick={() => scrollToSection("intro")}
                    className={`pb-4 border-b-2 cursor-pointer hover:border-gray-400 ${
                      activeTab === "intro"
                        ? "border-gray-900 font-bold text-gray-900"
                        : "border-transparent font-medium text-gray-500 hover:text-gray-700"
                    } text-base transition-colors`}
                  >
                    강의 소개
                  </button>
                  <button
                    onClick={() => scrollToSection("curriculum")}
                    className={`pb-4 border-b-2 cursor-pointer hover:border-gray-400 ${
                      activeTab === "curriculum"
                        ? "border-gray-900 font-bold text-gray-900"
                        : "border-transparent font-medium text-gray-500 hover:text-gray-700"
                    } text-base transition-colors`}
                  >
                    커리큘럼
                  </button>
                  <button
                    onClick={() => scrollToSection("review")}
                    className={`pb-4 border-b-2 cursor-pointer hover:border-gray-400${
                      activeTab === "review"
                        ? "border-gray-900 font-bold text-gray-900"
                        : "border-transparent font-medium text-gray-500 hover:text-gray-700"
                    } text-base transition-colors`}
                  >
                    수강평
                  </button>
                </nav>
              </div>

              {/* 챌린지 설명 */}
              <div ref={introRef}>
                {(challenge as any).description && (
                  <div className="bg-white rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">챌린지 소개</h2>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: (challenge as any).description,
                      }}
                    />
                  </div>
                )}
              </div>
              {/* 강의 설명 */}

              {course.description && (
                <div className="bg-white rounded-lg p-6 ">
                  <h2 className="text-2xl font-bold mb-4">강의 소개</h2>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </div>
              )}
              {/* 커리큘럼 섹션 */}
              <div ref={curriculumRef}>
                {course.sections && course.sections.length > 0 && (
                  <div className="bg-white rounded-lg p-6 ">
                    <h2 className="text-2xl font-bold mb-6">커리큘럼</h2>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {course.sections.map(
                        (section: any, sectionIdx: number) => (
                          <div
                            key={section.id}
                            className={sectionIdx > 0 ? "border-t" : ""}
                          >
                            <div className="bg-gray-50 px-5 py-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">
                                  {section.title}
                                </h3>
                                <span className="text-sm text-gray-600">
                                  {section.lectures?.length || 0}개 강의
                                </span>
                              </div>
                            </div>
                            {section.lectures &&
                              section.lectures.length > 0 && (
                                <div className="bg-white">
                                  {section.lectures
                                    .sort((a: any, b: any) => a.order - b.order)
                                    .map((lecture: any, lectureIdx: number) => (
                                      <div
                                        key={lecture.id}
                                        className={`flex items-center justify-between px-5 py-3 ${
                                          lectureIdx <
                                          section.lectures.length - 1
                                            ? "border-b border-gray-100"
                                            : ""
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          {lecture.isPreview ? (
                                            <svg
                                              className="w-4 h-4 text-green-600"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                              />
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                              />
                                            </svg>
                                          ) : (
                                            <svg
                                              className="w-4 h-4 text-gray-400"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                              />
                                            </svg>
                                          )}
                                          <span className="text-sm">
                                            {lecture.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          {lecture.isPreview && (
                                            <button className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 font-semibold rounded hover:border-gray-400 transition-colors">
                                              미리보기
                                            </button>
                                          )}
                                          <span className="text-sm text-gray-600">
                                            {Math.floor(
                                              (lecture.duration || 0) / 60
                                            )}
                                            :
                                            {String(
                                              Math.floor(
                                                (lecture.duration || 0) % 60
                                              )
                                            ).padStart(2, "0")}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* 수강평 섹션 (추후 구현) */}
              <div ref={reviewRef}>
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">수강평</h2>
                  <p className="text-gray-500 text-center py-8">
                    아직 등록된 수강평이 없습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 신청 영역 */}
            <div className="lg:col-span-1 space-y-4">
              {/* 카드 1: 모집 정보 (헤더와 겹침) */}
              <div className="bg-white rounded-lg shadow-lg -mt-20">
                <div className="grid grid-cols-2">
                  <div className="text-center py-4 border-r">
                    <div className="text-sm text-gray-500 mb-1">모집 인원</div>
                    <div className="text-2xl font-bold">
                      {challenge.maxParticipants}명
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500 mb-1">
                      모집 마감까지
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      {isRecruiting ? `${daysLeft}일 남았어요` : "모집 종료"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 카드 2: 메인 신청 카드 */}
              <div className="bg-white rounded-lg shadow-lg sticky top-24">
                <div className="p-6 space-y-4">
                  {/* 얼리버드 할인 배너 */}
                  {isRecruiting && (
                    <div className="bg-red-500 text-white text-center py-3 rounded-lg font-bold">
                      얼리버드 할인 중 ({daysLeft}일 남음)
                    </div>
                  )}

                  {/* 4. 가격 정보 */}
                  {course.price > 0 && (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        월 ₩
                        {Math.floor(
                          (course.discountPrice || course.price) / 5
                        ).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold text-xl">
                          {discountRate}%
                        </span>
                        {discountRate > 0 && (
                          <span className="line-through text-gray-400">
                            ₩{course.price.toLocaleString()}
                          </span>
                        )}
                        <span className="font-bold">
                          ₩
                          {(
                            course.discountPrice || course.price
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">5개월 할부 시</div>
                    </div>
                  )}

                  {/* 5. 수강 바구니로 이동 버튼 */}
                  <Button
                    className="w-full h-12 text-base font-semibold bg-teal-500 hover:bg-teal-600"
                    size="lg"
                    onClick={handleJoinChallenge}
                    disabled={
                      !user ||
                      isBeforeRecruit ||
                      !isRecruiting ||
                      isFull ||
                      isJoining
                    }
                  >
                    {!user
                      ? "로그인 후 신청하기"
                      : isBeforeRecruit
                      ? "모집 시작 전입니다"
                      : isFull
                      ? "모집이 마감되었습니다"
                      : !isRecruiting
                      ? "모집이 종료되었습니다"
                      : isJoining
                      ? "처리 중..."
                      : "수강 바구니로 이동 →"}
                  </Button>

                  {/* 6. 선물조르기/보내기, 공유, 좋아요 */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Gift className="w-5 h-5" />
                      <span>선물 조르기 / 보내기</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Plus className="w-5 h-5" />
                      </button>

                      {/* 공유 버튼 */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleShare();
                        }}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        aria-label="공유하기"
                      >
                        <LinkIcon className="w-5 h-5" />
                      </button>

                      {/* 좋아요 버튼 */}
                      <button
                        onClick={handleFavorite}
                        disabled={isFavoriteDisabled}
                        className={cn(
                          "p-2 rounded transition-colors",
                          getFavoriteQuery.data?.data?.isFavorite
                            ? "bg-red-50 hover:bg-red-100"
                            : "hover:bg-gray-100",
                          isFavoriteDisabled && "cursor-not-allowed opacity-50"
                        )}
                        aria-label="좋아요"
                      >
                        <Heart
                          className={cn(
                            "w-5 h-5 transition-all",
                            getFavoriteQuery.data?.data?.isFavorite
                              ? "fill-red-500 text-red-500"
                              : "text-gray-700"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* 7. 상세 정보 */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">지식공유자</span>
                      <span className="font-bold">슈크림마을 노슈니</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">커리큘럼</span>
                        <Badge
                          variant="secondary"
                          className="rounded-full w-5 h-5 text-xs p-0 flex items-center justify-center"
                        >
                          1
                        </Badge>
                      </div>
                      <span className="font-medium">수업 32개, 미션 14개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">난이도</span>
                      <span className="font-medium">
                        입문 - 초급 - 중급이상
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">모집 일정</span>
                      <span className="font-medium">
                        {formatDate(challenge.recruitStartAt)} ~{" "}
                        {formatDate(challenge.recruitEndAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">챌린지 일정</span>
                      <span className="font-medium">
                        {formatDate(challenge.challengeStartAt)} ~{" "}
                        {formatDate(challenge.challengeEndAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">복습 기한</span>
                      <span className="font-medium">무제한</span>
                    </div>
                  </div>

                  {/* 8. 하단 안내 배너 */}
                  <div className="bg-green-50 text-center py-3 rounded-lg text-sm text-green-700">
                    지식공유자 답변이 제공되는 강의입니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
