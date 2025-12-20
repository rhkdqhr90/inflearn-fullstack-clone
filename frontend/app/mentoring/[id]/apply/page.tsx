import { getAllMentoring } from "@/lib/api";
import { MentoringApplyUI } from "./ui";
import { notFound } from "next/navigation";

interface MentoringApplyPageProps {
  params: {
    id: string;
  };
}

export default async function MentoringApplyPage({
  params,
}: MentoringApplyPageProps) {
  // 전체 멘토링 조회 후 필터링 (임시)
  const result = await getAllMentoring();
  const mentorings = (result.data as any[]) || [];
  const mentoring = mentorings.find((m) => m.id === params.id);

  if (!mentoring) {
    notFound();
  }

  return <MentoringApplyUI mentoring={mentoring} />;
}
