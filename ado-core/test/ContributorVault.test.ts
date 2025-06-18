import { expect } from "chai";
import { ethers } from "hardhat";

describe("ContributorVault", function () {
  let vault: any;
  let nft: any;
  let oracle: any;
  let owner: any;
  let contributors: any[];

  beforeEach(async () => {
    [owner, ...contributors] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const NFT = await ethers.getContractFactory("MockContributorNFT");
    nft = await NFT.deploy();

    for (let i = 0; i < 5; i++) {
      await nft.mint(contributors[i].address, i);
    }

    const Vault = await ethers.getContractFactory("MockContributorVault");
    vault = await Vault.deploy(oracle.target);
    await vault.setContributorNFT(nft.target);
    await vault.setBeneficiary(owner.address);
  });

  it("should allow contributors to claim assigned TRN", async () => {
    const payout = 750;
    await vault.assign(0, payout);

    const pending = await vault.pendingClaim(0);
    expect(pending).to.equal(payout);

    await vault.connect(contributors[0]).claim(0);

    const earned = await oracle.earnedTRN(contributors[0].address);
    expect(earned).to.equal(payout);
  });

  it("should redirect payout after deadline passes", async () => {
    await vault.assign(1, 1000);

    // simulate >90 days passing
    await ethers.provider.send("evm_increaseTime", [91 * 86400]);
    await ethers.provider.send("evm_mine");

    await vault.reclaim(1);

    const recovered = await oracle.earnedTRN(owner.address);
    expect(recovered).to.equal(1000);
  });
});
