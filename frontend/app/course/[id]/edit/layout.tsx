import * as api from "@/lib/api";
import EditCourseHeader from "./_components/edit-course-header";
import { notFound } from "next/navigation";
import EditCourseSidebar from "./_components/edit-course-sidbar";

export default async function EditCouresLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await api.getCourseById(id);

  if (course.error || !course.data) {
    notFound();
  }

  return (
    <div className="w-full h-full bg-[#F1F3F5]">
      <EditCourseHeader course={course.data}></EditCourseHeader>
      <div className="flex min-h-screen  p-12 gap-12 max-w-5xl">
        <EditCourseSidebar></EditCourseSidebar>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
