import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("Moderation Pipeline", function () {
  let owner: any, user1: any, user2: any, dao: any, aiAgent: any, council: any;
  let moderationLog: Contract;
  let flagEscalator: Contract;
  let burnRegistry: Contract;
  let geoOracle: Contract;
  let countryRules: Contract;

  const postHash = ethers.keccak256(ethers.toUtf8Bytes("sample-post-1"));

  beforeEach(async function () {
    [owner, user1, user2, dao, aiAgent, council] = await ethers.getSigners();

    const ModerationLog = await ethers.getContractFactory("ModerationLog");
    moderationLog = await ModerationLog.deploy();

    const FlagEscalator = await ethers.getContractFactory("FlagEscalator");
    flagEscalator = await FlagEscalator.deploy(moderationLog.target);
    await flagEscalator.setAI(aiAgent.address);

    const BurnRegistry = await ethers.getContractFactory("BurnRegistry");
    burnRegistry = await BurnRegistry.deploy(moderationLog.target);
    await burnRegistry.setDAO(dao.address);

    const CountryRulesetManager = await ethers.getContractFactory("CountryRulesetManager");
    countryRules = await CountryRulesetManager.deploy();

    const GeoOracle = await ethers.getContractFactory("GeoOracle");
    geoOracle = await GeoOracle.deploy(countryRules.target, moderationLog.target);
  });

  it("should flag and escalate a post via user burns", async function () {
    await flagEscalator.connect(user1).burnFlag(postHash);
    await flagEscalator.connect(user2).burnFlag(postHash);
    await flagEscalator.connect(owner).burnFlag(postHash);

    const flagged = await flagEscalator.isEscalated(postHash);
    expect(flagged).to.be.true;
  });

  it("should escalate directly via AI agent", async function () {
    await flagEscalator.connect(aiAgent).aiEscalate(postHash);

    const flagged = await flagEscalator.isEscalated(postHash);
    expect(flagged).to.be.true;
  });

  it("should allow DAO to burn the post and log it", async function () {
    await burnRegistry.connect(dao).burnPost(postHash, "Hate speech");

    const log = await moderationLog.getLatestAction(postHash);
    expect(log.action).to.equal(1); // ActionType.Burned
    expect(log.reason).to.equal("Hate speech");
  });

  it("should block post visibility via GeoOracle", async function () {
    await countryRules.setCountryPolicy("CN", ["HateSpeech"]);

    await geoOracle.connect(owner).enforceGeoBlock(postHash, "CN", "HateSpeech");

    const visible = await geoOracle.isVisible(postHash, "CN");
    expect(visible).to.be.false;
  });

  it("should allow override by DAO to unban post", async function () {
    await countryRules.setCountryPolicy("CN", ["NSFW"]);

    await geoOracle.connect(owner).enforceGeoBlock(postHash, "CN", "NSFW");
    await geoOracle.connect(owner).overrideUnblock(postHash, "CN");

    const visible = await geoOracle.isVisible(postHash, "CN");
    expect(visible).to.be.true;
  });
});
