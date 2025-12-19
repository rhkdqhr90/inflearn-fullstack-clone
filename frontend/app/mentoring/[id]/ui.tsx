"use client";

import { useRef } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MentoringDetailUIProps {
  mentoring: any;
}

export function MentoringDetailUI({ mentoring }: MentoringDetailUIProps) {
  const m = mentoring;

  // 섹션 ref
  const introRef = useRef<HTMLDivElement>(null);
  const mentorRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // 임시 데이터
  const rating = 5.0;
  const reviewCount = Math.floor(Math.random() * 10) + 1;
  const participantCount = m.applications?.length || 0;

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-white">
      {/* 상단 배너 영역 */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-8">
          {/* 카테고리 네비게이션 */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/mentoring" className="hover:text-gray-900">
              멘토링
            </Link>
            <span>/</span>
            <span>기획·경영·마케팅, 데이터 사이언스, AI 기술</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 제목 & 정보 */}
            <div className="lg:col-span-2">
              {/* 제목 */}
              <h1 className="text-3xl font-bold mb-4">{m.title}</h1>

              {/* 별점 & 통계 */}
              <div className="flex items-center gap-4 mb-4">
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

            {/* 오른쪽: 빈 공간 (우측 카드가 sticky로 덮음) */}
            <div className="lg:col-span-1"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 본문 (2/3) */}
          <div className="lg:col-span-2">
            {/* 네비게이션 탭 (앵커 링크) */}
            <div className="flex gap-8 border-b mb-8 sticky top-16 bg-white z-10">
              <button
                onClick={() => scrollToSection(introRef)}
                className="pb-4 font-semibold text-gray-700 hover:text-[#1dc078] transition-colors"
              >
                멘토링 소개
              </button>
              <button
                onClick={() => scrollToSection(mentorRef)}
                className="pb-4 font-semibold text-gray-700 hover:text-[#1dc078] transition-colors"
              >
                멘토 정보
              </button>
              <button
                onClick={() => scrollToSection(reviewsRef)}
                className="pb-4 font-semibold text-gray-700 hover:text-[#1dc078] transition-colors flex items-center gap-1"
              >
                멘토링 리뷰
                <span className="text-[#1dc078] text-xs">●</span>
              </button>
            </div>

            {/* 멘토링 소개 섹션 */}
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

            {/* 구분선 */}
            <div className="border-t my-12"></div>

            {/* 멘토 정보 섹션 */}
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

            {/* 구분선 */}
            <div className="border-t my-12"></div>

            {/* 멘토링 리뷰 섹션 */}
            <div ref={reviewsRef} className="mb-16 scroll-mt-32">
              <h2 className="text-2xl font-bold mb-6">멘토링 리뷰</h2>
              <div className="text-center py-12 text-gray-500">
                아직 작성된 리뷰가 없습니다.
              </div>
            </div>
          </div>

          {/* 오른쪽: 신청 카드 (1/3) - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  {/* 멘토 프로필 */}
                  <div className="text-center mb-6 pb-6 border-b">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage src={m.user?.image} alt={m.name} />
                      <AvatarFallback className="text-2xl">
                        {m.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg mb-1">{m.name}</h3>
                    <p className="text-sm text-gray-600 mb-0.5">{m.jobRole}</p>
                    <p className="text-xs text-gray-500">
                      {m.experience} · {m.company}
                    </p>
                  </div>

                  {/* 통계 */}
                  <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b text-center">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        참여한 멘티
                      </div>
                      <div className="text-xl font-bold">
                        {participantCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        멘토링 리뷰
                      </div>
                      <div className="text-xl font-bold">{reviewCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        멘토링 평점
                      </div>
                      <div className="text-xl font-bold text-yellow-500">
                        ⭐ {rating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-3">
                      ₩{m.pricePerSession?.toLocaleString()}
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <div>• 1시간</div>
                      <div>• 1회 최대 1인</div>
                    </div>
                  </div>

                  {/* 멘토링 일정 */}
                  {m.schedules && m.schedules.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">멘토링 일정</h4>
                      <div className="space-y-2">
                        {m.schedules.map((schedule: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <span className="text-red-500">🗓️</span>
                            <span className="font-medium">
                              {dayNames[schedule.dayOfWeek]}요일{" "}
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 신청 버튼 */}
                  <Button className="w-full bg-[#1dc078] hover:bg-[#1ab06a] text-white font-bold py-6 text-lg rounded-lg">
                    멘토링 신청하기
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
