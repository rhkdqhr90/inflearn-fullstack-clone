"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface MentoringCardProps {
  mentoring: any;
}

export function MentoringCard({ mentoring }: MentoringCardProps) {
  const m = mentoring;

  // 임시: 랜덤 평점/리뷰 (실제로는 DB에서)
  const rating = 5.0;
  const reviewCount = Math.floor(Math.random() * 10) + 1;
  const participantCount = m.applications?.length || 0;

  return (
    <Link href={`/mentoring/${m.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          {/* 제목 */}
          <h3 className="text-base font-bold mb-3 line-clamp-2 h-10 leading-5">
            {m.title}
          </h3>

          {/* 멘토 정보 */}
          <div className="flex items-start gap-2 mb-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={m.user?.image} alt={m.name} />
              <AvatarFallback>{m.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs">{m.name}</div>
              <div className="text-xs text-gray-600 truncate">{m.jobRole}</div>
              <div className="text-xs text-gray-500 truncate">
                {m.experience}
                {m.company && ` · ${m.company}`}
              </div>
            </div>
          </div>

          {/* 평점 및 인원 */}
          <div className="flex items-center gap-2 text-xs mb-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewCount})</span>
            </div>
            <div className="text-gray-500">👥 {participantCount}명</div>
            <div className="text-gray-500"># {m.skills?.length || 0}개</div>
          </div>

          {/* 기술스택 */}
          <div className="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
            {m.skills?.slice(0, 3).map((skill: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0"
              >
                # {skill}
              </Badge>
            ))}
            {m.skills?.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                +{m.skills.length - 3}
              </Badge>
            )}
          </div>

          {/* 가격 */}
          <div className="text-right">
            <span className="text-lg font-bold text-primary">
              ₩{m.pricePerSession?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">
              ({Math.floor(m.sessionDuration / 60)}시간)
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
