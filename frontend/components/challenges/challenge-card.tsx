import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ChallengeCardProps {
  challenge: {
    id: string;
    courseId: string;
    maxParticipants: number;
    currentParticipants: number;
    status: string;
    course: {
      slug: string;
      title: string;
      thumbnailUrl?: string;
      price: number;
      discountPrice?: number;
      categories?: Array<{
        name: string;
      }>;
      instructor: {
        id: string;
        name: string;
        image?: string;
      };
    };
    _count?: {
      participants: number;
    };
  };
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const course = challenge.course;

  // 할인율 계산
  const discountRate =
    course.discountPrice && course.price > 0
      ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
      : 0;

  return (
    <Link href={`/challenges/${course.slug}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200">
        {/* 썸네일 - 위쪽 둥글게, 간격 없이 딱 맞게 */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <Image
            src={course.thumbnailUrl || "/images/inflearn_public_logo.svg"}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* 컨텐츠 */}
        <div className="p-3">
          {/* 카테고리 + 할인율 */}
          <div className="flex items-center gap-1.5 mb-2">
            {course.categories && course.categories.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                {course.categories[0].name}
              </span>
            )}
            {discountRate > 0 && (
              <Badge
                variant="destructive"
                className="text-[10px] font-bold px-1.5 py-0.5 h-auto"
              >
                {discountRate}% 할인 중
              </Badge>
            )}
          </div>

          {/* 제목 */}
          <h3 className="font-bold text-sm line-clamp-2 mb-2 leading-tight">
            {course.title}
          </h3>

          {/* 강사 이름 */}
          {course.instructor?.name && (
            <p className="text-xs text-gray-500">{course.instructor.name}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
