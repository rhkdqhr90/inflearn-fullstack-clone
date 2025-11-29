import * as api from "@/lib/api";
import { notFound } from "next/navigation";
import UI from "./ui";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "강좌 커버 이미지 편집 - 인프런",
  description: "인프런 강조 ㅏ커버 이미지 편집 페이지입니다.",
};
export default async function EditCourseCoverImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await api.getCourseById(id);
  if (!course.data) {
    notFound();
  }
  return <UI course={course.data} />;
}
