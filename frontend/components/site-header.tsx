"use client";

import { CourseCategory, User } from "@/generated/openapi-client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Layers, ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { CATEGORY_ICONS } from "@/app/constants/category-icons";
import { Session } from "next-auth";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { HomeBannerSlider } from "./home-banner-side";

export default function SiteHeader({
  session,
  profile,
  categories,
}: {
  session: Session | null;
  profile?: User;
  categories: CourseCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const isSiteHeaderNeeded =
    !pathname.match(/^\/course\/[0-9a-f-]+(\/edit|\/edit\/.*)$/) &&
    !pathname.match(/^\/courses\/lecture/) &&
    pathname !== "/channeltalk";
  const [search, setSearch] = useState("");

  const router = useRouter();

  // 챌린지 상세 페이지 여부 확인
  const isChallengeDetailPage = pathname.match(/^\/challenges\/[^\/]+$/);

  const cartItemsQuery = useQuery({
    queryFn: () => api.getCartItems(),
    queryKey: ["cart-items"],
  });

  // 최신 3개 아이템만 표시
  const recentCartItems =
    cartItemsQuery?.data?.data?.items
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3) ?? [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  if (!isSiteHeaderNeeded) return null;

  if (cartItemsQuery.isLoading) {
    return <div>로딩중...</div>;
  }

  const isCategoryNeeded =
    pathname == "/" ||
    pathname.includes("/courses") ||
    pathname.includes("/search");
  const isInstructorPage =
    pathname?.includes("/instructor") ||
    pathname?.includes("/course") ||
    pathname?.includes("/create_course");

  return (
    <header className="w-full bg-white  border-gray-200">
      {/* 첫째 줄: 로고, 네비게이션, 지식공유, 아바타 */}
      <div className="container px-4 py-3 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/inflearn_public_logo.svg"
            alt="inflearn logo"
            width={117}
            height={48}
            className="h-10 w-auto"
            unoptimized
          />
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Image
              src="/icons/course.png"
              alt="강의"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <span className="font-bold">강의</span>
          </Link>
          <Link
            href="/challenges"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Image
              src="/icons/challenge.avif"
              alt="강의"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <span className="font-bold">챌린지</span>
          </Link>
          <Link
            href="/mentoring"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Image
              src="/icons/mentoring.png"
              alt="강의"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <span className="font-bold">멘토링</span>
          </Link>
          <Link
            href="/clip"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Image
              src="/icons/clip.avif"
              alt="강의"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <span className="font-bold">클립</span>
          </Link>
          <Link
            href="/community"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Image
              src="/icons/community.png"
              alt="강의"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <span className="font-bold">커뮤니티</span>
          </Link>
        </nav>

        {/* 오른쪽: 지식공유, 아바타 */}
        <div className="flex items-center gap-4">
          <Link href="/instructor">
            <Button
              variant="outline"
              className="font-semibold border-gray-200 hover:border-[#1dc078] hover:text-[#1dc078]"
            >
              지식공유자
            </Button>
          </Link>
          {/* 장바구니 아이콘 + Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {/* 🔴 장바구니 개수 뱃지 */}
                {(() => {
                  const count = cartItemsQuery?.data?.data?.totalCount ?? 0;
                  if (count <= 0) return null;
                  return (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 z-10">
                      {count > 9 ? "9+" : count}
                    </div>
                  );
                })()}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-80 p-0 bg-white border border-gray-200 shadow-lg z-[9999] rounded-lg overflow-hidden"
              align="end"
              sideOffset={8}
            >
              <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-900">수강바구니</h3>
              </div>

              {cartItemsQuery?.data?.data?.totalCount === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-white">
                  장바구니가 비어있습니다.
                </div>
              ) : (
                <>
                  <div className="max-h-[400px] overflow-y-auto bg-white">
                    {recentCartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() =>
                          router.push(`/courses/${item.course.id}`)
                        }
                      >
                        <div className="flex gap-3">
                          {item.course.thumbnailUrl && (
                            <img
                              src={item.course.thumbnailUrl}
                              alt={item.course.title}
                              className="w-20 h-14 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                              {item.course.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {item.course.instructor.name}
                            </p>
                            <div className="flex items-center gap-2">
                              {item.course.discountPrice &&
                              item.course.discountPrice < item.course.price ? (
                                <>
                                  <span className="font-bold text-sm text-gray-900">
                                    ₩{formatPrice(item.course.discountPrice)}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    ₩{formatPrice(item.course.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold text-sm text-gray-900">
                                  ₩{formatPrice(item.course.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                    <Button
                      onClick={() => router.push("/carts")}
                      className="w-full bg-[#1dc078] hover:bg-[#1dc078]/90 text-white font-medium"
                    >
                      수강바구니에서 전체보기
                    </Button>
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>
          {session ? (
            <Popover>
              <PopoverTrigger asChild>
                <div className="ml-2 cursor-pointer">
                  <Avatar>
                    {profile?.image ? (
                      <img
                        src={profile.image}
                        alt="avatar"
                        className="w-full h-8 object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback>
                        <span role="img" aria-label="user">
                          👤
                        </span>
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-56 p-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] mt-2"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-semibold text-gray-800">
                    {profile?.name || profile?.email || "내 계정"}
                  </div>
                  {profile?.email && (
                    <div className="text-xs text-gray-500 mt-1">
                      {profile.email}
                    </div>
                  )}
                </div>
                <button
                  className="w-full  text-left px-4 py-3 hover:bg-gray-100 focus:outline-none"
                  onClick={() =>
                    (window.location.href = "/my/settings/account")
                  }
                >
                  <div className="font-semibold text-gray-800">프로필 수정</div>
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none border-t border-gray-100"
                  onClick={() => signOut()}
                >
                  <div className="font-semibold text-gray-800">로그아웃</div>
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none border-t border-gray-100"
                  onClick={() => router.push("/my/courses")}
                >
                  <div className="font-semibold text-gray-800">내 학습</div>
                </button>
              </PopoverContent>
            </Popover>
          ) : (
            <Link href="/signin">
              <Button
                variant="outline"
                className="font-semibold border-gray-200 hover:border-[#1dc078] hover:text-[#1dc078] ml-2"
              >
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>
      {/* 둘째 줄: 검색 바 - 챌린지 상세에서는 숨김 */}
      {!isInstructorPage && !isChallengeDetailPage && (
        <div className="container mx-auto px-4 py-3  border-gray-100">
          <div className="flex items-center justify-center">
            <div
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-4xl px-4 py-2.5"
              style={{ width: "fit-content", minWidth: "400px" }}
            >
              <div className="flex items-center gap-1 text-gray-500">
                <Image
                  src="/icons/course.png"
                  alt="강의"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  priority
                />
                <ChevronLeft className="w-3 h-3" />
              </div>
              <input
                type="text"
                placeholder="AI 시대에 필요한 무기, 지금 배워보세요."
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 min-w-0"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (search.trim()) {
                      router.push(`/search?q=${search}`);
                    }
                  }
                }}
              />
              <button
                className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors"
                onClick={() => {
                  if (search.trim()) {
                    router.push(`/search?q=${search}`);
                  }
                }}
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 넷째 줄: 카테고리 리스트 */}
      <div className="header-bottom border-b bg-white">
        {isCategoryNeeded && (
          <nav className="category-nav container mx-auto flex flex-wrap justify-center gap-x-6 gap-y-4 py-4 px-4 items-center">
            {categories.map((category) => (
              <Link key={category.id} href={`/courses/${category.slug}`}>
                <div className="category-item flex flex-col items-center min-w-[72px] text-gray-700 hover:text-[#1dc078] cursor-pointer transition-colors">
                  {React.createElement(
                    CATEGORY_ICONS[category.slug] || CATEGORY_ICONS["default"],
                    { size: 28, className: "mb-1" }
                  )}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </nav>
        )}
      </div>
      {/* 배너 슬라이더 - 챌린지 상세에서는 숨김 */}
      {!isInstructorPage && !isChallengeDetailPage && <HomeBannerSlider />}
    </header>
  );
}
