"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface BannerSlide {
  id: number;
  tag?: string;
  tagColor?: string;
  title: string;
  subtitle?: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  image: string;
  imagePosition?: "left" | "right";
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    tag: "프론트엔드 개발자 필수",
    tagColor: "bg-pink-500",
    title: "Backend 101",
    subtitle: "for Frontend Developers",
    description: "NestJS와 TypeORM으로 배우는 백엔드 기초",
    backgroundColor: "bg-black",
    textColor: "text-white",
    image: "/images/backend-101.jpg",
    imagePosition: "right",
  },
  {
    id: 2,
    tag: "Next.js 14 + Supabase",
    tagColor: "bg-green-500",
    title: "풀스택 앱 개발 마스터",
    subtitle: "Instagram, Netflix, Dropbox 클론 코딩",
    description: "실전 프로젝트로 배우는 현대적인 웹 개발",
    backgroundColor: "bg-gradient-to-br from-green-600 to-emerald-700",
    textColor: "text-white",
    image: "/images/supabase-nextjs.jpg",
    imagePosition: "right",
  },
  {
    id: 3,
    tag: "Part 1",
    tagColor: "bg-white text-black",
    title: "Next × Nest",
    subtitle: "Inflearn Clone",
    description: "인프런 클론 코딩으로 배우는 풀스택 개발",
    backgroundColor:
      "bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700",
    textColor: "text-white",
    image: "/images/inflearn-clone.jpg",
    imagePosition: "right",
  },
];

const AUTO_PLAY_INTERVAL = 5000; // 5초마다 자동 전환

export function HomeBannerSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setProgress(0); // 슬라이드 변경 시 프로그레스 리셋
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // 자동 재생 및 프로그레스 바 (hover 시 정지, 진행률 유지)
  useEffect(() => {
    if (!emblaApi) return;

    let animationFrameId: number;
    let lastTime: number;
    let accumulatedTime = (progress / 100) * AUTO_PLAY_INTERVAL; // 현재 진행된 시간 복원

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;

      if (!isHovered) {
        const deltaTime = currentTime - lastTime;
        accumulatedTime += deltaTime;

        const newProgress = (accumulatedTime / AUTO_PLAY_INTERVAL) * 100;

        if (newProgress >= 100) {
          emblaApi.scrollNext();
          accumulatedTime = 0;
          setProgress(0);
        } else {
          setProgress(newProgress);
        }
      }

      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [emblaApi, selectedIndex, isHovered, progress]);

  return (
    <div className="container mx-auto px-4 py-4">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Embla Viewport */}
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="flex">
            {bannerSlides.map((slide) => (
              <div
                key={slide.id}
                className={`flex-[0_0_100%] min-w-0 ${slide.backgroundColor}`}
              >
                <div className="h-64 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      {/* 왼쪽: 텍스트 */}
                      <div className={`${slide.textColor} space-y-3`}>
                        {slide.tag && (
                          <span
                            className={`${slide.tagColor} text-xs font-bold px-3 py-1 rounded-md inline-block`}
                          >
                            {slide.tag}
                          </span>
                        )}
                        <h2 className="text-3xl lg:text-4xl font-bold">
                          {slide.title}
                        </h2>
                        {slide.subtitle && (
                          <p className="text-lg font-semibold opacity-95">
                            {slide.subtitle}
                          </p>
                        )}
                        <p className="text-sm opacity-90">
                          {slide.description}
                        </p>
                      </div>

                      {/* 오른쪽: 이미지 */}
                      <div className="relative h-48 flex items-center justify-center">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="h-full w-auto object-contain drop-shadow-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 슬라이더 네비게이션 */}
        <div className="absolute bottom-4 left-0 right-0 px-4 z-10">
          <div className="flex items-center gap-4">
            {/* 왼쪽: 화살표 버튼들 */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="이전 슬라이드"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={scrollNext}
                className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="다음 슬라이드"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 오른쪽: 프로그레스 바 - 현재 슬라이드만 표시 (전체 너비의 1/3) */}
            <div className="w-1/3 relative h-0.5 bg-white/30 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
