import * as api from "@/lib/api";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import UI from "./ui";

export default async function ChallengeManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id: courseId } = await params;

  // 로그인 확인
  if (!session?.user) {
    redirect("/signin");
  }

  // 강의 조회
  const courseResult = await api.getCourseById(courseId);
  if (!courseResult.data || courseResult.error) {
    notFound();
  }

  const course = courseResult.data;

  // 강사 권한 확인
  if (course.instructorId !== session.user.id) {
    redirect("/");
  }

  // 챌린지가 이미 있는지 확인 (challenge가 course에 포함되어 있다고 가정)
  const existingChallenge = (course as any).challenge || null;

  return (
    <UI
      courseId={courseId}
      courseSlug={course.slug}
      courseTitle={course.title}
      existingChallenge={existingChallenge}
    />
  );
}
