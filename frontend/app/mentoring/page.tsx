import { getAllMentoring } from "@/lib/api";
import { MentoringListUI } from "./ui";

export default async function MentoringPage() {
  const result = await getAllMentoring();
  const mentorings = (result.data as any[]) || [];

  return <MentoringListUI mentorings={mentorings} />;
}
