import { expect } from "chai";
import { ethers } from "hardhat";

describe("Subscription System", function () {
  let oracle: any;
  let nft: any;
  let manager: any;
  let user: any;
  let deployer: any;

  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const NFT = await ethers.getContractFactory("SubscriptionNFT");
    nft = await NFT.deploy();

    const Manager = await ethers.getContractFactory("SubscriptionManager");
    manager = await Manager.deploy(nft.target, oracle.target);

    await nft.setManager(manager.target);
    await manager.setMintPrice(1000); // 1k TRN per month
  });

  it("should mint a subscription NFT and record TRN usage", async () => {
    await manager.connect(user).subscribe();

    expect(await nft.balanceOf(user.address)).to.equal(1);
    expect(await oracle.earnedTRN(user.address)).to.equal(-1000);
  });

  it("should auto-renew if block time advances and user has no debt", async () => {
    await manager.connect(user).subscribe();

    await oracle.clearDebt(user.address);

    await ethers.provider.send("evm_increaseTime", [32 * 86400]);
    await ethers.provider.send("evm_mine", []);

    await manager.connect(user).renew();

    expect(await oracle.earnedTRN(user.address)).to.equal(-2000);
  });

  it("should reject renewal if user has oracle debt", async () => {
    await manager.connect(user).subscribe();

    await ethers.provider.send("evm_increaseTime", [31 * 86400]);
    await ethers.provider.send("evm_mine", []);

    await expect(manager.connect(user).renew()).to.be.revertedWith("Debt unpaid");
  });

  it("should burn the NFT and permanently block resubscription", async () => {
    await manager.connect(user).subscribe();

    await manager.connect(user).cancel();

    expect(await nft.balanceOf(user.address)).to.equal(0);

    await expect(manager.connect(user).subscribe()).to.be.revertedWith("Subscription revoked");
  });

  it("should enforce hasActiveSubscription correctly", async () => {
    await manager.connect(user).subscribe();

    const result = await manager.hasActiveSubscription(user.address);
    expect(result).to.equal(true);

    await ethers.provider.send("evm_increaseTime", [40 * 86400]);
    await ethers.provider.send("evm_mine", []);

    const expired = await manager.hasActiveSubscription(user.address);
    expect(expired).to.equal(false);
  });
});
