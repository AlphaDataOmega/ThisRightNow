import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers";

describe("Boosting Refund Flow", function () {
  let oracle: any, boost: any;
  let user: any;

  beforeEach(async () => {
    [user] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const Boosting = await ethers.getContractFactory("BoostingModule");
    boost = await Boosting.deploy(oracle.target);
  });

  it("should refund TRN when boost ends early and record it in oracle", async () => {
    const boostAmount = parseEther("10");

    await boost
      .connect(user)
      ["startBoost(uint256,uint256)"](1, boostAmount);

    await boost.connect(user).simulatePostBurn(1);

    const earned = await oracle.earnedTRN(user.address);
    expect(earned).to.equal(boostAmount);
  });
});
