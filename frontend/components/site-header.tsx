"use client";

import { CourseCategory, User } from "@/generated/openapi-client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Flag,
  MessageCircle,
  Paperclip,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const isSiteHeaderNeeded = !pathname.match(
    /^\/course\/[0-9a-f-]+(\/edit|\/edit\/.*)$/
  );
  const [search, setSearch] = useState("");

  const router = useRouter();

  if (!isSiteHeaderNeeded) return null;
  const isCategoryNeeded =
    pathname == "/" ||
    pathname.includes("/courses") ||
    pathname.includes("/search");
  const isInstructorPage = pathname?.includes("/");

  return (
    <header className="w-full bg-white border-b border-gray-200">
      {/* 첫째 줄: 로고, 네비게이션, 지식공유, 아바타 */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/inflearn_public_logo.svg"
            alt="inflearn logo"
            width={120}
            height={40}
            className="h-10 w-auto"
            unoptimized
          />
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center gap-6">
          <Link
            href="/lectures"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span className="font-bold">강의</span>
          </Link>
          <Link
            href="/challenge"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span className="font-bold">챌린지</span>
          </Link>
          <Link
            href="/mentoring"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-bold">멘토링</span>
          </Link>
          <Link
            href="/clip"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Paperclip className="w-4 h-4" />
            <span className="font-bold">클립</span>
          </Link>
          <Link
            href="/community"
            className="flex items-center gap-1.5 text-gray-700 hover:text-green-600 transition-colors"
          >
            <Users className="w-4 h-4" />
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
      {/* 둘째 줄: 검색 바 */}
      {!isInstructorPage && (
        <div className="container mx-auto px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-center">
            <div
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-4xl px-4 py-2.5"
              style={{ width: "fit-content", minWidth: "400px" }}
            >
              <div className="flex items-center gap-1 text-gray-500">
                <Play className="w-4 h-4" />
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
      {/* 셋째 줄: 슬라이드뷰 (배너) */}
      {!isInstructorPage && (
        <div className="container mx-auto px-4 py-4">
          <div className="relative w-full h-64 bg-green-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-lg mb-2">
                7년차 엔지니어 최나실 멘토와 함께하는
              </p>
              <p className="text-2xl font-bold mb-2">
                프론트엔드 개발자를 위한
              </p>
              <p className="text-xl">실무기반 소수정예 4주 챌린지</p>
            </div>
            {/* 슬라이더 네비게이션 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1">
                <div className="w-2 h-0.5 bg-white"></div>
                <div className="w-2 h-0.5 bg-white/50"></div>
                <div className="w-2 h-0.5 bg-white/50"></div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 넷째 줄: 카테고리 리스트 */}
      <div className="header-bottom bg-white">
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
    </header>
  );
}
