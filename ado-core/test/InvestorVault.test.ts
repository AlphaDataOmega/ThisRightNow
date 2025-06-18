import { expect } from "chai";
import { ethers } from "hardhat";

describe("InvestorVault distribution", function () {
  let investorVault: any;
  let investorNFT: any;
  let oracle: any;
  let owner: any;
  let investors: any[];
  let investorAddresses: string[];

  beforeEach(async () => {
    [owner, ...investors] = await ethers.getSigners();
    investorAddresses = investors.map(i => i.address);
    while (investorAddresses.length < 100) {
      investorAddresses.push(ethers.Wallet.createRandom().address);
    }

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const InvestorVault = await ethers.getContractFactory("MockInvestorVault");
    investorVault = await InvestorVault.deploy(oracle.target);

    const MockInvestorNFT = await ethers.getContractFactory("MockInvestorNFT");
    investorNFT = await MockInvestorNFT.deploy();

    // Mint all 100 InvestorNFTs
    for (let i = 0; i < 100; i++) {
      await investorNFT.mint(investorAddresses[i], i);
    }

    await investorVault.setInvestorNFT(investorNFT.target);
  });

  it("should distribute 33% of DAO revenue across 100 NFTs", async () => {
    const totalDAORevenue = 10000;
    const expectedShare = (totalDAORevenue * 33) / 100 / 100;

    await investorVault.depositRevenue(totalDAORevenue);

    for (let i = 0; i < 5; i++) {
      const balance = await investorVault.pendingClaim(i);
      expect(balance).to.equal(expectedShare);
    }
  });

  it("should allow claim and report earnings via oracle", async () => {
    const totalDAORevenue = 3000;
    const investorId = 0;

    await investorVault.depositRevenue(totalDAORevenue);

    await investorVault.connect(investors[investorId]).claim(investorId);

    const reported = await oracle.earnedTRN(investors[investorId].address);
    expect(reported).to.be.above(0);
  });
});
