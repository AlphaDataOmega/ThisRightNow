import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers";

describe("PostVaultSplitter Flow", function () {
  let deployer: any;
  let oracle: any;
  let splitter: any;
  let contributorVault: any, investorVault: any, countryVault: any, daoVault: any;
  let contributor: any, investor: any, country: any;

  beforeEach(async () => {
    [deployer, contributor, investor, country] = await ethers.getSigners();

    // Deploy Oracle
    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    // Deploy Mock Vaults
    const Vault = await ethers.getContractFactory("MockVault");
    contributorVault = await Vault.deploy(oracle.target);
    investorVault = await Vault.deploy(oracle.target);
    countryVault = await Vault.deploy(oracle.target);
    daoVault = await Vault.deploy(oracle.target);

    // Deploy Splitter
    const Splitter = await ethers.getContractFactory("PostVaultSplitter");
    splitter = await Splitter.deploy(
      contributorVault.target,
      investorVault.target,
      countryVault.target,
      daoVault.target
    );
  });

  it("should split TRN from post earnings to all vaults and track it", async () => {
    const earned = parseEther("100");

    // Simulate payout
    await splitter.splitPostRevenue(1, earned); // postId = 1

    const contributorShare = await contributorVault.balance();
    const investorShare = await investorVault.balance();
    const countryShare = await countryVault.balance();
    const daoShare = await daoVault.balance();

    // Check split ratios
    expect(contributorShare).to.equal(parseEther("50")); // 50%
    expect(investorShare).to.equal(parseEther("20"));   // 20%
    expect(countryShare).to.equal(parseEther("10"));    // 10%
    expect(daoShare).to.equal(parseEther("20"));        // 20%
  });

  it("should allow vaults to report to oracle on claim", async () => {
    const earned = parseEther("100");
    await splitter.splitPostRevenue(1, earned);

    // Contributor claims 50
    await contributorVault.connect(contributor).claim();

    const earnedByUser = await oracle.earnedTRN(contributor.address);
    expect(earnedByUser).to.equal(parseEther("50"));
  });
});
