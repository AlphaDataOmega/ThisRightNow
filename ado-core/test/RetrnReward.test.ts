import { ethers } from "hardhat";
import { expect } from "chai";

describe("Retrn Reward Flow", function () {
  let oracle: any, retrn: any, lotto: any;
  let userLowTrust: any, userHighTrust: any, posterA: any, posterB: any;

  beforeEach(async () => {
    [posterA, posterB, userLowTrust, userHighTrust] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const RetrnIndex = await ethers.getContractFactory("RetrnIndex");
    retrn = await RetrnIndex.deploy();

    const Lotto = await ethers.getContractFactory("LottoModule");
    lotto = await Lotto.deploy(retrn.target, oracle.target);

    await lotto.setPoster(1, posterA.address);
    await lotto.setPoster(2, posterB.address);

    // Set trust scores manually for test
    await retrn.setTrustScore(userLowTrust.address, 10); // low
    await retrn.setTrustScore(userHighTrust.address, 90); // high
  });

  it("should reward higher-trust retrns more", async () => {
    // Both posts get 3 retrns
    await retrn.connect(userLowTrust).retrn(1); // post A
    await retrn.connect(userLowTrust).retrn(1);
    await retrn.connect(userLowTrust).retrn(1);

    await retrn.connect(userHighTrust).retrn(2); // post B
    await retrn.connect(userHighTrust).retrn(2);
    await retrn.connect(userHighTrust).retrn(2);

    // Trigger lotto payout
    await lotto.triggerPayout();

    const rewardA = await oracle.earnedTRN(posterA.address);
    const rewardB = await oracle.earnedTRN(posterB.address);

    expect(rewardB).to.be.gt(rewardA);
  });
});

