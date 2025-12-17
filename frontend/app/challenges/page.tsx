import * as api from "@/lib/api";

import UI from "./ui";

export default async function ChallengesPage() {
  // 서버에서 챌린지 목록 조회

  const { data, error } = await api.getAllChallenge();

  return <UI challenges={data || []} />;
}
