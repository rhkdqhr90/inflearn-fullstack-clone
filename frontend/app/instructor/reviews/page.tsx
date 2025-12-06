import { auth } from "@/auth";
import * as api from "@/lib/api";
import UI from "./ui";

export default async function InstructorReviewsPage() {
  const session = await auth();
  const { data: reviews ,error } = await api.getInstructorReviews();
  if(!session?.user) {
    return <div>로그인 후 이용해주세요</div>;
  }
  if (error) {
   return <div>리뷰를 가져오는데 에러가 발생했습니다</div>;
  }
  return <UI reviews={reviews ?? []} user={session?.user!} />;
}
