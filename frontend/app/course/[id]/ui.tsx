"use client";

import {
  CourseDetailDto,
  Section as SectionEntity,
  Lecture as LectureEntity,
  CourseReview as CourseReviewEntity,
  User as UserEntity,
} from "@/generated/openapi-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import {
  StarIcon,
  PlayCircleIcon,
  LockIcon,
  ShoppingCartIcon,
  HeartIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { getLevelText } from "@/lib/level";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { User } from "next-auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

/*****************
 * Helper Utils  *
 *****************/
function formatSecondsToMinSec(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatSecondsToHourMin(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) return `${mins}분`;
  return `${hrs}시간 ${mins}분`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const mockInstructorStats = {
  students: 1234,
  reviews: 56,
  courses: 3,
  answers: 10,
};

/*****************
 * Sub Components *
 *****************/
function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-4",
            i < rounded
              ? "fill-yellow-400 stroke-yellow-400"
              : "stroke-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

function Header({ course }: { course: CourseDetailDto }) {
  return (
    <header className="relative mb-10 text-white rounded-md p-8 flex flex-col-reverse md:flex-row md:items-center gap-6">
      <div className="absolute bg-[#0F1415] top-0 bottom-0 w-screen left-1/2 -translate-x-1/2 -z-10"></div>

      {/* Left */}
      <div className="flex-1 ">
        {course.categories?.[0] && (
          <p className="text-sm text-muted-foreground mb-1">
            {course.categories[0].name}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.title}</h1>
        {course.shortDescription && (
          <p className="text-lg text-muted-foreground mb-4">
            {course.shortDescription}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
          <StarRating rating={course.averageRating} />
          <span className="font-medium">{course.averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">
            ({course.totalReviews}개 수강평)
          </span>
          <span className="hidden md:inline">·</span>
          <span>수강생 {course.totalEnrollments.toLocaleString()}명</span>
        </div>
        <p className="text-sm text-muted-foreground">
          by {course.instructor.name}
        </p>
      </div>
      {/* Thumbnail */}
      {course.thumbnailUrl && (
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            width={256}
            height={144}
            className="rounded-md w-full h-auto object-cover"
          />
          {/* Play button overlay */}
          <button
            className="absolute inset-0 flex items-center justify-center"
            aria-label="preview"
          >
            <PlayCircleIcon className="size-16 text-white/90 drop-shadow-lg" />
          </button>
        </div>
      )}
    </header>
  );
}

function LatestReviews({ reviews }: { reviews: CourseReviewEntity[] }) {
  if (!reviews.length) return null;
  const latest = [...reviews]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 4);

  const positions: [number, number][] = [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ];

  return (
    <section className="mb-10">
      <h3 className="text-xl font-bold mb-4">최근 리뷰</h3>
      <div
        className={cn(
          "grid grid-cols-2 gap-4",
          latest.length > 2 && "grid-rows-2"
        )}
      >
        {latest.map((r, idx) => {
          const [col, row] = positions[latest.length === 1 ? 0 : idx];
          return (
            <div
              key={r.id}
              style={{ gridColumnStart: col, gridRowStart: row }}
              className="border border-gray-200 rounded-lg p-5 flex flex-col gap-3 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2">
                {r.user?.image && (
                  <Image
                    src={r.user.image}
                    alt={r.user.name || "user"}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-semibold text-gray-900">
                  {r.user?.name ?? "익명"}
                </span>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1 text-gray-700">
                {r.content}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Introduction({ course }: { course: CourseDetailDto }) {
  return (
    <section id="introduction">
      <div className="border-b border-gray-200 mb-10">
        <nav className="flex gap-8 -mb-px">
          <button className="pb-4 border-b-2 border-gray-900 font-bold text-gray-900 text-base">
            강의 소개
          </button>
          <button className="pb-4 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 text-base transition-colors">
            커리큘럼
          </button>
          <button className="pb-4 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 text-base transition-colors">
            커뮤니티
          </button>
          <button className="pb-4 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 text-base transition-colors">
            새소식
          </button>
        </nav>
      </div>

      <h2 className="text-2xl font-bold mb-8 text-gray-900">강의 소개</h2>
      <LatestReviews reviews={course.reviews} />
      {course.description && (
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:text-gray-700"
          dangerouslySetInnerHTML={{ __html: course.description }}
        />
      )}
    </section>
  );
}

function LectureRow({
  courseId,
  lecture,
  className,
}: {
  courseId: string;
  lecture: LectureEntity;
  className?: string;
}) {
  const router = useRouter();
  console.log(lecture.videoStorageInfo);
  return (
    <div
      onClick={() => {
        router.push(
          `/courses/lecture?courseId=${courseId}&lectureId=${lecture.id}`
        );
      }}
      className={cn(
        "flex items-center justify-between text-sm px-5 py-3 hover:bg-gray-50 transition-colors",
        lecture.videoStorageInfo && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {lecture.isPreview ? (
          <PlayCircleIcon className="size-4 text-[#00C471]" />
        ) : (
          <LockIcon className="size-4 text-gray-400" />
        )}
        <span className={lecture.videoStorageInfo && "underline"}>
          {lecture.title}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {lecture.isPreview && (
          <button className="cursor-pointer text-xs px-3 py-1.5 border border-gray-300 text-gray-700 font-semibold rounded hover:border-gray-400 transition-colors">
            미리보기
          </button>
        )}
        <span className="text-gray-600">
          {formatSecondsToMinSec(lecture.duration ?? 0)}
        </span>
      </div>
    </div>
  );
}

function Curriculum({
  courseId,
  sections,
}: {
  courseId: string;
  sections: SectionEntity[];
}) {
  return (
    <section id="curriculum" className="mt-16">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">커리큘럼</h2>
      <div className="border border-gray-200 rounded-lg bg-[#F8F9FA] overflow-hidden shadow-sm">
        <Accordion type="multiple" className="w-full">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <AccordionTrigger className="flex text-base font-semibold bg-[#F8F9FA] px-5 py-4 hover:bg-gray-100 transition-colors text-gray-900">
                <span className="flex-1 text-left">{section.title}</span>
                <span className="ml-2 text-sm font-medium text-gray-600">
                  {section.lectures.length}개 강의
                </span>
              </AccordionTrigger>
              <AccordionContent className="bg-white">
                <div className="flex flex-col">
                  {section.lectures
                    .sort((a, b) => a.order - b.order)
                    .map((lecture, idx) => (
                      <LectureRow
                        courseId={courseId}
                        key={lecture.id}
                        lecture={lecture}
                        className={cn(
                          idx !== section.lectures.length - 1 &&
                            "border-b border-gray-100"
                        )}
                      />
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function ReviewsSection({ reviews }: { reviews: CourseReviewEntity[] }) {
  if (!reviews.length) return null;
  return (
    <section id="reviews" className="mt-16">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">수강평</h2>
      <div className="space-y-8">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="space-y-4 pb-8 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-4">
              {r.user?.image && (
                <Image
                  src={r.user.image}
                  alt={r.user.name || "user"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {r.user?.name ?? "익명"}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <StarRating rating={r.rating} />
                  <span>{formatDate(r.createdAt)}</span>
                </div>
              </div>
            </div>
            <p className="text-base whitespace-pre-wrap leading-relaxed text-gray-700">
              {r.content}
            </p>
            {r.instructorReply && (
              <div className="ml-12 border-l-4 pl-5 border-[#00C471] bg-green-50 p-4 rounded-r">
                <p className="font-semibold mb-2 text-[#00C471]">
                  지식공유자 답변
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-700">
                  {r.instructorReply}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function InstructorBio({ instructor }: { instructor: UserEntity }) {
  return (
    <>
      <hr className="border-t border-gray-200 my-16" />
      <section id="instructor">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">
          지식공유자 소개
        </h2>
        <div className="flex gap-6">
          {instructor.image && (
            <Image
              src={instructor.image}
              alt={instructor.name || "instructor"}
              width={80}
              height={80}
              className="rounded-full object-cover w-20 h-20"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              {instructor.name}
            </h3>
            {instructor.bio && (
              <div
                className="prose max-w-none prose-p:text-gray-700 prose-p:leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: instructor.bio }}
              />
            )}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 mt-6">
              <span className="font-medium">
                수강생{" "}
                <strong className="text-gray-900">
                  {mockInstructorStats.students.toLocaleString()}
                </strong>
                명
              </span>
              <span className="font-medium">
                수강평{" "}
                <strong className="text-gray-900">
                  {mockInstructorStats.reviews}
                </strong>
                개
              </span>
              <span className="font-medium">
                답변{" "}
                <strong className="text-gray-900">
                  {mockInstructorStats.answers}
                </strong>
                개
              </span>
              <span className="font-medium">
                강의{" "}
                <strong className="text-gray-900">
                  {mockInstructorStats.courses}
                </strong>
                개
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FloatingMenu({
  user,
  course,
}: {
  user?: User;
  course: CourseDetailDto;
}) {
  const [isEnrolled, setIsEnrolled] = useState(course.isEnrolled);
  const [showEnrollSuccessDialog, setShowEnrollSuccessDialog] = useState(false);
  const router = useRouter();
  const handleCart = useCallback(() => {
    alert("장바구니 기능은 준비 중입니다.");
  }, []);

  const getFavoriteQuery = useQuery({
    queryKey: ["favorite", course.id],
    queryFn: () => api.getFavorite(course.id),
  });
  const addFovriteMutation = useMutation({
    mutationFn: () => api.addFavorite(course.id),
    onSuccess: () => {
      getFavoriteQuery.refetch();
    },
  });
  const removeFavoriteMutation = useMutation({
    mutationFn: () => api.removeFavorite(course.id),
    onSuccess: () => {
      getFavoriteQuery.refetch();
    },
  });
  const handleFavorite = useCallback(() => {
    if (user) {
      //toggle
      if (getFavoriteQuery.data?.data?.isFavorite) {
        removeFavoriteMutation.mutate();
      } else {
        addFovriteMutation.mutate();
      }
    } else {
      alert("로그인 후 이용해 주세요");
    }
  }, [user, addFovriteMutation, removeFavoriteMutation]);

  const isFavoritDisabled =
    addFovriteMutation.isPending || removeFavoriteMutation.isPending;

  const enrollMutation = useMutation({
    mutationFn: () => api.enrollCourse(course.id),
    onSuccess: () => {
      setIsEnrolled(true);
      //todo: 수강 신청 완료 Dialog 띄어주기
      setShowEnrollSuccessDialog(true);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEnroll = useCallback(() => {
    if (isEnrolled) {
      alert("이미 수강신청한 강의 입니다. 수강 화면으로 이동해주세요");
      return;
    }
    if (!user) {
      alert("로그인 후 이용해주세요");
      return;
    }
    if (course.price > 0) {
      alert("결제는 추후 예정입니다. 무료 강의를 이용해주세요.");
      return;
    }

    enrollMutation.mutate();
  }, [course, user, enrollMutation, isEnrolled]);

  const handleStartLearning = () => {
    setShowEnrollSuccessDialog(false);
    router.push(`/courses/lecture?courseId=${course.id}`);
  };

  return (
    <>
      <aside className="lg:sticky lg:top-24 lg:self-start lg:block hidden">
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md w-80">
          <div className="p-6 space-y-4 bg-white">
            <div className="space-y-1">
              {course.price > 0 &&
                (course.discountPrice ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ₩{course.discountPrice.toLocaleString()}
                      </span>
                      <span className="text-base font-bold text-red-500">
                        {Math.round(
                          ((course.price - course.discountPrice) /
                            course.price) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <span className="text-base line-through text-gray-400">
                      ₩{course.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    ₩{course.price.toLocaleString()}
                  </span>
                ))}
              {course.price === 0 && (
                <span className="txt-2xl font-bold">무료</span>
              )}
            </div>
            {isEnrolled ? (
              <button
                onClick={() =>
                  router.push(`/courses/lecture?courseId=${course.id}`)
                }
                className={cn(
                  "w-full py-3 px-4 rounded-md bg-[#00C471] hover:bg-[#00B366] text-white font-bold text-base transition-colors shadow-sm",
                  enrollMutation.isPending && "cursor-not-allowed"
                )}
              >
                학습으로 이동하기
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollMutation.isPending}
                className={cn(
                  "w-full py-3 px-4 rounded-md bg-[#00C471] hover:bg-[#00B366] text-white font-bold text-base transition-colors shadow-sm",
                  enrollMutation.isPending && "cursor-not-allowed"
                )}
              >
                수강신청 하기
              </button>
            )}

            <button
              onClick={handleCart}
              className="w-full py-3 px-4 rounded-md border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold text-gray-700 transition-colors"
            >
              바구니에 담기
            </button>
          </div>

          <div className="bg-gray-50 p-6 space-y-3 text-sm border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">지식공유자</span>
              <span className="font-semibold text-gray-900">
                {course.instructor.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">강의 수</span>
              <span className="font-semibold text-gray-900">
                {course.totalLectures}개
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">강의 시간</span>
              <span className="font-semibold text-gray-900">
                {formatSecondsToHourMin(course.totalDuration)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">난이도</span>
              <span className="font-semibold text-gray-900">
                {getLevelText(course.level)}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-around">
                <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium">폴더</span>
                </button>

                <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span className="text-xs font-medium">공유</span>
                </button>

                <button
                  onClick={handleFavorite}
                  disabled={isFavoritDisabled}
                  className={cn(
                    "p-2.5 rounded-md font-medium transition-all relative cursor-pointer",
                    getFavoriteQuery.data?.data?.isFavorite
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400",
                    isFavoritDisabled && "cursor-not-allowed"
                  )}
                  aria-label="즐겨찾기"
                >
                  <HeartIcon
                    className={cn(
                      "w-5 h-5 transition-all cursor-pointer",
                      getFavoriteQuery.data?.data?.isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-gray-700",
                      isFavoritDisabled && "cursor-not-allowed"
                    )}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  />
                  {getFavoriteQuery.data?.data?.favoriteCount ?? 0}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <Dialog
        open={showEnrollSuccessDialog}
        onOpenChange={setShowEnrollSuccessDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수강신청 완료</DialogTitle>
            <DialogDescription>
              수강신청이 완료되었어요. 강의실로 이동하여 바로 학습하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowEnrollSuccessDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleStartLearning}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              바로 학습 시작
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MobileBottomBar({
  user,
  course,
}: {
  user?: User;
  course: CourseDetailDto;
}) {
  const handleCart = () => {
    alert("장바구니 기능은 준비 중입니다.");
  };

  const getFavoriteQuery = useQuery({
    queryKey: ["favorite", course.id],
    queryFn: () => api.getFavorite(course.id),
  });
  const addFovriteMutation = useMutation({
    mutationFn: () => api.addFavorite(course.id),
    onSuccess: () => {
      getFavoriteQuery.refetch();
    },
  });
  const removeFavoriteMutation = useMutation({
    mutationFn: () => api.removeFavorite(course.id),
    onSuccess: () => {
      getFavoriteQuery.refetch();
    },
  });
  const handleFavorite = useCallback(() => {
    if (user) {
      //toggle
      if (getFavoriteQuery.data?.data?.isFavorite) {
        removeFavoriteMutation.mutate();
      } else {
        addFovriteMutation.mutate();
      }
    } else {
      alert("로그인 후 이용해 주세요");
    }
  }, [user, addFovriteMutation, removeFavoriteMutation]);

  const isFavoritDisabled =
    addFovriteMutation.isPending || removeFavoriteMutation.isPending;

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 border-t bg-white flex items-center gap-3 px-4 py-4 z-50 shadow-lg">
      <div className="flex-1">
        {course.discountPrice ? (
          <div>
            <span className="font-bold text-xl text-gray-900">
              ₩{course.discountPrice.toLocaleString()}
            </span>
            <span className="ml-2 line-through text-gray-400 text-sm">
              ₩{course.price.toLocaleString()}
            </span>
          </div>
        ) : (
          <span className="font-bold text-xl text-gray-900">
            ₩{course.price.toLocaleString()}
          </span>
        )}
      </div>
      <button className="flex-1 py-2.5 rounded-md bg-[#00C471] hover:bg-[#00B366] text-white font-bold transition-colors">
        수강신청
      </button>
      <button
        onClick={handleCart}
        className="p-2.5 rounded-md border-2 border-gray-300 hover:border-gray-400 font-medium transition-colors"
        aria-label="장바구니에 담기"
      >
        <ShoppingCartIcon className="size-5 text-gray-700" />
      </button>
      <button
        onClick={handleFavorite}
        disabled={isFavoritDisabled}
        className={cn(
          "p-2.5 rounded-md font-medium transition-all border-2 relative cursor-pointer",
          getFavoriteQuery.data?.data?.isFavorite
            ? "border-red-500 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        )}
        aria-label="즐겨찾기"
      >
        <HeartIcon
          className={cn(
            "w-5 h-5 transition-all cursor-pointer ",
            getFavoriteQuery.data?.data?.isFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-700"
          )}
          stroke="currentColor"
          viewBox="0 0 24 24"
        />
      </button>
    </div>
  );
}

export default function CourseDetailUI({
  course,
  user,
}: {
  course: CourseDetailDto;
  user?: User;
}) {
  return (
    <div className="b-10 pb-24 lg:pb-12">
      <Header course={course} />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12">
          <div className="w-full max-w-4xl">
            <Introduction course={course} />
            <InstructorBio instructor={course.instructor} />
            <Curriculum courseId={course.id} sections={course.sections} />
            <ReviewsSection reviews={course.reviews} />
          </div>
          <FloatingMenu user={user} course={course} />
        </div>
      </div>
      <MobileBottomBar user={user} course={course} />
    </div>
  );
}
