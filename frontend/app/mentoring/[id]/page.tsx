import { getAllMentoring } from "@/lib/api";
import { MentoringDetailUI } from "./ui";
import { notFound } from "next/navigation";

interface MentoringDetailPageProps {
  params: {
    id: string;
  };
}

export default async function MentoringDetailPage({
  params,
}: MentoringDetailPageProps) {
  // 전체 멘토링 조회 후 필터링 (임시)
  const result = await getAllMentoring();
  const mentorings = (result.data as any[]) || [];
  const mentoring = mentorings.find((m) => m.id === params.id);

  if (!mentoring) {
    notFound();
  }

  return <MentoringDetailUI mentoring={mentoring} />;
}
