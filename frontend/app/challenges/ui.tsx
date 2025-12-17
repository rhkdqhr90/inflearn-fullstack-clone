"use client";

import { useState, useEffect } from "react";
import { ChallengeList } from "@/components/challenges/challenge-list";

interface ChallengesPageUIProps {
  challenges: any[];
}

export default function UI({ challenges }: ChallengesPageUIProps) {
  const [filteredChallenges, setFilteredChallenges] = useState(challenges);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredChallenges(challenges);
    } else {
      setFilteredChallenges(
        challenges.filter((challenge) => challenge.status === activeTab)
      );
    }
  }, [activeTab, challenges]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">챌린지</h1>
        <p className="text-muted-foreground">
          함께 학습하며 목표를 달성해보세요
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setActiveTab("RECRUITING")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "RECRUITING"
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          모집 중
        </button>
        <button
          onClick={() => setActiveTab("ONGOING")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "ONGOING"
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          진행 중
        </button>
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "COMPLETED"
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          종료
        </button>
      </div>

      <ChallengeList challenges={filteredChallenges} />
    </div>
  );
}
