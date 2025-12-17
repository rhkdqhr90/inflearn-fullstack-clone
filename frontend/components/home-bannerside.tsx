"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  backgroundColor: string;
}

// 배너 데이터 - 필요에 따라 API에서 가져올 수 있습니다
const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "프론트엔드 개발자를 위한",
    subtitle: "7년차 엔지니어 최나실 멘토와 함께하는",
    description: "실무기반 소수정예 4주 챌린지",
    backgroundColor: "bg-green-800",
  },
  {
    id: 2,
    title: "백엔드 개발의 모든 것",
    subtitle: "현업 개발자와 함께하는",
    description: "실전 프로젝트 완성 코스",
    backgroundColor: "bg-blue-800",
  },
  {
    id: 3,
    title: "풀스택 개발자 되기",
    subtitle: "처음부터 끝까지 완성하는",
    description: "실무 중심 풀스택 트레이닝",
    backgroundColor: "bg-purple-800",
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
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <p className="text-lg mb-2">{slide.subtitle}</p>
                    <p className="text-2xl font-bold mb-2">{slide.title}</p>
                    <p className="text-xl">{slide.description}</p>
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
