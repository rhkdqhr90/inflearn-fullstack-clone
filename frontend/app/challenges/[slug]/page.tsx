import { auth } from "@/auth";
import * as api from "@/lib/api";
import { notFound } from "next/navigation";
import UI from "./ui";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug: encodedSlug } = await params;

  const slug = decodeURIComponent(encodedSlug);
  const challengeResult = await api.getChallengeBySlug(slug);
  if (!challengeResult.data || challengeResult.error) {
    notFound();
  }

  return <UI challenge={challengeResult.data} user={session?.user} />;
}
