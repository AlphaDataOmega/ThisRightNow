import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import CountryRulesetManagerABI from "../abis/CountryRulesetManager.json";
import GeoOracleABI from "../abis/GeoOracle.json";

const postTags = JSON.parse(
  fs.readFileSync(path.join(__dirname, "output", "postTags.json"), "utf-8")
) as Record<string, string[]>;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
const signer = new ethers.Wallet(process.env.PRIV_KEY!, provider);

const RULESET_ADDRESS = "0xCountryRulesetManager";
const GEO_ORACLE_ADDRESS = "0xGeoOracle";

// List of countries to enforce
const COUNTRY_CODES = ["US", "CN", "DE", "IN", "IR"];

async function enforceGeoBlocks() {
  const rules = new ethers.Contract(RULESET_ADDRESS, CountryRulesetManagerABI, provider);
  const geo = new ethers.Contract(GEO_ORACLE_ADDRESS, GeoOracleABI, signer);

  for (const [postHash, tags] of Object.entries(postTags)) {
    for (const countryCode of COUNTRY_CODES) {
      for (const tag of tags) {
        if (tag === "None") continue;

        const banned = await rules.isCategoryBanned(countryCode, tag);
        if (banned) {
          console.log(`🌐 Blocking ${postHash} in ${countryCode} for ${tag}`);
          await geo.setGeoBlock(postHash, countryCode, tag);
        }
      }
    }
  }

  console.log("✅ All enforcement complete.");
}

enforceGeoBlocks();
