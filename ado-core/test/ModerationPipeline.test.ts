import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("Moderation Pipeline Integration", function () {
  let owner: any, user1: any, user2: any, aiAgent: any, dao: any, councilMod: any;
  let moderationLog: Contract;
  let flagEscalator: Contract;
  let burnRegistry: Contract;
  let geoOracle: Contract;
  let ruleset: Contract;
  let postHash: string;

  beforeEach(async () => {
    [owner, user1, user2, aiAgent, dao, councilMod] = await ethers.getSigners();

    const ModerationLog = await ethers.getContractFactory("ModerationLog");
    moderationLog = await ModerationLog.deploy();

    const FlagEscalator = await ethers.getContractFactory("FlagEscalator");
    flagEscalator = await FlagEscalator.deploy(moderationLog.target);
    await flagEscalator.connect(owner).setAI(aiAgent.address);

    const BurnRegistry = await ethers.getContractFactory("BurnRegistry");
    burnRegistry = await BurnRegistry.deploy(moderationLog.target);
    await burnRegistry.connect(owner).setDAO(dao.address);
    await burnRegistry.connect(dao).setCouncilMod(councilMod.address);

    const CountryRulesetManager = await ethers.getContractFactory("CountryRulesetManager");
    ruleset = await CountryRulesetManager.deploy();

    const GeoOracle = await ethers.getContractFactory("GeoOracle");
    geoOracle = await GeoOracle.deploy(ruleset.target, moderationLog.target);

    postHash = ethers.keccak256(ethers.toUtf8Bytes("test-post-123"));
  });

  it("should process full flag → escalate → burn → geo-block → unblock flow", async () => {
    await flagEscalator.connect(user1).burnFlag(postHash);
    await flagEscalator.connect(user2).burnFlag(postHash);
    await flagEscalator.connect(owner).burnFlag(postHash);
    const escalated = await flagEscalator.isEscalated(postHash);
    expect(escalated).to.equal(true);

    await expect(flagEscalator.connect(aiAgent).aiEscalate(postHash)).to.be.revertedWith("Already escalated");

    await burnRegistry.connect(councilMod).burnPost(postHash, "Hate speech");
    const isBurned = await burnRegistry.isContentBurned(postHash);
    expect(isBurned).to.equal(true);

    await ruleset.setCountryPolicy("CN", ["HateSpeech"]);
    await geoOracle.enforceGeoBlock(postHash, "CN", "HateSpeech");
    const visibleInCN = await geoOracle.isVisible(postHash, "CN");
    expect(visibleInCN).to.equal(false);

    await geoOracle.connect(owner).overrideUnblock(postHash, "CN");
    const nowVisible = await geoOracle.isVisible(postHash, "CN");
    expect(nowVisible).to.equal(true);
  });
});
