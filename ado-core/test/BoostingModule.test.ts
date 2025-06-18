import { expect } from "chai";
import { ethers } from "hardhat";

describe("BoostingModule", function () {
  let oracle: any;
  let booster: any;
  let boost: any;

  beforeEach(async () => {
    [booster] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const Boosting = await ethers.getContractFactory("BoostingModule");
    boost = await Boosting.deploy();
  });

  it("should start a boost campaign", async () => {
    const postHash = ethers.keccak256(ethers.toUtf8Bytes("boostPost"));

    const amount = 30; // Simulated 3x cost
    await boost.connect(booster).startBoost(postHash, amount);

    const boostData = await boost.getBoost(postHash);
    expect(boostData.booster).to.equal(booster.address);
    expect(boostData.amount).to.equal(amount);
    expect(boostData.active).to.equal(true);
  });

  it("should end a boost and simulate TRN refund", async () => {
    const postHash = ethers.keccak256(ethers.toUtf8Bytes("boostPost"));
    const amount = 90;

    await boost.connect(booster).startBoost(postHash, amount);
    await boost.endBoost(postHash);

    const boostData = await boost.getBoost(postHash);
    expect(boostData.active).to.equal(false);
  });

  it("should simulate boost + early burn refund via oracle", async () => {
    // Wire oracle logic here in full implementation
    // e.g. after boost ends, unused TRN reported as re-credited
    const postHash = ethers.keccak256(ethers.toUtf8Bytes("burnedBoost"));
    const spent = 60;

    await boost.connect(booster).startBoost(postHash, spent);
    await boost.endBoost(postHash);

    // Simulate refund: oracle removes debt
    await oracle.reportEarning(booster.address, 20, postHash);
    const balance = await oracle.getAvailableTRN(booster.address);
    expect(balance).to.equal(20);
  });
});
