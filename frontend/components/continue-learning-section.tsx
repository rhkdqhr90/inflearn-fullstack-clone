import * as api from "@/lib/api";
import { auth } from "@/auth";
import Link from "next/link";
import { ChevronRight, ChevronUp } from "lucide-react";

export default async function ContinueLearningSection() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }
  console.log(session.user);

  const { data: courses } = await api.getAllMyCourses();

  if (!courses || courses.length === 0) {
    return null;
  }

  const recentCourses = courses.slice(0, 4);

  return (
    <section className="mb-8">
      {/* 전체 회색 박스 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        {/* 제목 + 접기 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-[8px]">●</span>
            </div>
            <h2 className="text-xs font-medium text-black">
              {session.user.name}님의 이어서 학습하기
            </h2>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>

        {/* 박스들 */}
        <div className="flex gap-3">
          {/* 내 학습 박스 */}
          <div className="flex-shrink-0 w-20 h-16 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </div>
            <span className="text-[10px] text-gray-700">내 학습</span>
          </div>

          {/* 강의 카드들 */}
          {recentCourses.map((course: any) => (
            <Link
              key={course.id}
              href={`/courses/lecture?courseId=${course.id}`}
              className="flex-1 min-w-0 h-16 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-3 flex flex-col justify-center"
            >
              <h3 className="text-xs font-medium text-black mb-1 line-clamp-1 leading-tight">
                {course.title}
              </h3>
              <div className="text-[10px] text-gray-600">
                {course.completedLectures}/{course.totalLectures} (
                {course.progress.toFixed(2)}%) ·{" "}
                {getTimeAgo(course.lastWatchedAt)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "방금 전 학습";
  if (diffMins < 60) return `${diffMins}분 전 학습`;
  if (diffHours < 24) return `${diffHours}시간 전 학습`;
  if (diffDays < 30) return `${diffDays}일 전 학습`;
  return "오래 전 학습";
}
