"use client";

import { MentoringCard } from "@/components/mentoring/mentoring-card";

interface MentoringListUIProps {
  mentorings: any[];
}

export function MentoringListUI({ mentorings }: MentoringListUIProps) {
  return (
    <div>
      {/* 멘토링 배너 - 인프런 스타일 */}
      <div className="relative bg-gradient-to-br from-emerald-100 via-cyan-50 to-sky-100 overflow-hidden rounded-3xl mt-5">
        {/* 배경 장식 원들 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gray-700 text-lg mb-3">
              업계 선배 혹은 미래의 동료들과 인사이트를 나눠 보세요.
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              더 빨리, 더 멀리 갈 수 있어요.
            </h1>

            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <span className="text-2xl">🌱</span>
                <span className="font-semibold text-gray-700">멘토 지원</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <span className="text-2xl">📋</span>
                <span className="font-semibold text-gray-700">멘토링 찾기</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 & 정렬 */}
      <div className="border-b bg-white sticky top-[64px] z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span>☰</span>
            <span className="font-medium">기술 검색</span>
          </button>

          <select className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700">
            <option>기본순</option>
            <option>인기순</option>
            <option>최신순</option>
            <option>가격 낮은 순</option>
            <option>가격 높은 순</option>
          </select>
        </div>
      </div>

      {/* 멘토링 목록 */}
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {mentorings.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-6">
                <div className="inline-block p-8 bg-white rounded-full shadow-sm">
                  <span className="text-6xl">🔍</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                진행 중인 멘토링이 없습니다
              </h2>
              <p className="text-gray-600">곧 새로운 멘토링이 시작됩니다!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mentorings.map((mentoring) => (
                <MentoringCard key={mentoring.id} mentoring={mentoring} />
              ))}

              {/* 빈 카드 - "누구나 멘토가 될 수 있어요" */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-orange-100 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  누구나 멘토가 될 수 있어요.
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  지식과 경험을 나누고,
                  <br />
                  의미 있는 인사이트를 전해주세요!
                </p>
                <button className="px-6 py-2 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                  멘토 지원하기
                </button>
                <div className="mt-6">
                  <div className="text-6xl opacity-50">🎯</div>
                  <div className="text-sm text-orange-400 font-bold mt-2 -rotate-12">
                    Becoming a Mentor
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
