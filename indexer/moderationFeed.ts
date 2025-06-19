import { ethers } from "ethers";
import ModerationLogABI from "../abis/ModerationLog.json";
import FlagEscalatorABI from "../abis/FlagEscalator.json";
import BurnRegistryABI from "../abis/BurnRegistry.json";
import GeoOracleABI from "../abis/GeoOracle.json";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

const MOD_LOG = "0xModerationLog";
const ESCALATOR = "0xFlagEscalator";
const BURN_REGISTRY = "0xBurnRegistry";
const GEO_ORACLE = "0xGeoOracle";

async function watchModerationEvents() {
  const log = new ethers.Contract(MOD_LOG, ModerationLogABI, provider);
  const escalator = new ethers.Contract(ESCALATOR, FlagEscalatorABI, provider);
  const burn = new ethers.Contract(BURN_REGISTRY, BurnRegistryABI, provider);
  const geo = new ethers.Contract(GEO_ORACLE, GeoOracleABI, provider);

  log.on("ModerationAction", (postHash, actionType, reason, event) => {
    console.log(`📝 Action: [${actionType}] on post ${postHash}`);
    console.log(`🔍 Reason: ${reason}`);
    console.log(`⏱️ Block: ${event.blockNumber}`);
  });

  escalator.on("Escalated", (postHash, event) => {
    console.log(`🚨 Post escalated by flags: ${postHash}`);
  });

  burn.on("PostBurned", (postHash, reason, actor, event) => {
    console.log(`🔥 Post burned: ${postHash}`);
    console.log(`👤 Burned by: ${actor}`);
    console.log(`🧾 Reason: ${reason}`);
  });

  geo.on("GeoBlockSet", (postHash, countryCode, category, event) => {
    console.log(`🌐 Geo-blocked: ${postHash} in ${countryCode} for ${category}`);
  });

  geo.on("GeoBlockCleared", (postHash, countryCode, event) => {
    console.log(`✅ Geo-unblock: ${postHash} in ${countryCode}`);
  });

  console.log("👁️ Watching moderation events...");
}

watchModerationEvents();
