import { getLogsForEvent } from "@/utils/logs";
import BlessBurnTrackerABI from "@/abi/BlessBurnTracker.json";
import { parseAbiItem } from "viem";
import { getTrustScore } from "@/utils/TrustScoreEngine";

const event = parseAbiItem("event Blessed(address indexed user, bytes32 indexed postHash)");

export async function getBlessEarnings(): Promise<Record<string, number>> {
  const logs = await getLogsForEvent({
    contractName: "BlessBurnTracker",
    abi: BlessBurnTrackerABI,
    event,
    fromBlock: 0, // set to daily start if chunked
  });

  const earnings: Record<string, number> = {};

  for (const log of logs) {
    const user = log.args.user as string;

    const trust = await getTrustScore(user, "engagement.bless");
    const adjusted = (1 * trust) / 100;

    earnings[user] = (earnings[user] || 0) + adjusted;
  }

  return earnings;
}
