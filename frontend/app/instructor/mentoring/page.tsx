import { getMyMentoring, getMentoringApplications } from "@/lib/api";
import { InstructorMentoringUI } from "./ui";

export default async function InstructorMentoringPage() {
  const mentoringResult = await getMyMentoring();
  console.log("📦 page.tsx mentoringResult:", mentoringResult);

  const mentoring = mentoringResult.data as any;
  console.log("🔍 page.tsx mentoring:", mentoring);
  console.log("🔍 mentoring type:", typeof mentoring);
  console.log("🔍 mentoring truthy:", !!mentoring);

  // 멘토링이 있을 때만 신청자 조회
  let applications: any[] = [];
  if (
    mentoring &&
    typeof mentoring === "object" &&
    "id" in mentoring &&
    mentoring.id
  ) {
    const applicationsResult = await getMentoringApplications(
      mentoring.id as string
    );
    applications = (applicationsResult.data as any[]) || [];
  }

  const finalMentoring =
    mentoring && typeof mentoring === "object" && "id" in mentoring
      ? mentoring
      : null;
  console.log("✅ page.tsx finalMentoring:", finalMentoring);

  return (
    <InstructorMentoringUI
      initialMentoring={finalMentoring}
      initialApplications={applications}
    />
  );
}
