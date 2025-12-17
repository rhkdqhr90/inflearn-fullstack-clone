import { ChallengeCard } from "./challenge-card";

interface ChallengeListProps {
  challenges: Array<{
    id: string;
    courseId: string;
    maxParticipants: number;
    currentParticipants: number;
    recruitStartAt: string | Date;
    recruitEndAt: string | Date;
    challengeStartAt: string | Date;
    challengeEndAt: string | Date;
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
  }>;
}

export function ChallengeList({ challenges }: ChallengeListProps) {
  if (!challenges || challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-lg">
          진행 중인 챌린지가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}
