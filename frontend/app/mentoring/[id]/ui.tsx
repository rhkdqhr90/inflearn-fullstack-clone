"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, TrendingUp, Building2 } from "lucide-react";

interface MentoringDetailUIProps {
  mentoring: any;
}

export function MentoringDetailUI({ mentoring }: MentoringDetailUIProps) {
  const m = mentoring;

  // 섹션 ref
  const introRef = useRef<HTMLDivElement>(null);
  const mentorRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // 신청 여부 상태
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 임시 데이터
  const rating = 5.0;
  const reviewCount = Math.floor(Math.random() * 10) + 1;
  const participantCount = m.applications?.length || 0;

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 신청 여부 확인
  useEffect(() => {
    const checkApplication = async () => {
      try {
        const { getMyApplications } = await import("@/lib/api");
        const { data } = await getMyApplications();

        if (data) {
          const applied = (data as any[]).some(
            (app: any) => app.mentoringId === m.id
          );
          setHasApplied(applied);
        }
      } catch (error) {
        console.error("신청 여부 확인 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkApplication();
  }, [m.id]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* 상단 배너 영역 - body 전체 너비 */}
      <div
        className="border-t border-b"
        style={{
          width: "100vw",
          position: "relative",
          left: "50%",
          marginLeft: "-50vw",
          background:
            "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0f7fa 100%)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-8 py-12 relative">
          {/* 카테고리 네비게이션 */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <Link href="/mentoring" className="hover:text-gray-900">
              멘토링
            </Link>
            <span>/</span>
            <span>기획·경영·마케팅, 데이터 사이언스, AI 기술</span>
          </div>

          {/* 제목 & 정보 - 왼쪽 정렬 */}
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">{m.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ⭐
                  </span>
                ))}
                <span className="font-bold ml-1">({rating.toFixed(1)})</span>
                <span className="text-gray-600">리뷰 {reviewCount}개</span>
              </div>
              <div className="text-gray-600">멘티 {participantCount}명</div>
            </div>

            {/* 기술스택 */}
            <div className="flex flex-wrap gap-2">
              {m.skills?.map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                >
                  # {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* 우측 카드 - absolute로 배너 위에 배치 */}
          <div
            className="absolute right-8 top-6"
            style={{ width: "350px", height: "220px" }}
          >
            <div className="space-y-3">
              {/* 멘토 카드 */}
              <Card className="shadow-lg bg-white">
                <CardContent className="p-5">
                  <div className="flex gap-3 mb-4">
                    {/* 아바타 */}
                    <Avatar className="w-20 h-20 flex-shrink-0">
                      <AvatarImage src={m.user?.image} alt={m.name} />
                      <AvatarFallback className="text-2xl bg-green-400">
                        {m.name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* 멘토 정보 */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{m.name}</h3>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-blue-500" />
                          <span>{m.jobRole}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                          <span>{m.experience}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-green-500" />
                          <span>{m.company}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 통계 - 회색 배경 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-around items-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          참여한 멘티
                        </div>
                        <div className="text-xl font-bold">
                          {participantCount}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          멘토링 리뷰
                        </div>
                        <div className="text-xl font-bold">{reviewCount}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          멘토링 평점
                        </div>
                        <div className="text-xl font-bold flex items-center justify-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span>{rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 가격 카드 */}
              <Card className="shadow-lg">
                <CardContent className="p-5">
                  <div className="text-4xl font-bold mb-4">
                    ₩{m.pricePerSession?.toLocaleString()}
                  </div>

                  <div className="space-y-2 mb-5 text-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-base">🕐</span>
                      <span>1시간</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-base">👤</span>
                      <span>1회 최대 1인</span>
                    </div>
                  </div>

                  {/* 신청 버튼 */}
                  <div className="flex gap-2">
                    {isLoading ? (
                      <Button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-600 font-bold py-5 text-base rounded-lg"
                      >
                        로딩 중...
                      </Button>
                    ) : hasApplied ? (
                      <Button
                        disabled
                        className="flex-1 bg-gray-400 text-white font-bold py-5 text-base rounded-lg"
                      >
                        신청 완료
                      </Button>
                    ) : (
                      <Link
                        href={`/mentoring/${m.id}/apply`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-[#1dc078] hover:bg-[#1ab06a] text-white font-bold py-5 text-base rounded-lg">
                          멘토링 신청하기
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-14 h-10 rounded-lg"
                    >
                      <span className="text-xl">🔗</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 본문 (2/3) */}
            <div className="lg:col-span-2">
              {/* 네비게이션 탭 */}
              <div className="flex gap-8 border-b mb-8 sticky top-16 bg-white z-10 pb-4">
                <button
                  onClick={() => scrollToSection(introRef)}
                  className="font-semibold text-gray-700 hover:text-[#1dc078] transition-colors"
                >
                  멘토링 소개
                </button>
                <button
                  onClick={() => scrollToSection(mentorRef)}
                  className="font-semibold text-gray-700 hover:text-[#1dc078] transition-colors"
                >
                  멘토 정보
                </button>
                <button
                  onClick={() => scrollToSection(reviewsRef)}
                  className="font-semibold text-gray-700 hover:text-[#1dc078] transition-colors flex items-center gap-1"
                >
                  멘토링 리뷰
                  <span className="w-2 h-2 bg-[#1dc078] rounded-full"></span>
                </button>
              </div>

              {/* 멘토링 소개 */}
              <div ref={introRef} className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6">멘토링 소개</h2>
                {m.description ? (
                  <div
                    className="prose max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: m.description }}
                  />
                ) : (
                  <p className="text-gray-600">멘토링 소개가 없습니다.</p>
                )}
              </div>

              <div className="border-t my-12"></div>

              {/* 멘토 정보 */}
              <div ref={mentorRef} className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6">멘토 정보</h2>
                <div className="flex items-start gap-4 mb-6 p-6 bg-gray-50 rounded-lg">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={m.user?.image} alt={m.name} />
                    <AvatarFallback className="text-xl">
                      {m.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{m.name}</h3>
                    <p className="text-gray-600 mb-1">{m.jobRole}</p>
                    <p className="text-gray-500 text-sm">
                      {m.experience}
                      {m.company && ` · ${m.company}`}
                    </p>
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {m.user?.bio || "멘토 소개가 없습니다."}
                </div>
              </div>

              <div className="border-t my-12"></div>

              {/* 멘토링 리뷰 */}
              <div ref={reviewsRef} className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6">멘토링 리뷰</h2>
                <div className="text-center py-12 text-gray-500">
                  아직 작성된 리뷰가 없습니다.
                </div>
              </div>
            </div>

            {/* 오른쪽: 빈 공간 */}
            <div className="lg:col-span-1"></div>
          </div>
        </div>
      </div>
    </>
  );
}
