import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("Moderation Appeals", function () {
  let log: Contract;
  let user: any;
  let moderator: any;

  beforeEach(async () => {
    [user, moderator] = await ethers.getSigners();
    const ModerationLog = await ethers.getContractFactory("ModerationLog");
    log = await ModerationLog.deploy();
  });

  it("should submit and resolve an appeal", async () => {
    const postHash = ethers.keccak256(ethers.toUtf8Bytes("appeal-post"));

    await log.connect(user).submitAppeal(postHash, 0);

    expect(await log.appealCount()).to.equal(1);

    const initial = await log.getAppeal(0);
    expect(initial.submitter).to.equal(user.address);
    expect(initial.postHash).to.equal(postHash);
    expect(initial.resolution).to.equal(0); // AppealResolution.None

    await expect(log.connect(moderator).resolveAppeal(0, 1))
      .to.emit(log, "TrustAdjustment")
      .withArgs(user.address, 5, "AppealApproved");

    const resolved = await log.getAppeal(0);
    expect(resolved.moderator).to.equal(moderator.address);
    expect(resolved.resolution).to.equal(1); // Approved
  });
});
