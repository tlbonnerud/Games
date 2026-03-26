import { LeaderboardPage } from "@/components/hub/LeaderboardPage";

export default async function GameLeaderboardRoute({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return <LeaderboardPage initialGameId={gameId} />;
}
