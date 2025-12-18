import { getMyMentoring, getMentoringApplications } from "@/lib/api";
import { InstructorMentoringUI } from "./ui";

export default async function InstructorMentoringPage() {
  // SSR: 서버에서 데이터 페칭
  const mentoringResult = await getMyMentoring();

  let applicationsResult: any = { data: null, error: null };
  if (mentoringResult.data) {
    // 타입 단언: OpenAPI 타입과 실제 응답 불일치 해결
    const mentoring = mentoringResult.data as any;
    applicationsResult = await getMentoringApplications(mentoring.id);
  }

  return (
    <InstructorMentoringUI
      initialMentoring={mentoringResult.data}
      initialApplications={applicationsResult.data || []}
    />
  );
}
